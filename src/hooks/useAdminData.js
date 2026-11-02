import { useSyncExternalStore } from 'react'
import { lastSyncedAt, activity as sampleActivity, matters as sampleMatters, users as sampleUsers } from '../data/adminSampleData'

// Admin console state, shared by its pages. Sample data for now; each action is where the matching
// backend call goes (TODO), so the pages won't change when it's connected.
let state = {
  users: sampleUsers,
  matters: sampleMatters.map((m) => ({ ...m, lastSyncedAt: lastSyncedAt[m.id] })),
  activity: sampleActivity,
}
const listeners = new Set()

const setState = (next) => {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const wait = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms))
const newId = (prefix) => `${prefix}${Date.now().toString(36)}`
const fullName = (user) => `${user.firstName} ${user.lastName}`
const matterLabel = (matter) => `${matter.number} · ${matter.name}`

const log = (kind, text) => [{ id: newId('a'), kind, text, at: new Date().toISOString() }, ...state.activity]

const updateUser = (userId, fields) => state.users.map((u) => (u.id === userId ? { ...u, ...fields } : u))

const addContact = (matterId, user) => state.matters.map((m) => (m.id !== matterId || m.contacts.some((c) => c.userId === user.id)
  ? m
  : { ...m, contacts: [...m.contacts, { userId: user.id, name: fullName(user), invitation: 'pending' }] }))

export const adminActions = {
  // Resolves with 'account' (new account invite) or 'matter' (an existing account invited to one more matter).
  // matterId is null for an admin, who isn't invited to a matter.
  async invite({ email, firstName, lastName, role, matterId, mfaRequired }) {
    await wait()
    const matter = state.matters.find((m) => m.id === matterId)
    const existing = state.users.find((u) => u.email === email)
    if (existing?.status === 'disabled') throw new Error("This person's access is disabled. Enable it first, then invite them again.")
    if (!matter && existing) throw new Error('A user with this email already exists.')
    if (matter?.contacts.some((c) => c.userId === existing?.id && c.invitation === 'accepted')) throw new Error('This person already has access to this matter.')

    if (existing) {
      setState({
        matters: addContact(matterId, existing),
        activity: log('invited', `${fullName(existing)} was invited to ${matterLabel(matter)}`),
      })
      return existing.status === 'active' ? 'matter' : 'account'
    }

    const user = { id: newId('u'), firstName, lastName, email, role, status: 'invited', mfaEnabled: false, mfaRequired, lastSignInAt: null, invitedAt: new Date().toISOString(), matterCount: 0 }
    setState({ users: [user, ...state.users] })
    setState(matter
      ? { matters: addContact(matterId, user), activity: log('invited', `${fullName(user)} was invited to ${matterLabel(matter)}`) }
      : { activity: log('invited', `${fullName(user)} was invited as an admin`) })
    return 'account'
  },

  async resendInvitation(user) {
    await wait()
    setState({ users: updateUser(user.id, { invitedAt: new Date().toISOString() }), activity: log('invited', `The invitation to ${fullName(user)} was sent again`) })
  },

  async setAccess(user, enabled) {
    await wait()
    setState({
      users: updateUser(user.id, { status: enabled ? 'active' : 'disabled' }),
      activity: log(enabled ? 'enabled' : 'disabled', `${fullName(user)}'s access was ${enabled ? 'enabled' : 'disabled'}`),
    })
  },

  // Removes their authenticators; with 2FA required they set it up again at next sign-in
  async resetMfa(user) {
    await wait()
    setState({ users: updateUser(user.id, { mfaEnabled: false }), activity: log('mfa', `${fullName(user)}'s 2FA was reset`) })
  },

  // Pulls the matter's latest details (status, stage, attorney, contacts) from Zoho CRM
  async resyncMatter(matter) {
    await wait(1200)
    setState({ matters: state.matters.map((m) => (m.id === matter.id ? { ...m, lastSyncedAt: new Date().toISOString() } : m)) })
  },

  async setMfaRequired(user, required) {
    await wait()
    setState({
      users: updateUser(user.id, { mfaRequired: required }),
      activity: log('mfa', `2FA is ${required ? 'now required' : 'no longer required'} for ${fullName(user)}`),
    })
  },
}

export function useAdminData() {
  return useSyncExternalStore(subscribe, () => state)
}
