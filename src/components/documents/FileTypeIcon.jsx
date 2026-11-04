// File-explorer icons: a two-tone folder, and a page with a coloured label for the file's type
const TYPES = [
  { exts: ['pdf'], label: 'PDF', color: '#E03131' },
  { exts: ['doc', 'docx', 'rtf', 'odt'], label: 'DOC', color: '#2B6CD9' },
  { exts: ['xls', 'xlsx', 'ods'], label: 'XLS', color: '#1F8A4C' },
  { exts: ['csv'], label: 'CSV', color: '#1F8A4C' },
  { exts: ['ppt', 'pptx', 'odp'], label: 'PPT', color: '#D9541E' },
  { exts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'tif', 'tiff', 'bmp'], label: 'IMG', color: '#7C4DDB' },
  { exts: ['mp4', 'mov', 'webm'], label: 'VID', color: '#C2255C' },
  { exts: ['mp3', 'm4a', 'wav'], label: 'AUD', color: '#0C8599' },
  { exts: ['zip'], label: 'ZIP', color: '#5C677D' },
  { exts: ['msg', 'eml'], label: 'MSG', color: '#1C7ED6' },
  { exts: ['txt'], label: 'TXT', color: '#6B7686' },
]
const OTHER = { label: 'FILE', color: '#8590A0' }

const typeOf = (name = '') => {
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : ''
  return TYPES.find((t) => t.exts.includes(ext)) ?? OTHER
}

export function FolderGlyph({ className = 'size-7' }) {
  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M3 8.5A3.5 3.5 0 0 1 6.5 5h5.8a2.5 2.5 0 0 1 1.9.9L16 8h9.5A3.5 3.5 0 0 1 29 11.5V13H3z" fill="#E0A100" />
      <rect x="3" y="10.5" width="26" height="17" rx="3" fill="#FFC53D" />
      <rect x="3" y="10.5" width="26" height="2" rx="1" fill="#FFD666" />
    </svg>
  )
}

export function FileGlyph({ name, className = 'size-7' }) {
  const { label, color } = typeOf(name)
  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <path d="M8 2.5h11l7.5 7.5v17.5A2.5 2.5 0 0 1 24 30H8a2.5 2.5 0 0 1-2.5-2.5v-22A2.5 2.5 0 0 1 8 2.5z" fill="#FFFFFF" stroke="#CBD2DC" />
      <path d="M19 2.5V8a2 2 0 0 0 2 2h5.5" fill="#EEF1F5" stroke="#CBD2DC" />
      <rect x="1.5" y="16" width={label.length > 3 ? 21 : 18} height="9" rx="2" fill={color} />
      <text x={label.length > 3 ? 12 : 10.5} y="22.6" textAnchor="middle" fontSize="6.4" fontWeight="700" fontFamily="system-ui, sans-serif" fill="#FFFFFF" letterSpacing="0.3">
        {label}
      </text>
    </svg>
  )
}
