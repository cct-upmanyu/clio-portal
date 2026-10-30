import Button from '../ui/Button'
import Page from '../ui/Page'
import { HomeIcon, LockIcon } from '../ui/icons'

function AccessDenied({ message }) {
  return (
    <Page>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <LockIcon className="size-7" />
        </span>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="max-w-[380px] text-sm leading-normal text-muted">
          {message || 'You do not have permission to view this.'} If you think this is a mistake, contact your attorney's office.
        </p>
        <Button to="/" icon={HomeIcon} className="mt-2">Back to home</Button>
      </div>
    </Page>
  )
}

export default AccessDenied
