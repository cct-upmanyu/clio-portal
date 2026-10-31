import { forwardRef } from 'react'
import { inputClass, inputErrorClass, labelClass } from './styles'

const EmailField = forwardRef(function EmailField({ id, value, onChange, onBlur, error, autoFocus }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass}>Email</label>
      <input
        ref={ref}
        id={id}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoFocus={autoFocus}
        autoComplete="email"
        placeholder="you@example.com"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? inputErrorClass : inputClass}
      />
      {error && <span id={`${id}-error`} className="text-[13px] text-danger">{error}</span>}
    </div>
  )
})

export default EmailField
