import { useRef, useState } from 'react'

export const OTP_LENGTH = 6

// Six single-digit boxes: typing moves forward, Backspace moves back,
// and pasting (or browser autofill) a full code fills every box.
function OtpInput({ onChange, label = 'Verification code' }) {
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(''))
  const inputs = useRef([])

  const focus = (i) => inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus()

  const update = (next) => {
    setDigits(next)
    onChange(next.join(''))
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
    <fieldset className="flex flex-col gap-2">
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
            className="h-12 w-full rounded-lg border border-field bg-white text-center text-xl sm:h-14 sm:text-[22px] font-semibold text-ink focus:border-brand focus:outline-2 focus:outline-offset-1 focus:outline-brand"
          />
        ))}
      </div>
    </fieldset>
  )
}

export default OtpInput
