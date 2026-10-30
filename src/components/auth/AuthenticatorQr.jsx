import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Spinner from '../ui/Spinner'
import { CopyIcon } from '../ui/icons'
import { linkClass } from './styles'
import { copyToClipboard } from '../../utils/clipboard'

const SIZE = 168

// QR code for an otpauth:// URL, with the setup key behind "Can't scan it?"
function AuthenticatorQr({ otpauthUrl, secret }) {
  const [dataUrl, setDataUrl] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    // Drawn at 2x so it stays sharp (and scannable) on high-density screens
    QRCode.toDataURL(otpauthUrl, { width: SIZE * 2, margin: 1, color: { dark: '#10213A', light: '#FFFFFF' } })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [otpauthUrl])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-lg border border-line bg-white p-2">
        {dataUrl
          ? <img src={dataUrl} alt="QR code for your authenticator app" width={SIZE} height={SIZE} className="size-[168px]" />
          : <div className="flex size-[168px] items-center justify-center text-brand"><Spinner className="size-6" /></div>}
      </div>

      {showKey ? (
        <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-canvas px-3.5 py-2.5">
          <code className="break-words font-mono text-[13px] font-semibold text-ink">{secret.match(/.{1,4}/g).join(' ')}</code>
          <button
            type="button"
            onClick={() => copyToClipboard(secret, 'Setup key')}
            aria-label="Copy setup key"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
          >
            <CopyIcon className="size-4" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowKey(true)} className={`${linkClass} cursor-pointer text-[13px]`}>
          Can't scan it? Enter a setup key instead
        </button>
      )}
    </div>
  )
}

export default AuthenticatorQr
