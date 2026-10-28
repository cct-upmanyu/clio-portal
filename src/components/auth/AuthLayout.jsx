import logo from '../../assets/Firm_Logo.webp'

function AuthLayout({ children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas px-4 py-10 text-ink max-sm:gap-4 max-sm:py-5">
      <img src={logo} alt="David Smith Law Firm, PLLC" className="h-16 w-auto rounded-md max-sm:h-12" />

      <main className="flex w-full max-w-[460px] flex-col gap-5 rounded-xl border border-line bg-white px-8 py-8 max-sm:gap-4 max-sm:px-5 max-sm:py-6">
        {children}
      </main>

      {footer && <p className="max-w-[460px] text-center text-[13px] leading-normal text-muted">{footer}</p>}
    </div>
  )
}

export function AuthHeading({ title, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-bold leading-tight max-sm:text-[22px]">{title}</h1>
      {children && <p className="text-[15px] leading-normal text-muted max-sm:text-sm">{children}</p>}
    </div>
  )
}

export default AuthLayout
