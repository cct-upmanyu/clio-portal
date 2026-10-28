import { DocumentIcon, FileIcon, ImageIcon } from './icons'
import { fileKind } from '../../utils/files'

const KINDS = {
  pdf: { icon: DocumentIcon, tile: 'bg-danger-soft text-danger' },
  image: { icon: ImageIcon, tile: 'bg-brand-soft text-brand' },
  file: { icon: FileIcon, tile: 'bg-subtle text-body' },
}

// Colored icon square for a file, picked from its extension
function FileTile({ name, size = 'md' }) {
  const { icon: Icon, tile } = KINDS[fileKind(name)]
  const sizing = size === 'lg' ? 'size-14 rounded-xl' : size === 'sm' ? 'size-8 rounded-lg' : 'size-9 rounded-lg'
  const iconSize = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-4' : 'size-[18px]'

  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center ${sizing} ${tile}`}>
      <Icon className={iconSize} />
    </span>
  )
}

export default FileTile
