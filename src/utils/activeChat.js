// The matter whose chat is on screen and visible right now: its new messages are read as they arrive,
// so they don't count as unread anywhere else.
let active = null

export const setActiveChat = (crmMatterId) => {
  active = crmMatterId ? String(crmMatterId) : null
}

export const isActiveChat = (crmMatterId) => active !== null && active === String(crmMatterId)
