import { useEffect, useRef, useState } from 'react'

export const OTP_LENGTH = 6

const boxClass =
  'h-12 w-full rounded-lg border bg-white text-center text-xl font-semibold text-ink focus:outline-none sm:h-14 sm:text-[22px] disabled:opacity-60'
const normalClass = 'border-field focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,92,173,0.15)]'
const errorClass = 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(180,35,24,0.12)]'

// Six single-digit boxes: typing moves forward, Backspace moves back,
// and pasting (or browser autofill) a full code fills every box.
// Remount it (change its `key`) to clear the boxes.
function OtpInput({ onChange, onComplete, label = 'Verification code', autoFocus = false, invalid = false, disabled = false, describedBy }) {
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(''))
  const inputs = useRef([])

  const focus = (i) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus()

  useEffect(() => {
    if (autoFocus) focus(0)
  }, [autoFocus])

  const update = (next) => {
    setDigits(next)
    const code = next.join('')
    onChange?.(code)
    if (code.length === OTP_LENGTH) onComplete?.(code)
  }

  const fillFrom = (start, text) => {
    const next = [...digits]
    let i = start
    for (const ch of text.replace(/\D/g, '')) {
      if (i >= OTP_LENGTH) break
      next[i++] = ch
    }
    update(next)
    focus(i)
  }

  const handleChange = (i, value) => {
    const clean = value.replace(/\D/g, '')
    if (clean.length > 1) return fillFrom(i, clean)

    const next = [...digits]
    next[i] = clean
    update(next)
    if (clean) focus(i + 1)
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault()
      const next = [...digits]
      next[i - 1] = ''
      update(next)
      focus(i - 1)
    } else if (e.key === 'ArrowLeft') {
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      focus(i + 1)
    }
  }

  const handlePaste = (i, e) => {
    e.preventDefault()
    fillFrom(i, e.clipboardData.getData('text'))
  }

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={describedBy}>
      <legend className="mb-1.5 text-sm font-medium text-ink">{label}</legend>
      <div className="grid grid-cols-6 gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el }}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            onFocus={(e) => e.target.select()}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            data-autofocus={autoFocus && i === 0 ? '' : undefined}
            aria-invalid={invalid || undefined}
            disabled={disabled}
            className={`${boxClass} ${invalid ? errorClass : normalClass}`}
          />
        ))}
      </div>
    </fieldset>
  )
}

export default OtpInput
