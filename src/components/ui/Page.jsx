// Outer frame every page wraps itself in: a slim margin and one white panel.
// `scroll={false}` for pages that scroll internally (Messages); `className` styles the panel.
function Page({ scroll = true, className = '', children }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 max-sm:p-3">
      <div
        className={`flex min-h-0 flex-1 flex-col rounded-xl border border-line bg-white ${scroll ? 'overflow-y-auto' : 'overflow-hidden'} ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export default Page
