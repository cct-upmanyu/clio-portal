import { SearchIcon } from '../ui/icons'

// className: sizing from the parent, e.g. flex-1 inside a toolbar row
function SearchField({ label, placeholder, value, onChange, className = '' }) {
  return (
    <div className={`relative h-10 min-w-0 sm:max-w-[360px] max-sm:h-9 max-sm:w-full ${className}`}>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full rounded-lg border border-field bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted max-sm:text-[13px] focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,92,173,0.15)] focus:outline-none"
      />
    </div>
  )
}

export default SearchField
