import { toast } from './toast'

export async function copyToClipboard(text, what = 'Text') {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copied`)
  } catch {
    toast.error('Could not copy', { description: 'Select the text and copy it manually.' })
  }
}
