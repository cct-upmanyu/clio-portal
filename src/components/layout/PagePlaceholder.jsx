// Stand-in for a page's content until it's built
function PagePlaceholder({ children = 'This page is coming soon.' }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <span className="text-[15px] font-semibold">Coming soon</span>
      <p className="max-w-[420px] text-sm leading-normal text-muted">{children}</p>
    </section>
  )
}

export default PagePlaceholder
