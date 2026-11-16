import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  LuBold, LuChevronDown, LuItalic, LuLink, LuList, LuListOrdered, LuRedo2, LuRemoveFormatting, LuUnderline, LuUndo2,
} from 'react-icons/lu'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { inputClass, labelClass } from '../auth/styles'
import { LIST_STYLES, editorText, normalizeUrl } from '../../utils/richText'

const MIN_HEIGHT = 48
const MAX_HEIGHT = 360
const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || '')
const MOD = isMac ? '⌘' : 'Ctrl+'

// Formatting is the browser's own editing (execCommand): it keeps undo/redo working with Ctrl+Z
const exec = (command, value = null) => {
  try {
    return document.execCommand(command, false, value)
  } catch {
    return false
  }
}

function ToolButton({ label, shortcut, active, disabled, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      aria-pressed={active === undefined ? undefined : active}
      disabled={disabled}
      // Keeps the selection in the editor
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-md px-1.5 disabled:cursor-default disabled:opacity-35 ${
        active ? 'bg-brand-soft text-brand' : 'text-body hover:bg-subtle hover:text-ink'
      } ${className}`}
    >
      {children}
    </button>
  )
}

const Separator = () => <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-line" />

function ListButton({ type, label, Icon, active, menuOpen, onToggle, onMenu, onStyle }) {
  return (
    <span className="relative flex shrink-0 items-center">
      <ToolButton label={label} active={active} onClick={onToggle}><Icon className="size-4" /></ToolButton>
      <ToolButton label={`${label} style`} onClick={onMenu} className="-ml-1 min-w-5 px-0.5">
        <LuChevronDown className="size-3" />
      </ToolButton>
      {menuOpen && (
        <span role="menu" className="absolute bottom-full left-0 z-20 mb-1.5 flex min-w-40 flex-col rounded-lg border border-line bg-white p-1 shadow-[0_12px_28px_rgba(10,31,61,0.16)]">
          {LIST_STYLES[type].map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="menuitem"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onStyle(value)}
              className="cursor-pointer whitespace-nowrap rounded-md px-2.5 py-1.5 text-left text-[13px] text-ink hover:bg-subtle"
            >
              {text}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

// The chat's message box: a formatting toolbar over an editor whose height can be dragged.
// `ref` gets { html(), text(), clear(), focus() }. Enter calls onSubmit (inside a list it starts the next
// item); Shift+Enter is a new line. Pasted text loses its formatting; pasted or dropped files go to onFiles.
function RichTextInput({ ref, placeholder = 'Type a message...', onChange, onSubmit, onFiles }) {
  const editorRef = useRef(null)
  const savedRange = useRef(null)
  const [empty, setEmpty] = useState(true)
  const [state, setState] = useState({})
  const [menu, setMenu] = useState(null)
  const [link, setLink] = useState(null)
  const [height, setHeight] = useState(72)

  const inEditor = useCallback(() => {
    const sel = window.getSelection()
    return sel?.rangeCount && editorRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer) ? sel : null
  }, [])

  const closest = useCallback((test) => {
    const sel = inEditor()
    for (let node = sel?.anchorNode; node && node !== editorRef.current; node = node.parentNode) {
      if (node.nodeType === Node.ELEMENT_NODE && test(node)) return node
    }
    return null
  }, [inEditor])
  const currentList = useCallback(() => closest((n) => n.tagName === 'OL' || n.tagName === 'UL'), [closest])

  const refresh = useCallback(() => {
    const has = Boolean(inEditor())
    const query = (c) => { try { return document.queryCommandState(c) } catch { return false } }
    const enabled = (c) => { try { return document.queryCommandEnabled(c) } catch { return true } }
    const list = has ? currentList() : null
    setState({
      bold: has && query('bold'),
      italic: has && query('italic'),
      underline: has && query('underline'),
      ol: list?.tagName === 'OL',
      ul: list?.tagName === 'UL',
      link: has && Boolean(closest((n) => n.tagName === 'A')),
      undo: enabled('undo'),
      redo: enabled('redo'),
    })
  }, [inEditor, currentList, closest])

  const changed = useCallback(() => {
    const el = editorRef.current
    if (!el) return
    const text = editorText(el)
    setEmpty(!text && !el.querySelector('li'))
    onChange?.(text)
    refresh()
  }, [onChange, refresh])

  useEffect(() => {
    const onSelection = () => refresh()
    document.addEventListener('selectionchange', onSelection)
    return () => document.removeEventListener('selectionchange', onSelection)
  }, [refresh])

  useEffect(() => {
    if (!menu) return undefined
    const close = (e) => { if (!e.target.closest?.('[role="menu"]')) setMenu(null) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menu])

  useImperativeHandle(ref, () => ({
    html: () => editorRef.current?.innerHTML || '',
    text: () => editorText(editorRef.current),
    clear: () => {
      if (editorRef.current) editorRef.current.innerHTML = ''
      changed()
    },
    focus: () => editorRef.current?.focus(),
  }), [changed])

  const focusEditor = () => {
    if (document.activeElement !== editorRef.current) editorRef.current?.focus()
  }
  const run = (command) => {
    focusEditor()
    if (command === 'clear') {
      exec('removeFormat')
      exec('unlink')
    } else {
      exec(command)
    }
    changed()
  }
  const setList = (type, style) => {
    focusEditor()
    let list = currentList()
    if (!list || list.tagName.toLowerCase() !== type) {
      exec(type === 'ol' ? 'insertOrderedList' : 'insertUnorderedList')
      list = currentList()
    }
    if (list && style) list.style.listStyleType = style
    setMenu(null)
    changed()
  }

  const openLink = () => {
    const sel = inEditor()
    const anchor = closest((n) => n.tagName === 'A')
    savedRange.current = sel ? sel.getRangeAt(0).cloneRange() : null
    const needText = !anchor && (!savedRange.current || savedRange.current.collapsed)
    setLink({ anchor, needText, url: anchor?.getAttribute('href') || '', text: '', error: '' })
  }
  const saveLink = (e) => {
    e.preventDefault()
    const url = normalizeUrl(link.url)
    if (!url) {
      setLink({ ...link, error: 'Enter a web address, e.g. https://example.com' })
      return
    }
    const el = editorRef.current
    el.focus()
    if (savedRange.current) {
      const sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
    if (link.anchor) {
      link.anchor.setAttribute('href', url)
    } else if (link.needText) {
      const a = document.createElement('a')
      a.href = url
      a.textContent = link.text.trim() || url
      const holder = document.createElement('div')
      holder.appendChild(a)
      exec('insertHTML', `${holder.innerHTML}&nbsp;`)
    } else {
      exec('createLink', url)
    }
    setLink(null)
    changed()
  }

  const handleKeyDown = (e) => {
    const mod = e.ctrlKey || e.metaKey
    if (mod && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      openLink()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !mod && !e.nativeEvent.isComposing && !closest((n) => n.tagName === 'LI')) {
      e.preventDefault()
      onSubmit?.()
    }
  }

  const handlePaste = (e) => {
    const files = [...(e.clipboardData?.files || [])]
    e.preventDefault()
    if (files.length > 0) {
      onFiles?.(files)
      return
    }
    const text = e.clipboardData?.getData('text/plain')
    if (text) exec('insertText', text)
    changed()
  }

  const startResize = (e) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = editorRef.current?.offsetHeight || height
    const move = (ev) => setHeight(Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, startHeight + (startY - ev.clientY))))
    const up = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  return (
    <>
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag to resize the message box"
        title="Drag to resize"
        onPointerDown={startResize}
        className="group flex cursor-ns-resize touch-none justify-center pb-2 pt-1.5"
      >
        <span className="h-1 w-9 rounded-full bg-line group-hover:bg-field" />
      </div>

      <div className="rounded-xl border border-field bg-white focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(11,92,173,0.15)]">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b border-line px-1.5 py-1">
          <ToolButton label="Bold" shortcut={`${MOD}B`} active={!!state.bold} onClick={() => run('bold')}><LuBold className="size-4" /></ToolButton>
          <ToolButton label="Italic" shortcut={`${MOD}I`} active={!!state.italic} onClick={() => run('italic')}><LuItalic className="size-4" /></ToolButton>
          <ToolButton label="Underline" shortcut={`${MOD}U`} active={!!state.underline} onClick={() => run('underline')}><LuUnderline className="size-4" /></ToolButton>
          <ToolButton label="Clear formatting" onClick={() => run('clear')}><LuRemoveFormatting className="size-4" /></ToolButton>
          <Separator />
          <ListButton
            type="ol" label="Numbered list" Icon={LuListOrdered} active={!!state.ol} menuOpen={menu === 'ol'}
            onToggle={() => run('insertOrderedList')} onMenu={() => setMenu(menu === 'ol' ? null : 'ol')} onStyle={(s) => setList('ol', s)}
          />
          <ListButton
            type="ul" label="Bulleted list" Icon={LuList} active={!!state.ul} menuOpen={menu === 'ul'}
            onToggle={() => run('insertUnorderedList')} onMenu={() => setMenu(menu === 'ul' ? null : 'ul')} onStyle={(s) => setList('ul', s)}
          />
          <Separator />
          <ToolButton label="Insert link" shortcut={`${MOD}K`} active={!!state.link} onClick={openLink}><LuLink className="size-4" /></ToolButton>
          <Separator />
          <ToolButton label="Undo" shortcut={`${MOD}Z`} disabled={state.undo === false} onClick={() => run('undo')}><LuUndo2 className="size-4" /></ToolButton>
          <ToolButton label="Redo" shortcut={isMac ? '⌘⇧Z' : 'Ctrl+Y'} disabled={state.redo === false} onClick={() => run('redo')}><LuRedo2 className="size-4" /></ToolButton>
        </div>

        <div
          id="message-input"
          ref={editorRef}
          role="textbox"
          aria-multiline="true"
          aria-label="Message"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          data-empty={empty || undefined}
          onInput={changed}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          style={{ height }}
          className="rich-text rich-editor overflow-y-auto break-words px-3 py-2.5 text-sm leading-relaxed text-ink outline-none"
        />
      </div>

      <Modal
        open={Boolean(link)}
        onClose={() => setLink(null)}
        title={link?.anchor ? 'Edit link' : 'Insert link'}
        footer={(
          <>
            <Button variant="secondary" size="sm" onClick={() => setLink(null)}>Cancel</Button>
            <Button size="sm" type="submit" form="rich-link-form">{link?.anchor ? 'Save link' : 'Insert link'}</Button>
          </>
        )}
      >
        {link && (
          <form id="rich-link-form" onSubmit={saveLink} className="flex flex-col gap-4">
            {link.needText && (
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>Text to show</span>
                <input className={inputClass} value={link.text} placeholder="e.g. Court website" onChange={(e) => setLink({ ...link, text: e.target.value })} />
              </label>
            )}
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Link</span>
              <input
                className={inputClass}
                value={link.url}
                placeholder="https://"
                autoFocus
                onChange={(e) => setLink({ ...link, url: e.target.value, error: '' })}
                aria-invalid={Boolean(link.error)}
              />
              {link.error && <span className="text-[13px] text-danger">{link.error}</span>}
            </label>
          </form>
        )}
      </Modal>
    </>
  )
}

export default RichTextInput
