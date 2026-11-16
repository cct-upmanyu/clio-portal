// Formatted chat messages. The same allowlist as the server (backend utils/richText.js) and the CRM widget:
// text is copied as text, and only these tags and attributes are rebuilt. Anything else is dropped
// (its text kept, except inside script-like tags).

const RENAME = { STRONG: 'b', EM: 'i', STRIKE: 's', DEL: 's' }
const TAGS = new Set(['b', 'i', 'u', 's', 'a', 'ol', 'ul', 'li', 'br', 'p', 'div'])
const DROP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED', 'NOSCRIPT', 'SVG', 'MATH', 'TEXTAREA', 'SELECT'])
const MAX_DEPTH = 20

export const LIST_STYLES = {
  ol: [['decimal', '1. 2. 3.'], ['lower-alpha', 'a. b. c.'], ['upper-alpha', 'A. B. C.'], ['lower-roman', 'i. ii. iii.'], ['upper-roman', 'I. II. III.']],
  ul: [['disc', '● Disc'], ['circle', '○ Circle'], ['square', '■ Square']],
}
const STYLES = new Set(Object.values(LIST_STYLES).flat().map(([value]) => value))

const safeHref = (href) => {
  const value = String(href || '').trim()
  // Browsers ignore control characters and spaces inside a scheme ("java\tscript:")
  // oxlint-disable-next-line no-control-regex
  const scheme = value.replace(/[\u0000- ]/g, '').match(/^([a-z][a-z0-9+.-]*):/i)
  return scheme && /^(https?|mailto|tel)$/i.test(scheme[1]) ? value : null
}

export function sanitizeHtml(html) {
  const template = document.createElement('template')
  template.innerHTML = String(html || '')
  const out = document.createElement('div')
  const copy = (from, to, depth) => {
    from.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        to.appendChild(document.createTextNode(node.nodeValue))
        return
      }
      if (node.nodeType !== Node.ELEMENT_NODE || DROP.has(node.tagName.toUpperCase())) return
      const tag = RENAME[node.tagName.toUpperCase()] || node.tagName.toLowerCase()
      let el = null
      if (TAGS.has(tag) && depth < MAX_DEPTH) {
        if (tag === 'a') {
          const href = safeHref(node.getAttribute('href'))
          if (href) {
            el = document.createElement('a')
            el.setAttribute('href', href)
            el.setAttribute('target', '_blank')
            el.setAttribute('rel', 'noopener noreferrer nofollow')
          }
        } else {
          el = document.createElement(tag)
          const type = node.style?.listStyleType
          if ((tag === 'ol' || tag === 'ul') && STYLES.has(type)) el.style.listStyleType = type
        }
      }
      if (el) {
        to.appendChild(el)
        if (tag !== 'br') copy(node, el, depth + 1)
      } else {
        copy(node, to, depth)
      }
    })
  }
  copy(template.content, out, 0)
  return out.innerHTML
}

// Only paragraphs and line breaks: plain text says it all, so the message is sent as text
export const hasFormatting = (html) => /<(b|i|u|s|a|ol|ul|li)\b/i.test(html)

// What the editor says as plain text (list markers aren't part of it; the server writes those)
export const editorText = (el) => (el?.innerText || '').replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

// A typed link as a usable URL: adds https:// when missing, turns an email address into mailto:.
// '' when it doesn't look like a web, email or phone link.
export function normalizeUrl(value) {
  let v = String(value || '').trim()
  if (!v) return ''
  if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(v)) return `mailto:${v}`
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = `https://${v}`
  return /^(https?:\/\/[^\s]+\.[^\s]+|mailto:\S+|tel:[\d+()\s.-]+)$/i.test(v) ? v : ''
}
