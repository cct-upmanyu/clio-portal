// Reason ('INVALID' | 'USED' | 'EXPIRED') from an emailed-link error with this `code`
// (INVITE_INVALID, RESET_LINK_INVALID), or null for any other error
export const linkProblemReason = (err, code) => (err?.data?.code === code ? err.data.details?.reason || 'INVALID' : null)
