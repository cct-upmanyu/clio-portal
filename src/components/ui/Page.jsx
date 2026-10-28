// Frame every page wraps itself in: fills the area below the top bar edge to edge
// (no outer margin); the title bar and sections keep their own inner padding.
// `scroll={false}` for pages that scroll internally; `className` styles the frame.
function Page({ scroll = true, className = '', children }) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col bg-white ${scroll ? 'overflow-y-auto' : 'overflow-hidden'} ${className}`}>
      {children}
    </div>
  )
}

export default Page
