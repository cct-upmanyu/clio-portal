import { Link } from 'react-router-dom'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-field bg-white text-ink hover:bg-subtle',
  danger: 'bg-danger text-white hover:bg-[#912018]',
  dangerOutline: 'border border-danger/30 bg-white text-danger hover:bg-danger-soft',
}

const sizes = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-9 px-3 text-[13px]',
}

// Renders a router Link when `to` is given, otherwise a button
function Button({ to, variant = 'primary', size = 'md', icon: Icon, loading = false, className = '', children, ...props }) {
  const classes =
    `inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg ${sizes[size]} ` +
    `font-semibold disabled:cursor-not-allowed ${loading ? 'disabled:cursor-wait' : 'disabled:opacity-50'} ${variants[variant]} ${className}`

  const content = (
    <>
      {loading ? <Spinner /> : Icon && <Icon className="size-4" />}
      {children}
    </>
  )

  if (to) return <Link to={to} className={classes} {...props}>{content}</Link>
  return (
    <button type="button" className={classes} aria-busy={loading || undefined} {...props} disabled={loading || props.disabled}>
      {content}
    </button>
  )
}

export default Button
