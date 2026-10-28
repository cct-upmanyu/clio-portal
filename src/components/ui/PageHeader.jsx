// Slim title bar across the top of a page, with an optional action on the right
function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-line bg-white px-6 py-4 max-sm:px-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="text-xl font-bold leading-tight tracking-[-0.01em]">{title}</h1>
        {description && <p className="text-[13px] leading-normal text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export default PageHeader
