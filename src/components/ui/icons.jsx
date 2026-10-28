import { IoDocumentsOutline, IoHomeOutline } from 'react-icons/io5'
import { LiaMoneyBillSolid } from 'react-icons/lia'
import { LuListChecks, LuMessagesSquare } from 'react-icons/lu'
import { MdOutlineCalendarToday } from 'react-icons/md'

// Stroke icons; size and color come from className (they use currentColor)
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export const MailIcon = (props) => (
  <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
)

export const InviteIcon = (props) => (
  <svg {...base} {...props}><path d="M3 9l9-6 9 6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" /><path d="M3 9l9 6 9-6" /></svg>
)

export const LockIcon = (props) => (
  <svg {...base} {...props}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
)

export const EyeIcon = (props) => (
  <svg {...base} {...props}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
)

export const EyeOffIcon = (props) => (
  <svg {...base} {...props}>
    <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.5M6.6 6.6A17.4 17.4 0 0 0 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /><path d="M3 3l18 18" />
  </svg>
)

export const ChevronLeftIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M15 18l-6-6 6-6" /></svg>
)

export const CheckIcon = (props) => (
  <svg {...base} strokeWidth={2.4} {...props}><path d="M20 6L9 17l-5-5" /></svg>
)

export const CircleIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><circle cx="12" cy="12" r="8" /></svg>
)

export const ChevronRightIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M9 6l6 6-6 6" /></svg>
)

export const ChevronDownIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M6 9l6 6 6-6" /></svg>
)




export const DocumentIcon = (props) => (
  <svg {...base} {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4" /></svg>
)

export const FileIcon = (props) => (
  <svg {...base} {...props}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" /></svg>
)

export const ImageIcon = (props) => (
  <svg {...base} {...props}><path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 16l4.5-4.5L13 16l3-3 4 4M15.5 8.5h.01" /></svg>
)



export const HelpIcon = (props) => (
  <svg {...base} {...props}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01" /></svg>
)

export const SignOutIcon = (props) => (
  <svg {...base} {...props}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" /></svg>
)

export const SettingsIcon = (props) => (
  <svg {...base} {...props}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></svg>
)

export const BellIcon = (props) => (
  <svg {...base} {...props}><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9zM10 20a2 2 0 0 0 4 0" /></svg>
)

export const BriefcaseIcon = (props) => (
  <svg {...base} {...props}><path d="M4 7h16v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12h16" /></svg>
)

export const MenuIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
)

export const CloseIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M6 6l12 12M18 6L6 18" /></svg>
)

export const PhoneIcon = (props) => (
  <svg {...base} {...props}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
)

export const MapPinIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
)

export const InboxIcon = (props) => (
  <svg {...base} {...props}><path d="M3 13h5l1.5 3h5L16 13h5M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" /></svg>
)

export const CheckCircleIcon = (props) => (
  <svg {...base} {...props}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12l2.5 2.5 4.5-5" /></svg>
)

export const UploadIcon = (props) => (
  <svg {...base} {...props}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
)

export const DownloadIcon = (props) => (
  <svg {...base} {...props}><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
)

export const PaperclipIcon = (props) => (
  <svg {...base} {...props}><path d="m20.5 11.5-8.3 8.3a5 5 0 0 1-7.1-7.1l8.6-8.6a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4l7.9-7.9" /></svg>
)

export const SendIcon = (props) => (
  <svg {...base} {...props}><path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" /></svg>
)

export const AlertIcon = (props) => (
  <svg {...base} {...props}><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v5M12 16.5v.01" /></svg>
)

export const PlusIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M12 5v14M5 12h14" /></svg>
)

// Section icons from react-icons (outline styles). Hidden from screen readers
// like the icons above; size and color still come from className.
const hidden = { 'aria-hidden': true, focusable: false }

export const HomeIcon = (props) => <IoHomeOutline {...hidden} {...props} />
export const MessageIcon = (props) => <LuMessagesSquare {...hidden} {...props} />
export const TaskIcon = (props) => <LuListChecks {...hidden} {...props} />
export const DocumentsIcon = (props) => <IoDocumentsOutline {...hidden} {...props} />
export const CalendarIcon = (props) => <MdOutlineCalendarToday {...hidden} {...props} />
export const BillIcon = (props) => <LiaMoneyBillSolid {...hidden} {...props} />
