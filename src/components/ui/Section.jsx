// Full-width page block; stacked sections are separated by a divider line
function Section({ as: Tag = 'section', className = '', children, ...props }) {
  return (
    <Tag className={`flex flex-col gap-2 border-b border-line bg-white px-6 py-5 last:border-b-0 max-sm:px-4 ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Section
