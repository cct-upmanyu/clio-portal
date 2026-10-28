import lightLogo from '../../assets/Firm_Logo.webp'
import darkLogo from '../../assets/Firm_Logo_Dark.svg'
import { firm } from '../../data/sampleData'

// Testing the black logo (white on black, same as the favicon).
// Set to false to go back to the original black-on-white logo everywhere.
export const USE_DARK_LOGO = false

// The original logo sits on a white tile (`frameClass`); the black logo is
// already a rounded black square, so it's shown on its own at `darkClass` size.
function BrandLogo({ lightClass, darkClass, frameClass = '' }) {
  if (USE_DARK_LOGO) return <img src={darkLogo} alt={firm.name} className={`shrink-0 ${darkClass}`} />
  const img = <img src={lightLogo} alt={firm.name} className={`w-auto ${lightClass}`} />
  return frameClass ? <span className={frameClass}>{img}</span> : img
}

export default BrandLogo
