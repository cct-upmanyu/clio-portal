import { Link } from 'react-router-dom'
import Spinner from './Spinner'

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'border border-field bg-white text-ink hover:bg-subtle',
  danger: 'bg-danger text-white hover:bg-[#912018]',
}

// Renders a router Link when `to` is given, otherwise a button
function Button({ to, variant = 'primary', icon: Icon, loading = false, className = '', children, ...props }) {
  const classes =
    `inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 ` +
    `text-sm font-semibold disabled:cursor-not-allowed ${loading ? 'disabled:cursor-wait' : 'disabled:opacity-50'} ${variants[variant]} ${className}`

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
