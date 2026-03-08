export type Category = 'Interiér' | 'Exteriér' | 'Skla' | 'Doplňky'
export type Badge = 'Novinka' | 'Akce' | 'Tip'

export type Product = {
  id: string
  name: string
  desc: string
  longDesc: string
  price: number
  category: Category
  badge?: Badge
  inStock: boolean
  sku: string
  img: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Čistič interiéru',
    desc: 'Plasty, palubka, interiér. Rychle a bez šmouh.',
    longDesc:
      'Šetrný čistič pro plasty a interiér. Nezanechává šmouhy, rychle schne a zanechává příjemný finiš. Vhodné pro běžnou údržbu i rychlé oživení.',
    price: 199,
    category: 'Interiér',
    badge: 'Tip',
    inStock: true,
    sku: 'MK-INT-001',
    img: '/products/p1.png',
  },
  {
    id: 'p2',
    name: 'Aktivní pěna',
    desc: 'Silná pěna na předmytí, šetrná k laku.',
    longDesc:
      'Hustá aktivní pěna pro předmytí – změkčí nečistoty a pomůže snížit riziko mikroškrábanců při mytí. Doporučeno do pěnovače i ruční aplikace.',
    price: 249,
    category: 'Exteriér',
    badge: 'Novinka',
    inStock: true,
    sku: 'MK-EXT-010',
    img: '/products/p2.png',
  },
  {
    id: 'p3',
    name: 'Mikrovlákno Premium',
    desc: 'Jemná utěrka s vysokou savostí.',
    longDesc:
      'Premium mikrovlákno pro bezpečné stírání detaileru, vosku i běžné sušení. Neškrábe, nepouští chlupy a dobře drží vodu.',
    price: 129,
    category: 'Doplňky',
    inStock: true,
    sku: 'MK-ACC-100',
    img: '/products/p3.png',
  },
  {
    id: 'p4',
    name: 'Čistič skel',
    desc: 'Čistá skla bez mlhy během minut.',
    longDesc:
      'Rychlý čistič skel pro vnitřní i vnější použití. Odmašťuje, zlepšuje výhled a nezanechává šmouhy. Skvělé i na zrcátka a displeje.',
    price: 159,
    category: 'Skla',
    badge: 'Akce',
    inStock: true,
    sku: 'MK-GLS-020',
    img: '/products/p4.png',
  },
  {
    id: 'p5',
    name: 'Detailer',
    desc: 'Lesk a ochrana v jednom kroku.',
    longDesc:
      'Quick detailer pro okamžitý lesk a hladkost laku. Ideální po mytí nebo mezi mytími. Dodá „wow“ efekt během pár minut.',
    price: 219,
    category: 'Exteriér',
    inStock: true,
    sku: 'MK-EXT-030',
    img: '/products/p5.png',
  },
  {
    id: 'p6',
    name: 'Vosk',
    desc: 'Dlouhá výdrž, hladký povrch, odpuzuje vodu.',
    longDesc:
      'Ochranný vosk pro hlubší lesk a hydrofobní efekt. Vhodné pro ruční aplikaci. Výsledkem je hladký povrch a lepší odvod vody.',
    price: 399,
    category: 'Exteriér',
    badge: 'Tip',
    inStock: true,
    sku: 'MK-WAX-200',
    img: '/products/p6.png',
  },
]

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}