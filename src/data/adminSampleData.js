// Sample data for the admin console until its backend endpoints exist.
// Dates are relative to today so "2 days ago" style labels always make sense.

const at = (daysAgo, hours = 10, minutes = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const ROLES = [
  { id: '36245000000261716', name: 'Client' },
  { id: '36245000000261715', name: 'Admin' },
  { id: '36245000000261714', name: 'Super admin' },
]

// The roles an invitation can give; super admins aren't created from the portal
export const INVITABLE_ROLES = ROLES.filter((role) => role.name !== 'Super admin')

export const roleName = (roleId) => ROLES.find((role) => role.id === String(roleId))?.name ?? 'Unknown role'

export const users = [
  { id: 'u1', firstName: 'David', lastName: 'Smith', email: 'david@davidsmith.law', role: '36245000000261714', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(0, 9, 12), matterCount: 0 },
  { id: 'u2', firstName: 'Priya', lastName: 'Nair', email: 'priya@davidsmith.law', role: '36245000000261715', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(1, 16, 40), matterCount: 0 },
  { id: 'u3', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', role: '36245000000261716', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(0, 8, 5), matterCount: 2 },
  { id: 'u4', firstName: 'Marcus', lastName: 'Lee', email: 'marcus.lee@example.com', role: '36245000000261716', status: 'active', mfaEnabled: false, mfaRequired: false, lastSignInAt: at(3, 19, 22), matterCount: 1 },
  { id: 'u5', firstName: 'Elena', lastName: 'Garcia', email: 'elena.garcia@example.com', role: '36245000000261716', status: 'invited', mfaEnabled: false, mfaRequired: true, lastSignInAt: null, invitedAt: at(1, 11), matterCount: 0 },
  { id: 'u6', firstName: 'Tom', lastName: 'Becker', email: 'tom.becker@example.com', role: '36245000000261716', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(6, 14, 3), matterCount: 1 },
  { id: 'u7', firstName: 'Aisha', lastName: 'Khan', email: 'aisha.khan@example.com', role: '36245000000261716', status: 'disabled', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(40, 10, 30), matterCount: 1 },
  { id: 'u8', firstName: 'Robert', lastName: 'Chen', email: 'robert.chen@example.com', role: '36245000000261716', status: 'invited', mfaEnabled: false, mfaRequired: true, lastSignInAt: null, invitedAt: at(4, 15), matterCount: 0 },
  { id: 'u9', firstName: 'Sofia', lastName: 'Rossi', email: 'sofia.rossi@example.com', role: '36245000000261716', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(2, 12, 45), matterCount: 1 },
  { id: 'u10', firstName: 'Kevin', lastName: "O'Brien", email: 'kevin.obrien@example.com', role: '36245000000261716', status: 'active', mfaEnabled: false, mfaRequired: true, lastSignInAt: at(9, 9, 0), matterCount: 1 },
  { id: 'u11', firstName: 'Hannah', lastName: 'Wright', email: 'hannah@davidsmith.law', role: '36245000000261715', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(0, 7, 55), matterCount: 0 },
  { id: 'u12', firstName: 'Liam', lastName: 'Patel', email: 'liam.patel@example.com', role: '36245000000261716', status: 'active', mfaEnabled: true, mfaRequired: true, lastSignInAt: at(12, 17, 10), matterCount: 1 },
]

// contacts: the clients on the matter and where their invitation stands
export const matters = [
  { id: 'm821', crmMatterId: '6543210000001821', number: '2026-10-00821', name: 'Estate planning', status: 'Open', stage: 'Document review', attorney: 'David Smith', openedOn: '2026-10-01', contacts: [{ userId: 'u3', name: 'Jane Doe', invitation: 'accepted' }] },
  { id: 'm822', crmMatterId: '6543210000001822', number: '2026-10-00822', name: 'Business formation', status: 'Open', stage: 'Intake', attorney: 'David Smith', openedOn: '2026-10-20', contacts: [{ userId: 'u3', name: 'Jane Doe', invitation: 'accepted' }, { userId: 'u4', name: 'Marcus Lee', invitation: 'accepted' }] },
  { id: 'm830', crmMatterId: '6543210000001830', number: '2026-10-00830', name: 'Divorce proceedings', status: 'Pending', stage: 'Intake', attorney: 'Priya Nair', openedOn: '2026-10-27', contacts: [{ userId: 'u5', name: 'Elena Garcia', invitation: 'pending' }] },
  { id: 'm831', crmMatterId: '6543210000001831', number: '2026-10-00831', name: 'Commercial lease review', status: 'Open', stage: 'Negotiation', attorney: 'David Smith', openedOn: '2026-10-28', contacts: [{ userId: 'u6', name: 'Tom Becker', invitation: 'accepted' }] },
  { id: 'm832', crmMatterId: '6543210000001832', number: '2026-10-00832', name: 'Personal injury claim', status: 'Pending', stage: 'Intake', attorney: 'Priya Nair', openedOn: '2026-10-29', contacts: [{ userId: 'u8', name: 'Robert Chen', invitation: 'pending' }] },
  { id: 'm815', crmMatterId: '6543210000001815', number: '2026-09-00815', name: 'Trademark registration', status: 'Open', stage: 'Filing', attorney: 'Hannah Wright', openedOn: '2026-09-18', contacts: [{ userId: 'u9', name: 'Sofia Rossi', invitation: 'accepted' }] },
  { id: 'm809', crmMatterId: '6543210000001809', number: '2026-09-00809', name: 'Employment dispute', status: 'Open', stage: 'Discovery', attorney: 'David Smith', openedOn: '2026-09-09', contacts: [{ userId: 'u10', name: "Kevin O'Brien", invitation: 'accepted' }] },
  { id: 'm790', crmMatterId: '6543210000001790', number: '2026-09-00790', name: 'Real estate closing', status: 'Closed', stage: 'Closed', attorney: 'David Smith', openedOn: '2026-09-03', contacts: [{ userId: 'u7', name: 'Aisha Khan', invitation: 'accepted' }] },
  { id: 'm776', crmMatterId: '6543210000001776', number: '2026-08-00776', name: 'Contract review', status: 'Closed', stage: 'Closed', attorney: 'Hannah Wright', openedOn: '2026-08-14', contacts: [{ userId: 'u12', name: 'Liam Patel', invitation: 'accepted' }] },
  { id: 'm840', crmMatterId: '6543210000001840', number: '2026-10-00840', name: 'Probate administration', status: 'Pending', stage: 'Intake', attorney: 'Priya Nair', openedOn: '2026-10-31', contacts: [] },
]

// Newest first
export const activity = [
  { id: 'a1', kind: 'accepted', text: 'Jane Doe accepted the invitation to 2026-10-00822 · Business formation', at: at(0, 8, 6) },
  { id: 'a2', kind: 'invited', text: 'Elena Garcia was invited to 2026-10-00830 · Divorce proceedings', at: at(1, 11) },
  { id: 'a3', kind: 'mfa', text: 'Tom Becker set up 2FA', at: at(2, 9, 40) },
  { id: 'a4', kind: 'invited', text: 'Robert Chen was invited to 2026-10-00832 · Personal injury claim', at: at(4, 15) },
  { id: 'a5', kind: 'disabled', text: "Aisha Khan's access was disabled", at: at(5, 10, 15) },
]

// What a matter's detail page shows, until the CRM sync and chat endpoints are connected.
// Messages are from the firm's side: fromMe = sent by the firm.
const DETAILS = {
  m821: {
    messages: [
      { id: 'x1', author: 'David Smith', fromMe: true, sentAt: at(3, 10, 15), body: 'Welcome to the client portal, Jane. You can message me here anytime about your estate plan.' },
      { id: 'x2', author: 'Jane Doe', fromMe: false, sentAt: at(3, 10, 42), body: 'Thank you! Should I send the list of assets here as well?' },
      { id: 'x3', author: 'David Smith', fromMe: true, sentAt: at(3, 10, 50), body: 'Yes, please attach it here or upload it under Documents.' },
      { id: 'x4', author: 'Jane Doe', fromMe: false, sentAt: at(1, 16, 5), body: "Here's the asset list we discussed.", attachment: { name: 'Asset list.pdf', size: 96_400 } },
      { id: 'x5', author: 'David Smith', fromMe: true, sentAt: at(0, 9, 12), body: "I've uploaded the engagement agreement. Please review and sign when you can." },
    ],
    tasks: [
      { id: 't1', title: 'Provide beneficiary details', description: 'Names and contact details for each beneficiary.', due: at(1, 17), status: 'outstanding' },
      { id: 't2', title: 'Sign the engagement agreement', description: 'Review the agreement in Documents, then sign and upload it.', due: at(-3, 17), status: 'outstanding' },
      { id: 't3', title: 'Upload a list of your assets', due: at(2, 17), status: 'completed', completedAt: at(1, 16, 5) },
    ],
    events: [
      { id: 'e1', month: 'Nov', day: '04', title: 'Initial consultation', time: 'Wed · 10:00 – 11:00 AM', place: 'Video call' },
      { id: 'e2', month: 'Nov', day: '18', title: 'Document signing', time: 'Wed · 2:00 – 2:30 PM', place: '1919 Decatur St., Houston' },
    ],
  },
  m822: {
    messages: [
      { id: 'x20', author: 'David Smith', fromMe: true, sentAt: at(1, 11, 4), body: "Could you confirm the company name you'd like to register?" },
      { id: 'x21', author: 'Marcus Lee', fromMe: false, sentAt: at(0, 8, 30), body: "We'd like to go with Lee & Doe Holdings LLC, if it's available." },
    ],
    tasks: [
      { id: 't20', title: 'Complete the operating agreement questionnaire', description: 'Found under Documents.', due: at(-8, 17), status: 'outstanding' },
    ],
    events: [
      { id: 'e3', month: 'Nov', day: '12', title: 'Filing review', time: 'Thu · 3:00 – 3:30 PM', place: 'Video call' },
    ],
  },
}

export const matterDetails = (matterId) => DETAILS[matterId] ?? { messages: [], tasks: [], events: [] }

// When each matter last synced from Zoho CRM
export const lastSyncedAt = Object.fromEntries(matters.map((m, i) => [m.id, at(0, 7 - (i % 5), 30)]))
