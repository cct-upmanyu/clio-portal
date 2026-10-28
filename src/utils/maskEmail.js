// "jane.doe@example.com" -> "j•••••@example.com" (fixed length, so the real length isn't revealed)
export function maskEmail(email) {
  const [name, domain] = String(email).split('@')
  if (!name || !domain) return email
  return `${name[0]}•••••@${domain}`
}
