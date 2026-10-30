import { useState } from 'react'
import Button from '../../components/ui/Button'
import Section from '../../components/ui/Section'
import Spinner from '../../components/ui/Spinner'
import { InfoIcon, KeyIcon, PlusIcon, RefreshIcon, ShieldIcon } from '../../components/ui/icons'
import AddAuthenticatorDialog from '../../components/settings/AddAuthenticatorDialog'
import RegenerateBackupCodesDialog from '../../components/settings/RegenerateBackupCodesDialog'
import { useGetMfaFactorsQuery } from '../../redux/api/authApi'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { formatDate, formatShort } from '../../utils/dates'

const LOW_BACKUP_CODES = 3

function StatusBadge({ on }) {
  return (
    <span className={`inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-xs font-semibold ${on ? 'bg-success-soft text-success' : 'bg-subtle text-muted'}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {on ? 'On' : 'Off'}
    </span>
  )
}

function SecuritySettings() {
  const { data, isLoading } = useGetMfaFactorsQuery()
  const { email } = useCurrentUser()
  // 'add' | 'codes' | null; a new key per opening so each dialog starts from step 1
  const [dialog, setDialog] = useState(null)
  const [dialogKey, setDialogKey] = useState(0)

  const mfa = data?.data
  const atLimit = mfa && mfa.factors.length >= mfa.maxFactors

  const openDialog = (name) => {
    setDialogKey((k) => k + 1)
    setDialog(name)
  }
  const closeDialog = () => setDialog(null)

  return (
    <>
      <Section className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              Two-step verification
              {mfa && <StatusBadge on={mfa.mfaEnabled} />}
            </h2>
            <p className="max-w-[560px] text-[13px] leading-normal text-muted">
              After your password, you'll enter a code from an authenticator app. This keeps your matters safe even if someone learns your password.
            </p>
          </div>
          {mfa?.mfaEnabled && (
            <Button icon={PlusIcon} onClick={() => openDialog('add')} disabled={atLimit}>Add authenticator</Button>
          )}
        </div>

        {isLoading || !mfa ? (
          <div className="flex justify-center py-8 text-brand"><Spinner className="size-6" /></div>
        ) : !mfa.mfaEnabled ? (
          <div className="flex gap-3 rounded-lg border border-line bg-canvas px-4 py-3">
            <InfoIcon className="mt-px size-5 shrink-0 text-brand" />
            <p className="text-sm leading-normal text-body">
              Two-step verification isn't turned on for your account. Contact your attorney's office if you'd like to use it.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-muted">Authenticator apps</h3>
              <ul className="flex flex-col divide-y divide-divider rounded-lg border border-line">
                {mfa.factors.map((factor) => (
                  <li key={factor.id} className="flex items-center gap-3 px-4 py-3">
                    <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <ShieldIcon className="size-[18px]" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold">{factor.label || 'Authenticator app'}</span>
                      <span className="text-xs text-muted">
                        {factor.addedAt ? `Added ${formatDate(factor.addedAt)}` : 'Added'}
                        {factor.lastUsedAt && ` · Last used ${formatShort(factor.lastUsedAt)}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              {atLimit && (
                <p className="text-xs text-muted">
                  You've reached the limit of {mfa.maxFactors} authenticators. Contact your attorney's office to remove one.
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-line px-4 py-3">
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-body">
                <KeyIcon className="size-[18px]" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-semibold">Backup codes</span>
                <span className={`text-xs ${mfa.recoveryCodesRemaining <= LOW_BACKUP_CODES ? 'font-medium text-warning' : 'text-muted'}`}>
                  {mfa.recoveryCodesRemaining} {mfa.recoveryCodesRemaining === 1 ? 'code' : 'codes'} left
                </span>
              </span>
              <Button variant="secondary" size="sm" icon={RefreshIcon} onClick={() => openDialog('codes')}>
                Generate new codes
              </Button>
            </div>

            <p className="text-xs leading-normal text-muted">
              Got a new phone? Choose <strong className="font-semibold text-body">Add authenticator</strong> and confirm with your current app or a backup code.
              If you have neither, contact your attorney's office to reset two-step verification.
            </p>
          </>
        )}
      </Section>

      {dialog === 'add' && <AddAuthenticatorDialog key={dialogKey} open onClose={closeDialog} />}
      {dialog === 'codes' && (
        <RegenerateBackupCodesDialog key={dialogKey} open onClose={closeDialog} email={email} remaining={mfa?.recoveryCodesRemaining ?? 0} />
      )}
    </>
  )
}

export default SecuritySettings
