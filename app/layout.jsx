import './globals.css'

export const metadata = {
  title: 'E‑shop demo',
  description: 'E‑shop demo – demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <header className="nav">
          <div className="container-narrow" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 24px'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(180deg,var(--brand),var(--accent))'}} />
              <strong>E‑shop demo</strong>
            </div>
            <nav style={{display:'flex',gap:16}}>
              <a href="/">Domů</a>
              <a href="#about">O projektu</a>
              <a href="#contact">Kontakt</a>
            </nav>
          </div>
        </header>
        <main className="container-narrow" style={{paddingTop:24}}>
          {children}
        </main>
        <footer>
          <div className="container-narrow" style={{padding:'16px 24px'}}>
            © E‑shop demo – ukázkový projekt • Postaveno na Next.js
          </div>
        </footer>
      </body>
    </html>
  )
}
