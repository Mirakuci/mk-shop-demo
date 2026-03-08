'use client'

import { useEffect, useMemo, useState } from 'react'

type Product = {
  id: string
  name: string
  desc: string
  price: number
  category: 'Interiér' | 'Exteriér' | 'Skla' | 'Doplňky'
  badge?: 'Novinka' | 'Akce' | 'Tip'
  img: string
}

type CartItem = Product & { qty: number }

const CART_KEY = 'mkshop_classic_cart_v1'

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Čistič interiéru', desc: 'Plasty, palubka, interiér. Rychle a bez šmouh.', price: 199, category: 'Interiér', badge: 'Tip', img: '/products/p1.png' },
  { id: 'p2', name: 'Aktivní pěna', desc: 'Silná pěna na předmytí, šetrná k laku.', price: 249, category: 'Exteriér', badge: 'Novinka', img: '/products/p2.png' },
  { id: 'p3', name: 'Mikrovlákno Premium', desc: 'Jemná utěrka s vysokou savostí.', price: 129, category: 'Doplňky', img: '/products/p3.png' },
  { id: 'p4', name: 'Čistič skel', desc: 'Čistá skla bez mlhy během minut.', price: 159, category: 'Skla', badge: 'Akce', img: '/products/p4.png' },
  { id: 'p5', name: 'Detailer', desc: 'Lesk a ochrana v jednom kroku.', price: 219, category: 'Exteriér', img: '/products/p5.png' },
  { id: 'p6', name: 'Vosk', desc: 'Dlouhá výdrž, hladký povrch, odpuzuje vodu.', price: 399, category: 'Exteriér', badge: 'Tip', img: '/products/p6.png' },
]

const CATEGORIES: Array<Product['category']> = ['Interiér', 'Exteriér', 'Skla', 'Doplňky']

const formatKc = (n: number) => new Intl.NumberFormat('cs-CZ').format(n) + ' Kč'

function badgeClass(b?: Product['badge']) {
  if (!b) return 'badge'
  if (b === 'Novinka') return 'badge badge--new'
  if (b === 'Akce') return 'badge badge--sale'
  return 'badge badge--tip'
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<'Vše' | Product['category']>('Vše')
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // schovej portfolio header/menu jen pro shop
  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null
    const prev = header?.style.display
    if (header) header.style.display = 'none'
    return () => {
      if (header) header.style.display = prev ?? ''
    }
  }, [])

  // body skin
  useEffect(() => {
    const b = document.body
    const prev = b.className
    b.className = prev + ' mkClassicBody'
    return () => {
      b.className = prev
    }
  }, [])

  // cart load/save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) setCart(JSON.parse(raw))
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart))
    } catch {}
  }, [cart])

  const items = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart])
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 69
  const total = subtotal + shipping

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PRODUCTS.filter((p) => {
      const okCat = cat === 'Vše' ? true : p.category === cat
      const okQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      return okCat && okQ
    })
  }, [query, cat])

  function pop(msg: string) {
    setToast(msg)
    window.clearTimeout((pop as any)._t)
    ;(pop as any)._t = window.setTimeout(() => setToast(null), 1400)
  }

  function add(p: Product) {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id)
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      return [...c, { ...p, qty: 1 }]
    })
    pop(`Přidáno: ${p.name}`)
    setCartOpen(true)
  }

  function inc(id: string) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
  }
  function dec(id: string) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0))
  }
  function clear() {
    setCart([])
    pop('Košík vyprázdněn')
  }

  return (
    <div className="page">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="container topbar__inner">
          <a className="logo" href="#top" aria-label="MK Shop">
            <span className="logo__mark" aria-hidden="true" />
            <span className="logo__text">
              <span className="logo__name">MK Shop</span>
              <span className="logo__sub">Classic e-shop demo</span>
            </span>
          </a>

          <div className="search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat produkty…"
              aria-label="Hledat produkty"
            />
          </div>

          <div className="actions">
            <button className="btnGhost" onClick={() => pop('Přihlášení (demo)')} type="button">
              Přihlásit
            </button>

            <div className="cartWrap">
              <button
                className="cartBtn"
                type="button"
                onClick={() => setCartOpen((v) => !v)}
                aria-expanded={cartOpen}
                aria-label="Košík"
              >
                <span className="cartBtn__icon" aria-hidden="true">🛒</span>
                <span className="cartBtn__label">Košík</span>
                <span className="cartBtn__count">{items}</span>
              </button>

              {cartOpen && (
                <div className="miniCart" role="dialog" aria-label="Mini košík">
                  <div className="miniCart__head">
                    <div>
                      <div className="miniCart__title">Košík</div>
                      <div className="muted">{items} ks</div>
                    </div>
                    <button className="x" onClick={() => setCartOpen(false)} aria-label="Zavřít">✕</button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="miniCart__empty">Košík je prázdný.</div>
                  ) : (
                    <div className="miniCart__list">
                      {cart.map((i) => (
                        <div className="miniCart__row" key={i.id}>
                          <div className="miniCart__info">
                            <div className="miniCart__name">{i.name}</div>
                            <div className="muted">{formatKc(i.price)} / ks</div>
                            <div className="qty">
                              <button className="qtyBtn" onClick={() => dec(i.id)} aria-label="Mínus">−</button>
                              <span className="qtyNum">{i.qty}</span>
                              <button className="qtyBtn" onClick={() => inc(i.id)} aria-label="Plus">+</button>
                            </div>
                          </div>
                          <div className="miniCart__sum">{formatKc(i.price * i.qty)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="miniCart__sumBox">
                    <div className="sumLine"><span className="muted">Mezisoučet</span><b>{formatKc(subtotal)}</b></div>
                    <div className="sumLine"><span className="muted">Doprava</span><b>{shipping === 0 ? 'Zdarma' : formatKc(shipping)}</b></div>
                    <div className="sumLine sumLine--total"><span>Celkem</span><b>{formatKc(total)}</b></div>
                  </div>

                  <button
                    className="btnPrimary w100"
                    disabled={cart.length === 0}
                    onClick={() => alert('Pokladna (demo) ✅')}
                  >
                    Pokračovat k objednávce
                  </button>

                  <button className="btnGhost w100" disabled={cart.length === 0} onClick={clear} style={{ marginTop: 8 }}>
                    Vyprázdnit košík
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY NAV */}
      <div className="nav">
        <div className="container nav__inner">
          <button
            className={`nav__item ${cat === 'Vše' ? 'isActive' : ''}`}
            onClick={() => setCat('Vše')}
            type="button"
          >
            Vše
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`nav__item ${cat === c ? 'isActive' : ''}`}
              onClick={() => setCat(c)}
              type="button"
            >
              {c}
            </button>
          ))}
          <div className="nav__spacer" />
          <div className="nav__hint">Doprava zdarma od 499 Kč</div>
        </div>
      </div>

      {/* HERO BANNER */}
      <section className="hero" id="top">
        <div className="container hero__inner">
          <div className="hero__banner">
            <div className="hero__text">
              <div className="hero__kicker">Akce týdne</div>
              <h1>Čistota, která je vidět.</h1>
              <p>
                Klasický e-shop layout ve stylu Shoptet “Classic” — banner, kategorie a produktový katalog.
                Připraveno pro napojení na backend.
              </p>

              <div className="hero__ctas">
                <a className="btnPrimary" href="#products">Nakupovat</a>
                <button className="btnGhost" onClick={() => setCartOpen(true)} type="button">Zobrazit košík</button>
              </div>

              <div className="hero__usp">
                <span>✅ Responzivní</span>
                <span>🔁 Košík v localStorage</span>
                <span>⚡ Rychlé UI</span>
              </div>
            </div>

            <div className="hero__img" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <main className="main">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2 id="products">Produkty</h2>
              <div className="muted">{filtered.length} položek</div>
            </div>

            <button className="btnGhost" onClick={() => { setCat('Vše'); setQuery(''); pop('Filtry resetovány'); }} type="button">
              Reset filtrů
            </button>
          </div>

          <div className="grid">
            {filtered.map((p) => (
              <article className="card" key={p.id}>
                <div className="card__media">
                  <span className={badgeClass(p.badge)}>{p.badge ?? 'Skladem'}</span>
                  <img className="card__img" src={p.img} alt={p.name} loading="lazy" />
                </div>

                <div className="card__body">
                  <div className="card__title">{p.name}</div>
                  <div className="card__desc">{p.desc}</div>

                  <div className="card__bottom">
                    <div className="card__price">{formatKc(p.price)}</div>
                    <button className="btnPrimary" onClick={() => add(p)} type="button">
                      Do košíku
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="note">
            Tip na screenshot do portfolia: přidej 2–3 produkty → otevři mini-košík nahoře → screenshot “reálného” shopu.
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="cols">
            <div>
              <div className="fTitle">Newsletter</div>
              <div className="muted">Nezmeškej novinky a akce (demo).</div>
              <div className="nl">
                <input placeholder="E-mail" aria-label="E-mail" />
                <button className="btnPrimary" onClick={() => pop('Díky! (demo)')} type="button">Odebírat</button>
              </div>
            </div>

            <div>
              <div className="fTitle">Kontakt</div>
              <div className="muted">info@mkshop.cz</div>
              <div className="muted">+420 777 000 000</div>
            </div>

            <div>
              <div className="fTitle">Informace</div>
              <div className="muted">Doprava a platba</div>
              <div className="muted">Vrácení zboží</div>
              <div className="muted">Obchodní podmínky</div>
            </div>
          </div>

          <div className="copy">© MK Shop • Classic portfolio demo</div>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      <style jsx global>{`
        body.mkClassicBody{
          background:#ffffff !important;
          color:#0f172a !important;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial !important;
        }

        .container{ max-width:1180px; margin:0 auto; padding:0 16px; }
        .muted{ color: rgba(15,23,42,.58); font-size:12px; }

        /* Topbar */
        .topbar{ position:sticky; top:0; z-index:50; background:#fff; border-bottom:1px solid rgba(15,23,42,.10); }
        .topbar__inner{ display:flex; align-items:center; gap:14px; padding:12px 16px; }
        .logo{ display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; min-width: 190px; }
        .logo__mark{ width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#111827,#64748b); }
        .logo__text{ display:flex; flex-direction:column; line-height:1.1; }
        .logo__name{ font-weight:900; letter-spacing:-0.2px; }
        .logo__sub{ font-size:12px; color: rgba(15,23,42,.55); }

        .search{ flex:1; }
        .search input{
          width:100%;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,.16);
          outline:none;
        }
        .search input:focus{ border-color: rgba(15,23,42,.32); }

        .actions{ display:flex; align-items:center; gap:10px; }
        .btnGhost{
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,.14);
          background:#fff;
          font-weight:800;
        }
        .btnGhost:disabled{ opacity:.6; }

        .btnPrimary{
          padding:10px 12px;
          border-radius:10px;
          border:1px solid #111827;
          background:#111827;
          color:#fff;
          font-weight:900;
        }
        .btnPrimary:disabled{ opacity:.6; }
        .w100{ width:100%; }

        /* Cart */
        .cartWrap{ position:relative; }
        .cartBtn{
          display:flex; align-items:center; gap:8px;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,.14);
          background:#fff;
          font-weight:900;
          white-space:nowrap;
        }
        .cartBtn__count{
          background:#111827; color:#fff;
          border-radius:999px;
          padding:2px 8px;
          font-size:12px;
        }

        .miniCart{
          position:absolute;
          right:0;
          top: calc(100% + 10px);
          width: min(420px, 92vw);
          background:#fff;
          border:1px solid rgba(15,23,42,.12);
          border-radius:12px;
          box-shadow: 0 18px 40px rgba(15,23,42,.16);
          padding:12px;
        }
        .miniCart__head{
          display:flex; justify-content:space-between; align-items:flex-start; gap:10px;
          padding-bottom:10px; border-bottom:1px solid rgba(15,23,42,.10);
        }
        .miniCart__title{ font-weight:900; letter-spacing:-0.2px; }
        .x{
          border:1px solid rgba(15,23,42,.14);
          background:#fff;
          border-radius:10px;
          padding:8px 10px;
          font-weight:900;
        }
        .miniCart__empty{ padding:12px 0; color: rgba(15,23,42,.70); font-size:13px; }
        .miniCart__list{ max-height: 280px; overflow:auto; padding:10px 0; display:flex; flex-direction:column; gap:10px; }
        .miniCart__row{ display:flex; justify-content:space-between; gap:10px; padding-bottom:10px; border-bottom:1px solid rgba(15,23,42,.08); }
        .miniCart__row:last-child{ border-bottom:0; padding-bottom:0; }
        .miniCart__name{ font-weight:900; }
        .miniCart__sum{ font-weight:900; white-space:nowrap; }

        .qty{ margin-top:8px; display:flex; align-items:center; gap:8px; }
        .qtyBtn{
          width:34px; height:34px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,.16);
          background:#fff;
          font-weight:900;
        }
        .qtyNum{ min-width:20px; text-align:center; font-weight:900; }

        .miniCart__sumBox{
          margin-top:10px;
          padding-top:10px;
          border-top:1px solid rgba(15,23,42,.10);
          display:flex;
          flex-direction:column;
          gap:8px;
          margin-bottom:10px;
        }
        .sumLine{ display:flex; justify-content:space-between; align-items:center; }
        .sumLine--total{ font-size:16px; }

        /* Nav */
        .nav{ background:#fff; border-bottom:1px solid rgba(15,23,42,.10); }
        .nav__inner{ display:flex; align-items:center; gap:10px; padding:10px 16px; }
        .nav__item{
          padding:8px 10px;
          border-radius:10px;
          border:1px solid transparent;
          background:transparent;
          font-weight:900;
        }
        .nav__item.isActive{
          border-color: rgba(15,23,42,.14);
          background: rgba(15,23,42,.03);
        }
        .nav__spacer{ flex:1; }
        .nav__hint{ font-size:12px; color: rgba(15,23,42,.55); }

        /* Hero */
        .hero{ padding: 18px 0 8px; }
        .hero__banner{
          border-radius:14px;
          overflow:hidden;
          border:1px solid rgba(15,23,42,.10);
          background:#0f172a;
          color:#fff;
          display:grid;
          grid-template-columns: 1.1fr .9fr;
          min-height: 320px;
        }
        @media (max-width: 980px){
          .hero__banner{ grid-template-columns:1fr; }
        }
        .hero__text{ padding:24px; display:flex; flex-direction:column; justify-content:center; }
        .hero__kicker{ color: rgba(255,255,255,.70); font-weight:900; font-size:12px; letter-spacing:.08em; text-transform:uppercase; }
        .hero__text h1{ margin: 8px 0 10px; font-size: 42px; line-height:1.05; letter-spacing:-0.8px; font-weight: 900; }
        .hero__text p{ margin:0 0 16px; color: rgba(255,255,255,.82); max-width: 62ch; font-size: 14px; }
        .hero__ctas{ display:flex; gap:10px; flex-wrap:wrap; }
        .hero__usp{ margin-top:14px; display:flex; gap:12px; flex-wrap:wrap; color: rgba(255,255,255,.70); font-size:12px; }
        .hero__img{
          background:
            radial-gradient(760px 340px at 30% 30%, rgba(59,130,246,0.50), transparent 60%),
            radial-gradient(780px 360px at 70% 40%, rgba(236,72,153,0.38), transparent 60%),
            radial-gradient(640px 320px at 55% 90%, rgba(34,197,94,0.28), transparent 60%),
            linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
        }

        /* Main + grid */
        .main{ padding: 16px 0 0; }
        .sectionHead{ display:flex; justify-content:space-between; align-items:end; gap:12px; margin: 8px 0 12px; }
        .sectionHead h2{ margin:0; font-size:26px; font-weight:900; letter-spacing:-0.3px; }

        .grid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 980px){ .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px){ .grid{ grid-template-columns: 1fr; } }

        .card{
          border:1px solid rgba(15,23,42,.10);
          border-radius:12px;
          background:#fff;
          overflow:hidden;
          box-shadow: 0 10px 24px rgba(15,23,42,.06);
        }

        .card__media{ background:#fff; }
.card__media img{
  width:100%;
  aspect-ratio: 4 / 3;
  object-fit: contain;   /* 👈 už neořezává */
  display:block;
  padding: 18px;         /* 👈 ať není nalepený */
  background:#fff;
}

        .badge{
          position:absolute;
          top:10px; left:10px;
          border-radius:999px;
          padding:6px 10px;
          font-size:12px;
          font-weight:900;
          background:#111827;
          color:#fff;
        }
        .badge--new{ background:#2563eb; }
        .badge--sale{ background:#16a34a; }
        .badge--tip{ background:#111827; }

        .card__body{ padding: 12px; }
        .card__title{ font-weight:900; letter-spacing:-0.2px; }
        .card__desc{ margin-top:6px; font-size:12px; color: rgba(15,23,42,.62); min-height: 34px; }
        .card__bottom{ margin-top:10px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
        .card__price{ font-weight:900; letter-spacing:-0.2px; }

        .note{
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(15,23,42,.03);
          color: rgba(15,23,42,.70);
          font-size: 12px;
        }

        /* Footer */
        .footer{ margin-top: 26px; border-top:1px solid rgba(15,23,42,.10); padding: 22px 0 24px; }
        .cols{ display:grid; grid-template-columns: 2fr 1fr 1fr; gap:16px; }
        @media (max-width: 980px){ .cols{ grid-template-columns: 1fr; } }
        .fTitle{ font-weight:900; letter-spacing:-0.2px; margin-bottom:6px; }
        .nl{ margin-top:10px; display:flex; gap:10px; flex-wrap:wrap; }
        .nl input{
          flex:1; min-width:220px;
          padding:10px 12px;
          border-radius:10px;
          border:1px solid rgba(15,23,42,.16);
          outline:none;
        }
        .copy{ margin-top:16px; font-size:12px; color: rgba(15,23,42,.55); }

        /* Toast */
        .toast{
          position: fixed;
          left: 16px;
          bottom: 16px;
          background:#111827;
          color:#fff;
          padding: 10px 12px;
          border-radius: 12px;
          font-weight: 900;
          z-index: 9999;
        }
      `}</style>
    </div>
  )
}