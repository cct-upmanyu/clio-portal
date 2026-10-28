// Sample data until the backend is connected. Each matter carries everything
// the pages show for it, so switching matters changes every tab.
// Dates are relative to today so "Today" / "Yesterday" grouping always has data.

const at = (daysAgo, hours, minutes = 0) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

const ATTORNEY = 'David Smith'
const PARALEGAL = 'Paralegal team'

export const currentUser = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
}

export const firm = {
  name: 'David Smith Law Firm, PLLC',
  addressLines: ['1919 Decatur St.', 'Houston, Texas 77007'],
  phone: '713-769-5000',
  phoneHref: 'tel:+17137695000',
  email: 'david@davidsmith.law',
  attorney: { name: ATTORNEY, role: 'Responsible attorney' },
}

export const matters = [
  {
    id: '821',
    number: '2026-10-00821',
    title: 'Estate planning',
    status: 'Open',
    stage: 'Document review',
    opened: 'Oct 1, 2026',
    nextEvent: 'Nov 4 · Consultation',
    documents: [
      { id: 'd1', name: 'Engagement agreement.pdf', size: 248_000, sharedBy: ATTORNEY, sharedAt: at(0, 9, 13) },
      { id: 'd2', name: 'Asset list.pdf', size: 96_400, sharedBy: 'You', sharedAt: at(1, 16, 5) },
      { id: 'd3', name: 'Screenshot_4.png', size: 412_900, sharedBy: ATTORNEY, sharedAt: at(5, 19, 5) },
      { id: 'd4', name: 'RTO.png', size: 188_200, sharedBy: ATTORNEY, sharedAt: at(5, 18, 40) },
      { id: 'd5', name: 'Draft will (v2).pdf', size: 512_300, sharedBy: ATTORNEY, sharedAt: at(6, 11, 0) },
      { id: 'd6', name: 'Power of attorney (draft).pdf', size: 301_700, sharedBy: ATTORNEY, sharedAt: at(7, 10, 30) },
      { id: 'd7', name: 'Healthcare directive (draft).pdf', size: 276_100, sharedBy: ATTORNEY, sharedAt: at(7, 10, 25) },
      { id: 'd8', name: 'Beneficiary designation form.pdf', size: 154_800, sharedBy: PARALEGAL, sharedAt: at(9, 14, 0) },
      { id: 'd9', name: 'Trust summary.docx', size: 61_200, sharedBy: ATTORNEY, sharedAt: at(10, 15, 45) },
      { id: 'd10', name: 'Property deed.pdf', size: 1_820_000, sharedBy: 'You', sharedAt: at(12, 9, 10) },
      { id: 'd11', name: 'Bank statement – Sep 2026.pdf', size: 702_500, sharedBy: 'You', sharedAt: at(12, 9, 8) },
      { id: 'd12', name: 'ID scan.jpg', size: 1_204_000, sharedBy: 'You', sharedAt: at(13, 17, 20) },
      { id: 'd13', name: 'Meeting notes – Oct 1.docx', size: 38_900, sharedBy: PARALEGAL, sharedAt: at(20, 12, 0) },
      { id: 'd14', name: 'Fee schedule.pdf', size: 88_300, sharedBy: ATTORNEY, sharedAt: at(27, 9, 30) },
    ],
    messages: [
      { id: 'm1', author: ATTORNEY, fromMe: false, sentAt: at(9, 14, 30), body: "Thanks for choosing our firm, Jane. We'll be in touch shortly to schedule your consultation." },
      { id: 'm2', author: ATTORNEY, fromMe: false, sentAt: at(3, 10, 15), body: 'Welcome to the client portal. You can message me here anytime about your estate plan.' },
      { id: 'm3', author: 'You', fromMe: true, sentAt: at(3, 10, 42), body: 'Thank you! Should I send the list of assets here as well?' },
      { id: 'm4', author: ATTORNEY, fromMe: false, sentAt: at(3, 10, 50), body: 'Yes, please attach it here or upload it under Documents.' },
      { id: 'm5', author: 'You', fromMe: true, sentAt: at(1, 16, 5), body: "Here's the asset list we discussed.", attachment: { name: 'Asset list.pdf', size: 96_400 } },
      { id: 'm6', author: PARALEGAL, fromMe: false, sentAt: at(1, 17, 20), body: 'Thanks, we received your documents and added them to your file.' },
      { id: 'm7', author: ATTORNEY, fromMe: false, sentAt: at(0, 9, 12), body: "I've uploaded the engagement agreement. Please review and sign when you can.", unread: true },
      { id: 'm8', author: ATTORNEY, fromMe: false, sentAt: at(0, 9, 13), body: '', attachment: { name: 'Engagement agreement.pdf', size: 248_000 }, unread: true },
    ],
    tasks: [
      { id: 't1', title: 'Provide beneficiary details', description: 'Names and contact details for each beneficiary.', due: at(1, 17), status: 'outstanding' },
      { id: 't2', title: 'Sign the engagement agreement', description: 'Review the agreement in Documents, then sign and upload it.', due: at(-3, 17), status: 'outstanding' },
      { id: 't3', title: 'Upload a list of your assets', due: at(2, 17), status: 'completed', completedAt: at(1, 16, 5) },
      { id: 't4', title: 'Complete the intake questionnaire', due: at(8, 17), status: 'completed', completedAt: at(9, 11, 30) },
    ],
  },
  {
    id: '822',
    number: '2026-10-00822',
    title: 'Business formation',
    status: 'Open',
    stage: 'Intake',
    opened: 'Oct 20, 2026',
    nextEvent: 'Nov 12 · Filing review',
    documents: [
      { id: 'd20', name: 'Certificate of formation (draft).pdf', size: 214_600, sharedBy: ATTORNEY, sharedAt: at(2, 11, 0) },
      { id: 'd21', name: 'Operating agreement questionnaire.docx', size: 44_100, sharedBy: ATTORNEY, sharedAt: at(7, 15, 30) },
    ],
    messages: [
      { id: 'm20', author: ATTORNEY, fromMe: false, sentAt: at(1, 11, 4), body: "Could you confirm the company name you'd like to register?", unread: true },
    ],
    tasks: [
      { id: 't20', title: 'Complete the operating agreement questionnaire', description: 'Found under Documents.', due: at(-8, 17), status: 'outstanding' },
    ],
  },
  {
    id: '790',
    number: '2026-09-00790',
    title: 'Real estate closing',
    status: 'Closed',
    stage: 'Closed',
    opened: 'Sep 3, 2026',
    nextEvent: 'None scheduled',
    documents: [
      { id: 'd30', name: 'Closing statement.pdf', size: 133_000, sharedBy: ATTORNEY, sharedAt: at(29, 10, 0) },
    ],
    messages: [],
    tasks: [
      { id: 't30', title: 'Review the closing statement', due: at(31, 17), status: 'completed', completedAt: at(30, 9, 0) },
    ],
  },
]

// Events keep their display strings for now (Events page and Home)
const EVENTS = {
  821: [
    { id: 'e1', month: 'Nov', day: '04', title: 'Initial consultation', time: 'Wed · 10:00 – 11:00 AM', place: 'Video call' },
    { id: 'e2', month: 'Nov', day: '18', title: 'Document signing', time: 'Wed · 2:00 – 2:30 PM', place: '1919 Decatur St., Houston' },
  ],
  822: [
    { id: 'e3', month: 'Nov', day: '12', title: 'Filing review', time: 'Thu · 3:00 – 3:30 PM', place: 'Video call' },
  ],
  790: [],
}
matters.forEach((matter) => { matter.events = EVENTS[matter.id] ?? [] })
