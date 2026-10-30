import { forwardRef, useState } from 'react'
import { EyeIcon, EyeOffIcon } from '../ui/icons'
import { inputClass, inputErrorClass, labelClass } from './styles'

const PasswordInput = forwardRef(function PasswordInput(
  { id, label, value, onChange, onBlur, autoComplete, placeholder, labelAside, invalid, error },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const hasError = invalid || Boolean(error)
  const errorId = `${id}-error`

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className={labelClass}>{label}</label>
        {labelAside}
      </div>
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${hasError ? inputErrorClass : inputClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center text-muted hover:text-ink"
        >
          {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      </div>
      {error && <span id={errorId} className="text-[13px] text-danger">{error}</span>}
    </div>
  )
})

export default PasswordInput
