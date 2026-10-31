// Reason ('INVALID' | 'USED' | 'EXPIRED' | 'DISABLED') from an emailed-link error with this `code`
// (INVITE_INVALID, RESET_LINK_INVALID), or null for any other error
export const linkProblemReason = (err, code) => {
  if (err?.data?.code === 'ACCOUNT_DISABLED') return 'DISABLED'
  return err?.data?.code === code ? err.data.details?.reason || 'INVALID' : null
}
