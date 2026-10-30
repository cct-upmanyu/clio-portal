import { CopyIcon, DownloadIcon } from '../ui/icons'
import { copyToClipboard } from '../../utils/clipboard'
import { saveFile } from '../../utils/files'

const smallButtonClass =
  'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-field bg-white px-3 text-[13px] font-semibold text-ink hover:bg-subtle'

// Newly generated backup codes with Copy / Download. They can't be shown again after this.
function BackupCodesPanel({ codes, email }) {
  const download = () => {
    const content = [
      'David Smith Law Firm - Client Portal',
      'Two-step verification backup codes',
      `Account: ${email}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      ...codes,
      '',
      'Each code can be used once if you cannot use your authenticator app.',
      'Generating new codes makes these stop working.',
    ].join('\n')
    saveFile(new Blob([content], { type: 'text/plain' }), 'client-portal-backup-codes.txt')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-lg border border-line bg-canvas p-4">
        <ul aria-label="Backup codes" className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-[15px] font-semibold tracking-wider text-ink">
          {codes.map((code) => <li key={code}>{code}</li>)}
        </ul>
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          <button type="button" onClick={() => copyToClipboard(codes.join('\n'), 'Backup codes')} className={smallButtonClass}>
            <CopyIcon className="size-4" /> Copy
          </button>
          <button type="button" onClick={download} className={smallButtonClass}>
            <DownloadIcon className="size-4" /> Download
          </button>
        </div>
      </div>
      <p className="rounded-lg border border-warning/30 bg-warning-soft px-3.5 py-2.5 text-[13px] leading-normal text-warning">
        These codes won't be shown again. Store them somewhere safe, like a password manager.
      </p>
    </div>
  )
}

export function SavedCodesCheckbox({ checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-brand" />
      I've saved my backup codes somewhere safe
    </label>
  )
}

export default BackupCodesPanel
