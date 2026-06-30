// Built-in brand presets. These live in the repo (committed to GitHub) and act as
// the permanent defaults. Users can add more at runtime in /admin (saved on-device),
// and export a brand as JSON to commit it here for permanence.

export interface Brand {
  id: string
  /** Display name, e.g. "wattsRus". May be styled with a split accent in the logo. */
  name: string
  tagline: string
  /** Primary accent as hex, e.g. "#464feb". Drives the whole theme at runtime. */
  accent: string
  /** Optional uploaded logo as a data URL. When absent, the bolt mark is used. */
  logoDataUrl?: string
  /** Built-in presets cannot be deleted. */
  builtIn?: boolean
}

export const DEFAULT_BRAND_ID = 'currys'

export const BUILT_IN_BRANDS: Brand[] = [
  {
    id: 'currys',
    name: 'Currys',
    tagline: 'Store Ops Copilot',
    accent: '#4c12a1',
    logoDataUrl: `${import.meta.env.BASE_URL}currys-logo.svg`,
    builtIn: true,
  },
  {
    id: 'wattsrus',
    name: 'wattsRus',
    tagline: 'Store Ops Copilot',
    accent: '#464feb',
    builtIn: true,
  },
  {
    id: 'voltly',
    name: 'Voltly',
    tagline: 'Retail Ops Copilot',
    accent: '#0d9488',
    builtIn: true,
  },
  {
    id: 'powerhub',
    name: 'PowerHub',
    tagline: 'Store Ops Copilot',
    accent: '#ea580c',
    builtIn: true,
  },
  {
    id: 'brightwave',
    name: 'Brightwave',
    tagline: 'Electricals Ops Copilot',
    accent: '#7c3aed',
    builtIn: true,
  },
]
