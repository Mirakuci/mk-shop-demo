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

const CART_KEY = 'mkshop_pro_cart_v2'

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Čistič interiéru', desc: 'Plasty, palubka, interiér. Rychle a bez šmouh.', price: 199, category: 'Interiér', badge: 'Tip', img: '/products/p1.png' },
  { id: 'p2', name: 'Aktivní pěna', desc: 'Silná pěna na předmytí, šetrná k laku.', price: 249, category: 'Exteriér', badge: 'Novinka', img: '/products/p2.png' },
  { id: 'p3', name: 'Mikrovlákno Premium', desc: 'Jemná utěrka s vysokou savostí.', price: 129, category: 'Doplňky', img: '/products/p3.png' },
  { id: 'p4', name: 'Čistič skel', desc: 'Čistá skla bez mlhy během minut.', price: 159, category: 'Skla', badge: 'Akce', img: '/products/p4.png' },
  { id: 'p5', name: 'Detailer', desc: 'Lesk a ochrana v jednom kroku.', price: 219, category: 'Exteriér', img: '/products/p5.png' },
  { id: 'p6', name: 'Vosk', desc: 'Dlouhá výdrž, hladký povrch, odpuzuje vodu.', price: 399, category: 'Exteriér', badge: 'Tip', img: '/products/p6.png' },
]

const CATEGORIES: Array<Product['category']> = ['Interiér', 'Exteriér', 'Skla', 'Doplňky']

const formatKc = (n: number) =>
  new Intl.NumberFormat('cs-CZ').format(n) + ' Kč'

function badgeClass(b?: Product['badge']) {
  if (!b) return 'badge'
  if (b === 'Novinka') return 'badge badge--new'
  if (b === 'Akce') return 'badge badge--sale'
  return 'badge badge--tip'
}

function oldPrice(price: number) {
  return Math.round(price * 1.18)
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<'Vše' | Product['category']>('Vše')
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement | null
    const prev = header?.style.display
    if (header) header.style.display = 'none'
    return () => {
      if (header) header.style.display = prev ?? ''
    }
  }, [])

  useEffect(() => {
    const b = document.body
    const prev = b.className
    b.className = prev + ' mkShopBody'
    return () => {
      b.className = prev
    }
  }, [])

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
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 99
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
    ;(pop as any)._t = window.setTimeout(() => setToast(null), 1500)
  }

  function add(p: Product) {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id)
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
      return [...c, { ...p, qty: 1 }]
    })
    pop(`Přidáno do košíku: ${p.name}`)
    setCartOpen(true)
  }

  function inc(id: string) {
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)))
  }

  function dec(id: string) {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0)
    )
  }

  function clear() {
    setCart([])
    pop('Košík vyprázdněn')
  }

  const bestseller = PRODUCTS.slice(0, 3)

  return (
    <div className="page">
      <div className="trustBar">
        <div className="container trustBar__inner">
          <span>🚚 Doprava zdarma od 1 500 Kč</span>
          <span>⚡ Odeslání do 24 hodin</span>
          <span>↩️ Vrácení do 30 dní</span>
          <span>⭐ Ověřené produkty</span>
        </div>
      </div>

      <header className="shopHeader">
        <div className="container shopHeader__inner">
          <a className="logo" href="#top" aria-label="MK Shop">
            <div className="logo__mark">MK</div>
            <div className="logo__text">
              <span className="logo__name">MK Shop</span>
              <span className="logo__sub">Premium auto care store</span>
            </div>
          </a>

          <nav className="desktopNav">
            <a href="#kategorie">Kategorie</a>
            <a href="#bestsellers">Bestsellery</a>
            <a href="#products">Produkty</a>
            <a href="#benefits">Proč nakoupit u nás</a>
          </nav>

          <div className="headerSearch">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat produkt…"
              aria-label="Hledat produkt"
            />
          </div>

          <div className="headerActions">
            <button className="btnGhost" onClick={() => pop('Přihlášení (demo)')} type="button">
              Účet
            </button>

            <div className="cartWrap">
              <button
                className="cartBtn"
                type="button"
                onClick={() => setCartOpen((v) => !v)}
                aria-expanded={cartOpen}
                aria-label="Košík"
              >
                <span>Košík</span>
                <span className="cartBtn__count">{items}</span>
              </button>

              {cartOpen && (
                <div className="miniCart" role="dialog" aria-label="Mini košík">
                  <div className="miniCart__head">
                    <div>
                      <div className="miniCart__title">Nákupní košík</div>
                      <div className="muted">{items} ks</div>
                    </div>
                    <button className="x" onClick={() => setCartOpen(false)} aria-label="Zavřít">
                      ✕
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div className="miniCart__empty">Košík je zatím prázdný.</div>
                  ) : (
                    <div className="miniCart__list">
                      {cart.map((i) => (
                        <div className="miniCart__row" key={i.id}>
                          <div className="miniCart__info">
                            <div className="miniCart__name">{i.name}</div>
                            <div className="muted">{formatKc(i.price)} / ks</div>
                            <div className="qty">
                              <button className="qtyBtn" onClick={() => dec(i.id)} type="button">
                                −
                              </button>
                              <span className="qtyNum">{i.qty}</span>
                              <button className="qtyBtn" onClick={() => inc(i.id)} type="button">
                                +
                              </button>
                            </div>
                          </div>
                          <div className="miniCart__sum">{formatKc(i.price * i.qty)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="miniCart__sumBox">
                    <div className="sumLine">
                      <span className="muted">Mezisoučet</span>
                      <b>{formatKc(subtotal)}</b>
                    </div>
                    <div className="sumLine">
                      <span className="muted">Doprava</span>
                      <b>{shipping === 0 ? 'Zdarma' : formatKc(shipping)}</b>
                    </div>
                    <div className="sumLine sumLine--total">
                      <span>Celkem</span>
                      <b>{formatKc(total)}</b>
                    </div>
                  </div>

                  <button
                    className="btnPrimary w100"
                    disabled={cart.length === 0}
                    onClick={() => alert('Pokladna (demo) ✅')}
                    type="button"
                  >
                    Pokračovat k objednávce
                  </button>

                  <button
                    className="btnGhost w100"
                    disabled={cart.length === 0}
                    onClick={clear}
                    style={{ marginTop: 10 }}
                    type="button"
                  >
                    Vyprázdnit košík
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="container hero__inner">
          <div className="hero__content">
            <div className="hero__eyebrow">Prémiová autokosmetika</div>
            <h1>Produkty pro interiér, exteriér i detailing, které působí jako reálný e-shop.</h1>
            <p>
              Moderní e-commerce homepage do portfolia. Vizuál, kategorie, bestsellery,
              košík a nákupní flow, které vypadají jako skutečný obchod.
            </p>

            <div className="hero__ctaRow">
              <a href="#products" className="btnPrimary heroBtn">
                Nakupovat
              </a>
              <a href="#bestsellers" className="btnGhost heroBtn">
                Nejprodávanější
              </a>
            </div>

            <div className="hero__highlights">
              <span>Bezpečný nákup</span>
              <span>Rychlé doručení</span>
              <span>Ověřená péče o auto</span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="visualCard visualCard--large">
              <div className="visualCard__label">Bestseller</div>
              <div className="visualCard__title">Aktivní pěna</div>
              <div className="visualCard__price">{formatKc(249)}</div>
              <div className="visualCard__meta">Předmytí • Šetrná k laku • Skladem</div>
            </div>

            <div className="visualGrid">
              <div className="visualCard">
                <div className="visualCard__label">Doprava</div>
                <div className="visualCard__title">Zdarma od 1 500 Kč</div>
              </div>
              <div className="visualCard">
                <div className="visualCard__label">Vrácení</div>
                <div className="visualCard__title">30 dní bez rizika</div>
              </div>
              <div className="visualCard">
                <div className="visualCard__label">Hodnocení</div>
                <div className="visualCard__title">4.9 / 5 spokojenost</div>
              </div>
              <div className="visualCard">
                <div className="visualCard__label">Sklad</div>
                <div className="visualCard__title">Většina produktů skladem</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories" id="kategorie">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2>Nakupuj podle kategorií</h2>
              <p className="sectionSub">Přehledné členění jako v reálném e-commerce řešení.</p>
            </div>
          </div>

          <div className="catGrid">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`catCard ${cat === c ? 'isActive' : ''}`}
                onClick={() => setCat(c)}
                type="button"
              >
                <div className="catCard__title">{c}</div>
                <div className="catCard__text">Zobrazit produkty v kategorii</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bestsellers" id="bestsellers">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2>Nejprodávanější produkty</h2>
              <p className="sectionSub">Silná sekce, která pomáhá, aby homepage působila jako obchod.</p>
            </div>
          </div>

          <div className="bestGrid">
            {bestseller.map((p) => (
              <article className="bestCard" key={p.id}>
                <div className="bestCard__media">
                  <span className={badgeClass(p.badge)}>{p.badge ?? 'Top produkt'}</span>
                  <img src={p.img} alt={p.name} loading="lazy" />
                </div>

                <div className="bestCard__body">
                  <div className="bestCard__top">
                    <div>
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                    </div>
                    <div className="rating">★★★★★</div>
                  </div>

                  <div className="stockLine">
                    <span className="stockDot" />
                    Skladem &gt; 5 ks
                  </div>

                  <div className="priceRow">
                    <div>
                      <div className="oldPrice">{formatKc(oldPrice(p.price))}</div>
                      <div className="price">{formatKc(p.price)}</div>
                    </div>
                    <button className="btnPrimary" onClick={() => add(p)} type="button">
                      Do košíku
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <main className="main" id="products">
        <div className="container">
          <div className="catalogToolbar">
            <div>
              <h2>Produkty</h2>
              <div className="muted">
                {filtered.length} položek {cat !== 'Vše' ? `v kategorii ${cat}` : ''}
              </div>
            </div>

            <div className="toolbarRight">
              <div className="filterRow">
                <button
                  className={`filterBtn ${cat === 'Vše' ? 'isActive' : ''}`}
                  onClick={() => setCat('Vše')}
                  type="button"
                >
                  Vše
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`filterBtn ${cat === c ? 'isActive' : ''}`}
                    onClick={() => setCat(c)}
                    type="button"
                  >
                    {c}
                  </button>
                ))}
              </div>

              <button
                className="btnGhost"
                onClick={() => {
                  setCat('Vše')
                  setQuery('')
                  pop('Filtry resetovány')
                }}
                type="button"
              >
                Reset filtrů
              </button>
            </div>
          </div>

          <div className="grid">
            {filtered.map((p) => (
              <article className="card" key={p.id}>
                <div className="card__media">
                  <span className={badgeClass(p.badge)}>{p.badge ?? 'Skladem'}</span>
                  <img className="card__img" src={p.img} alt={p.name} loading="lazy" />
                </div>

                <div className="card__body">
                  <div className="card__head">
                    <div>
                      <div className="card__title">{p.name}</div>
                      <div className="card__category">{p.category}</div>
                    </div>
                    <div className="rating rating--small">★★★★★</div>
                  </div>

                  <div className="card__desc">{p.desc}</div>

                  <div className="stockLine stockLine--small">
                    <span className="stockDot" />
                    Skladem
                  </div>

                  <div className="card__bottom">
                    <div>
                      <div className="oldPrice">{formatKc(oldPrice(p.price))}</div>
                      <div className="card__price">{formatKc(p.price)}</div>
                    </div>
                    <button className="btnPrimary" onClick={() => add(p)} type="button">
                      Do košíku
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <section className="benefits" id="benefits">
        <div className="container">
          <div className="sectionHead">
            <div>
              <h2>Proč nakoupit u nás</h2>
              <p className="sectionSub">Tahle sekce pomůže, aby homepage nepůsobila jen jako demo katalog.</p>
            </div>
          </div>

          <div className="benefitGrid">
            <div className="benefitCard">
              <div className="benefitIcon">🚚</div>
              <h3>Rychlé doručení</h3>
              <p>Objednávky expedujeme rychle a přehledně komunikujeme stav.</p>
            </div>

            <div className="benefitCard">
              <div className="benefitIcon">🛡️</div>
              <h3>Ověřené produkty</h3>
              <p>Výběr postavený na kvalitě, použití a reálném přínosu pro péči o auto.</p>
            </div>

            <div className="benefitCard">
              <div className="benefitIcon">↩️</div>
              <h3>Bezpečný nákup</h3>
              <p>Vrácení do 30 dní a transparentní nákupní proces jako v moderním e-shopu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <div className="container">
          <div className="newsletterBox">
            <div>
              <div className="newsletter__kicker">Newsletter</div>
              <h2>Získej novinky, akce a tipy pro péči o auto</h2>
              <p>Působí to jako skutečný obchod a zároveň to skvěle vypadá v portfoliu.</p>
            </div>

            <div className="newsletter__form">
              <input placeholder="Tvůj e-mail" aria-label="Tvůj e-mail" />
              <button className="btnPrimary" onClick={() => pop('Díky za přihlášení (demo)')} type="button">
                Odebírat
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <div className="footerCols">
            <div>
              <div className="fTitle">MK Shop</div>
              <div className="muted">Premium auto care e-commerce demo do portfolia.</div>
            </div>

            <div>
              <div className="fTitle">Informace</div>
              <div className="muted">Doprava a platba</div>
              <div className="muted">Vrácení zboží</div>
              <div className="muted">Obchodní podmínky</div>
            </div>

            <div>
              <div className="fTitle">Kontakt</div>
              <div className="muted">info@mkshop.cz</div>
              <div className="muted">+420 777 000 000</div>
            </div>
          </div>

          <div className="copy">© MK Shop · E-commerce portfolio project</div>
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      <style jsx global>{`
        body.mkShopBody {
          background: #f6f4ef !important;
          color: #0f172a !important;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial !important;
        }

        * {
          box-sizing: border-box;
        }

        .container {
          max-width: 1220px;
          margin: 0 auto;
          padding: 0 18px;
        }

        .muted {
          color: rgba(15, 23, 42, 0.6);
          font-size: 13px;
        }

        .trustBar {
          background: #111827;
          color: rgba(255, 255, 255, 0.86);
          font-size: 12px;
        }

        .trustBar__inner {
          display: flex;
          gap: 18px;
          justify-content: center;
          flex-wrap: wrap;
          padding: 10px 18px;
        }

        .shopHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(246, 244, 239, 0.94);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .shopHeader__inner {
          display: grid;
          grid-template-columns: auto auto 1fr auto;
          gap: 20px;
          align-items: center;
          padding: 18px 18px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .logo__mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: white;
          background: linear-gradient(135deg, #111827, #374151);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
        }

        .logo__text {
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .logo__name {
          font-weight: 900;
          letter-spacing: -0.03em;
          font-size: 18px;
        }

        .logo__sub {
          font-size: 12px;
          color: rgba(15, 23, 42, 0.55);
          margin-top: 4px;
        }

        .desktopNav {
          display: flex;
          gap: 18px;
        }

        .desktopNav a {
          text-decoration: none;
          color: rgba(15, 23, 42, 0.74);
          font-size: 14px;
          font-weight: 700;
        }

        .desktopNav a:hover {
          color: #111827;
        }

        .headerSearch input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          outline: none;
        }

        .headerActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btnGhost,
        .btnPrimary {
          border-radius: 14px;
          padding: 11px 14px;
          font-weight: 800;
          transition: 0.18s ease;
        }

        .btnGhost {
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          color: #111827;
        }

        .btnGhost:hover {
          background: #f8fafc;
        }

        .btnPrimary {
          border: 1px solid #111827;
          background: #111827;
          color: white;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        }

        .btnPrimary:hover {
          transform: translateY(-1px);
        }

        .w100 {
          width: 100%;
        }

        .cartWrap {
          position: relative;
        }

        .cartBtn {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 46px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          font-weight: 900;
        }

        .cartBtn__count {
          min-width: 24px;
          height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: white;
          font-size: 12px;
        }

        .miniCart {
          position: absolute;
          right: 0;
          top: calc(100% + 12px);
          width: min(430px, 94vw);
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.1);
          border-radius: 18px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          padding: 14px;
        }

        .miniCart__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .miniCart__title {
          font-weight: 900;
          font-size: 18px;
          letter-spacing: -0.02em;
        }

        .x {
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          border-radius: 12px;
          padding: 8px 10px;
          font-weight: 900;
        }

        .miniCart__empty {
          padding: 14px 0;
          color: rgba(15, 23, 42, 0.7);
        }

        .miniCart__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 280px;
          overflow: auto;
          padding: 12px 0;
        }

        .miniCart__row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
        }

        .miniCart__name {
          font-weight: 800;
        }

        .miniCart__sum {
          font-weight: 900;
          white-space: nowrap;
        }

        .qty {
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .qtyBtn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          background: white;
          font-weight: 900;
        }

        .qtyNum {
          min-width: 18px;
          text-align: center;
          font-weight: 900;
        }

        .miniCart__sumBox {
          margin-top: 10px;
          padding-top: 12px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .sumLine {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sumLine--total {
          font-size: 17px;
        }

        .hero {
          padding: 34px 0 10px;
        }

        .hero__inner {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 26px;
          align-items: center;
        }

        .hero__content {
          padding: 18px 0;
        }

        .hero__eyebrow {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          font-size: 12px;
          font-weight: 900;
          color: #111827;
          margin-bottom: 18px;
        }

        .hero__content h1 {
          margin: 0;
          font-size: 58px;
          line-height: 0.95;
          letter-spacing: -0.05em;
          font-weight: 900;
          max-width: 13ch;
        }

        .hero__content p {
          margin: 18px 0 0;
          color: rgba(15, 23, 42, 0.72);
          font-size: 18px;
          line-height: 1.75;
          max-width: 58ch;
        }

        .hero__ctaRow {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .heroBtn {
          padding-left: 18px;
          padding-right: 18px;
        }

        .hero__highlights {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
          color: rgba(15, 23, 42, 0.62);
          font-size: 13px;
          font-weight: 700;
        }

        .hero__visual {
          display: grid;
          gap: 14px;
        }

        .visualCard {
          background: white;
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
        }

        .visualCard--large {
          min-height: 220px;
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: end;
        }

        .visualCard__label {
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.68);
        }

        .visualCard--large .visualCard__title {
          margin-top: 10px;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .visualCard__price {
          margin-top: 10px;
          font-size: 26px;
          font-weight: 900;
        }

        .visualCard__meta {
          margin-top: 10px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 14px;
        }

        .visualGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .visualGrid .visualCard__label {
          color: rgba(15, 23, 42, 0.48);
        }

        .visualGrid .visualCard__title {
          margin-top: 6px;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: #111827;
        }

        .categories,
        .bestsellers,
        .benefits,
        .newsletter {
          padding: 24px 0 0;
        }

        .sectionHead {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 12px;
          margin-bottom: 14px;
        }

        .sectionHead h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .sectionSub {
          margin: 8px 0 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 15px;
        }

        .catGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .catCard {
          text-align: left;
          padding: 22px;
          border-radius: 22px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: white;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          transition: 0.18s ease;
        }

        .catCard:hover,
        .catCard.isActive {
          transform: translateY(-2px);
          border-color: rgba(15, 23, 42, 0.16);
        }

        .catCard__title {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .catCard__text {
          margin-top: 8px;
          color: rgba(15, 23, 42, 0.6);
          font-size: 14px;
        }

        .bestGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .bestCard {
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: white;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.07);
        }

        .bestCard__media {
          position: relative;
          background: linear-gradient(180deg, #fafaf9, #f3f4f6);
        }

        .bestCard__media img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: contain;
          display: block;
          padding: 22px;
        }

        .bestCard__body {
          padding: 18px;
        }

        .bestCard__top {
          display: flex;
          justify-content: space-between;
          gap: 14px;
        }

        .bestCard__top h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .bestCard__top p {
          margin: 8px 0 0;
          color: rgba(15, 23, 42, 0.62);
          font-size: 14px;
          line-height: 1.6;
        }

        .rating {
          white-space: nowrap;
          color: #f59e0b;
          font-size: 14px;
          font-weight: 900;
        }

        .stockLine {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          color: #166534;
          font-size: 13px;
          font-weight: 700;
        }

        .stockDot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #22c55e;
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.14);
        }

        .priceRow {
          margin-top: 16px;
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 12px;
        }

        .oldPrice {
          font-size: 13px;
          color: rgba(15, 23, 42, 0.42);
          text-decoration: line-through;
          margin-bottom: 2px;
        }

        .price {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .main {
          padding: 26px 0 0;
        }

        .catalogToolbar {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 16px;
          margin-bottom: 14px;
        }

        .catalogToolbar h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -0.04em;
        }

        .toolbarRight {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filterRow {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filterBtn {
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(15, 23, 42, 0.1);
          background: white;
          font-weight: 800;
          color: rgba(15, 23, 42, 0.76);
        }

        .filterBtn.isActive {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .card {
          border: 1px solid rgba(15, 23, 42, 0.08);
          border-radius: 24px;
          background: white;
          overflow: hidden;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
          transition: 0.18s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        }

        .card__media {
          position: relative;
          background: linear-gradient(180deg, #fafaf9, #f3f4f6);
        }

        .card__img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: contain;
          display: block;
          padding: 22px;
          background: transparent;
        }

        .badge {
          position: absolute;
          top: 12px;
          left: 12px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
          background: #111827;
          color: white;
          z-index: 2;
        }

        .badge--new {
          background: #2563eb;
        }

        .badge--sale {
          background: #16a34a;
        }

        .badge--tip {
          background: #111827;
        }

        .card__body {
          padding: 16px;
        }

        .card__head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: start;
        }

        .card__title {
          font-weight: 900;
          letter-spacing: -0.02em;
          font-size: 20px;
        }

        .card__category {
          margin-top: 4px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.48);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }

        .rating--small {
          font-size: 12px;
        }

        .card__desc {
          margin-top: 10px;
          font-size: 14px;
          line-height: 1.65;
          color: rgba(15, 23, 42, 0.62);
          min-height: 46px;
        }

        .stockLine--small {
          margin-top: 12px;
        }

        .card__bottom {
          margin-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 12px;
        }

        .card__price {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .benefitGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .benefitCard {
          border-radius: 24px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          background: white;
          padding: 22px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
        }

        .benefitIcon {
          font-size: 22px;
        }

        .benefitCard h3 {
          margin: 14px 0 8px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .benefitCard p {
          margin: 0;
          color: rgba(15, 23, 42, 0.62);
          line-height: 1.7;
          font-size: 14px;
        }

        .newsletterBox {
          border-radius: 30px;
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          padding: 28px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
        }

        .newsletter__kicker {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.62);
          margin-bottom: 10px;
        }

        .newsletterBox h2 {
          margin: 0;
          font-size: 34px;
          line-height: 1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }

        .newsletterBox p {
          margin: 12px 0 0;
          color: rgba(255, 255, 255, 0.72);
          max-width: 58ch;
          line-height: 1.7;
        }

        .newsletter__form {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .newsletter__form input {
          min-width: 260px;
          height: 48px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          outline: none;
        }

        .newsletter__form input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .footer {
          margin-top: 30px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
          padding: 24px 0 26px;
        }

        .footerCols {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 16px;
        }

        .fTitle {
          font-weight: 900;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .copy {
          margin-top: 18px;
          font-size: 12px;
          color: rgba(15, 23, 42, 0.55);
        }

        .toast {
          position: fixed;
          left: 18px;
          bottom: 18px;
          background: #111827;
          color: white;
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 900;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
          z-index: 9999;
        }

        @media (max-width: 1120px) {
          .shopHeader__inner {
            grid-template-columns: 1fr;
          }

          .desktopNav {
            display: none;
          }

          .hero__inner,
          .bestGrid,
          .catGrid,
          .grid,
          .benefitGrid,
          .footerCols,
          .newsletterBox {
            grid-template-columns: 1fr;
          }

          .catalogToolbar {
            flex-direction: column;
            align-items: start;
          }

          .toolbarRight {
            width: 100%;
          }

          .headerSearch {
            width: 100%;
          }

          .newsletter__form input {
            min-width: 100%;
          }
        }

        @media (max-width: 720px) {
          .hero__content h1 {
            font-size: 42px;
          }

          .sectionHead h2,
          .catalogToolbar h2,
          .newsletterBox h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  )
}