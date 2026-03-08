'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { PRODUCTS, getProduct, type Product } from '../../data/products'

const CART_KEY = 'mkshop_classic_cart_v1'
type CartItem = Product & { qty: number }

const formatKc = (n: number) => new Intl.NumberFormat('cs-CZ').format(n) + ' Kč'

function badgeClass(b?: Product['badge']) {
  if (!b) return 'badge'
  if (b === 'Novinka') return 'badge badge--new'
  if (b === 'Akce') return 'badge badge--sale'
  return 'badge badge--tip'
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProduct(params.id)

  const [cart, setCart] = useState<CartItem[]>([])
  const [qty, setQty] = useState(1)
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // schovej portfolio header (pokud se ti na localhostu zobrazuje)
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

  function pop(msg: string) {
    setToast(msg)
    window.clearTimeout((pop as any)._t)
    ;(pop as any)._t = window.setTimeout(() => setToast(null), 1400)
  }

  function add(p: Product, count: number) {
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id)
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + count } : i))
      return [...c, { ...p, qty: count }]
    })
    pop(`Přidáno: ${p.name} (${count}×)`)
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

  const related = useMemo(() => {
    if (!product) return []
    return PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)
  }, [product])

  if (!product) {
    return (
      <div className="container" style={{ padding: 24 }}>
        <h1>Produkt nenalezen</h1>
        <Link href="/">Zpět na katalog</Link>

        <style jsx global>{GLOBAL_STYLES}</style>
      </div>
    )
  }

  return (
    <div className="page">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="container topbar__inner">
          <Link className="logo" href="/" aria-label="MK Shop">
            <span className="logo__mark" aria-hidden="true" />
            <span className="logo__text">
              <span className="logo__name">MK Shop</span>
              <span className="logo__sub">Classic e-shop demo</span>
            </span>
          </Link>

          <div className="crumbs">
            <Link href="/" className="crumb">Produkty</Link>
            <span className="sep">/</span>
            <span className="here">{product.name}</span>
          </div>

          <div className="actions">
            <button className="btnGhost" onClick={() => pop('Přihlášení (demo)')} type="button">
              Přihlásit
            </button>

            <div className="cartWrap">
              <button className="cartBtn" type="button" onClick={() => setCartOpen((v) => !v)}>
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
                            <div className="qtyRow">
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

                  <button className="btnPrimary w100" disabled={cart.length === 0} onClick={() => alert('Pokladna (demo) ✅')}>
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

      <main className="container" style={{ padding: '18px 16px 0' }}>
        {/* DETAIL */}
        <div className="detail">
          <div className="gallery">
            <span className={badgeClass(product.badge)}>{product.badge ?? 'Skladem'}</span>
            <img className="photo" src={product.img} alt={product.name} />
          </div>

          <div className="info">
            <div className="kicker">{product.category} • {product.sku}</div>
            <h1 className="title">{product.name}</h1>
            <p className="desc">{product.longDesc}</p>

            <div className="buyBox">
              <div className="price">{formatKc(product.price)}</div>
              <div className={`stock ${product.inStock ? 'ok' : 'no'}`}>
                {product.inStock ? 'Skladem' : 'Není skladem'}
              </div>

              <div className="row">
                <div className="qtyPicker">
                  <button className="qtyBtn" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Mínus">−</button>
                  <div className="qtyNum">{qty}</div>
                  <button className="qtyBtn" onClick={() => setQty((q) => q + 1)} aria-label="Plus">+</button>
                </div>

                <button
                  className="btnPrimary"
                  style={{ flex: 1 }}
                  disabled={!product.inStock}
                  onClick={() => add(product, qty)}
                >
                  Přidat do košíku
                </button>
              </div>

              <div className="usp">
                <div>🚚 Doprava zdarma od 499 Kč</div>
                <div>🔁 14 dní na vrácení (demo)</div>
                <div>✅ Bezpečné pro lak (demo)</div>
              </div>
            </div>

            <div className="backRow">
              <Link className="btnGhost" href="/">← Zpět na produkty</Link>
              <button className="btnGhost" onClick={() => pop('Sdílení (demo)')} type="button">Sdílet</button>
            </div>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <section style={{ marginTop: 22 }}>
            <div className="sectionHead">
              <div>
                <h2 style={{ margin: 0 }}>Související produkty</h2>
                <div className="muted">Ze stejné kategorie</div>
              </div>
            </div>

            <div className="grid">
              {related.map((p) => (
                <article className="card" key={p.id}>
                  <div className="card__media">
                    <span className={badgeClass(p.badge)}>{p.badge ?? 'Skladem'}</span>
                    <Link href={`/product/${p.id}`} className="mediaLink" aria-label={p.name}>
                      <img className="card__img" src={p.img} alt={p.name} loading="lazy" />
                    </Link>
                  </div>

                  <div className="card__body">
                    <Link href={`/product/${p.id}`} className="card__title link">{p.name}</Link>
                    <div className="card__desc">{p.desc}</div>

                    <div className="card__bottom">
                      <div className="card__price">{formatKc(p.price)}</div>
                      <button className="btnPrimary" onClick={() => add(p, 1)} type="button">
                        Do košíku
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div style={{ height: 30 }} />
      </main>

      {toast && <div className="toast">{toast}</div>}

      <style jsx global>{GLOBAL_STYLES}</style>

      <style jsx global>{`
        .crumbs{ flex:1; display:flex; align-items:center; gap:8px; color: rgba(15,23,42,.65); font-size:13px; padding:0 12px; }
        .crumb{ color: rgba(15,23,42,.85); text-decoration:none; font-weight:800; }
        .sep{ color: rgba(15,23,42,.35); }
        .here{ color: rgba(15,23,42,.65); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .detail{
          display:grid;
          grid-template-columns: 1.05fr .95fr;
          gap: 18px;
          align-items:start;
        }
        @media (max-width: 980px){
          .detail{ grid-template-columns: 1fr; }
          .crumbs{ display:none; }
        }

        .gallery{
          position:relative;
          border:1px solid rgba(15,23,42,.10);
          border-radius:14px;
          background: rgba(15,23,42,.03);
          overflow:hidden;
        }
        .photo{
          width:100%;
          aspect-ratio: 4/3;
          object-fit: contain;
          display:block;
          padding: 18px;
          background:#fff;
        }

        .info .kicker{ color: rgba(15,23,42,.55); font-weight:900; letter-spacing:.02em; font-size:12px; text-transform:uppercase; }
        .title{ margin:8px 0 8px; font-size:34px; letter-spacing:-0.6px; font-weight: 950; }
        .desc{ margin:0 0 14px; color: rgba(15,23,42,.72); line-height:1.6; }

        .buyBox{
          border:1px solid rgba(15,23,42,.10);
          border-radius:14px;
          background:#fff;
          box-shadow: 0 10px 24px rgba(15,23,42,.06);
          padding: 14px;
        }
        .price{ font-size:26px; font-weight:950; letter-spacing:-0.4px; }
        .stock{ margin-top:6px; font-weight:900; font-size:13px; }
        .stock.ok{ color:#16a34a; }
        .stock.no{ color:#dc2626; }

        .row{ margin-top:12px; display:flex; gap:10px; align-items:center; }
        .qtyPicker{ display:flex; align-items:center; gap:8px; border:1px solid rgba(15,23,42,.14); border-radius:12px; padding:8px; background:#fff; }
        .usp{ margin-top:12px; display:flex; flex-direction:column; gap:6px; color: rgba(15,23,42,.70); font-size:13px; }

        .backRow{ margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; }

        .grid{
          display:grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 980px){ .grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px){ .grid{ grid-template-columns: 1fr; } }

        .mediaLink{ display:block; }
        .link{ text-decoration:none; color: inherit; }
      `}</style>
    </div>
  )
}

const GLOBAL_STYLES = `
  body.mkClassicBody{
    background:#ffffff !important;
    color:#0f172a !important;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial !important;
  }
  .container{ max-width:1180px; margin:0 auto; padding:0 16px; }
  .muted{ color: rgba(15,23,42,.58); font-size:12px; }

  .topbar{ position:sticky; top:0; z-index:50; background:#fff; border-bottom:1px solid rgba(15,23,42,.10); }
  .topbar__inner{ display:flex; align-items:center; gap:14px; padding:12px 16px; }
  .logo{ display:flex; align-items:center; gap:10px; text-decoration:none; color:inherit; min-width: 190px; }
  .logo__mark{ width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#111827,#64748b); }
  .logo__text{ display:flex; flex-direction:column; line-height:1.1; }
  .logo__name{ font-weight:900; letter-spacing:-0.2px; }
  .logo__sub{ font-size:12px; color: rgba(15,23,42,.55); }

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

  .qtyRow{ margin-top:8px; display:flex; align-items:center; gap:8px; }
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

  .badge{
    position:absolute;
    top:10px; left:10px;
    border-radius:999px;
    padding:6px 10px;
    font-size:12px;
    font-weight:900;
    background:#111827;
    color:#fff;
    z-index:2;
  }
  .badge--new{ background:#2563eb; }
  .badge--sale{ background:#16a34a; }
  .badge--tip{ background:#111827; }

  .card{
    border:1px solid rgba(15,23,42,.10);
    border-radius:12px;
    background:#fff;
    overflow:hidden;
    box-shadow: 0 10px 24px rgba(15,23,42,.06);
  }
  .card__media{ position:relative; background: rgba(15,23,42,.03); }
  .card__img{
    width:100%;
    aspect-ratio: 4/3;
    object-fit: contain;
    display:block;
    padding: 10px;
    background:#fff;
  }
  .card__body{ padding: 12px; }
  .card__title{ font-weight:900; letter-spacing:-0.2px; }
  .card__desc{ margin-top:6px; font-size:12px; color: rgba(15,23,42,.62); min-height: 34px; }
  .card__bottom{ margin-top:10px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .card__price{ font-weight:900; letter-spacing:-0.2px; }

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
`