const SIZES = {
  xs: 'size-8 text-[13px]',
  sm: 'size-9 text-sm',
  md: 'size-10 text-[15px]',
  lg: 'size-11 text-[15px]',
}

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')

// `inverted`: light circle for dark backgrounds (the navy drawer)
function Avatar({ name, size = 'md', inverted = false }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${inverted ? 'bg-white text-navy' : 'bg-navy text-white'} ${SIZES[size]}`}>
      {initials(name)}
    </span>
  )
}

export default Avatar
