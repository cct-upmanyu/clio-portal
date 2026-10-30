export const labelClass = 'text-sm font-medium text-ink'

const inputBaseClass =
  'h-11 w-full rounded-lg border bg-white px-3 text-[15px] text-ink placeholder:text-muted focus:outline-none'

export const inputClass =
  `${inputBaseClass} border-field focus:border-brand focus:shadow-[0_0_0_3px_rgba(11,92,173,0.15)]`

// Use instead of inputClass (not with it) so the two never fight over the same properties
export const inputErrorClass =
  `${inputBaseClass} border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(180,35,24,0.12)]`

export const primaryButtonClass =
  'flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand text-[15px] font-semibold text-white ' +
  'hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand'

export const secondaryButtonClass =
  'flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand bg-white text-[15px] font-semibold text-brand ' +
  'hover:bg-brand-soft'

export const linkClass = 'text-sm font-medium text-brand hover:text-brand-dark'
