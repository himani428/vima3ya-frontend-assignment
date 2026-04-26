import React from 'react'

const sections = [
  { id: 'section-a', label: 'Section A', sub: 'Personal Info' },
  { id: 'section-b', label: 'Section B', sub: 'Contact Details' },
  { id: 'section-c', label: 'Section C', sub: 'Professional' },
  { id: 'section-d', label: 'Section D', sub: 'Preferences' },
]

/**
 * Sidebar — fixed left navigation panel.
 * `activeIndex` is the index of the last section that has been scrolled into view.
 * Bullets highlight cumulatively: all bullets up to and including activeIndex are lit.
 */
const Sidebar = ({ activeIndex }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <span style={styles.brandDot} />
        <span style={styles.brandText}>vima3ya</span>
      </div>

      <div style={styles.navLabel}>NAVIGATION</div>

      <nav style={styles.nav}>
        {sections.map((section, i) => {
          const isActive = i <= activeIndex
          return (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              {/* The connecting line between bullets */}
              {i < sections.length - 1 && (
                <div
                  style={{
                    ...styles.connector,
                    ...(i < activeIndex ? styles.connectorActive : {}),
                  }}
                />
              )}
              <div
                style={{
                  ...styles.bullet,
                  ...(isActive ? styles.bulletActive : {}),
                }}
              >
                {isActive && <div style={styles.bulletInner} />}
              </div>
              <div style={styles.navTextGroup}>
                <span style={{ ...styles.navSectionLabel, ...(isActive ? styles.navSectionLabelActive : {}) }}>
                  {section.label}
                </span>
                <span style={styles.navSectionSub}>{section.sub}</span>
              </div>
            </button>
          )
        })}
      </nav>

      <div style={styles.footer}>
        <div style={styles.footerLine} />
        <span style={styles.footerText}>Form System v1.0</span>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '240px',
    height: '100vh',
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '32px 0',
    zIndex: 100,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 28px',
    marginBottom: '48px',
  },
  brandDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 12px var(--accent)',
  },
  brandText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: '500',
    letterSpacing: '0.05em',
    color: 'var(--text-primary)',
  },
  navLabel: {
    padding: '0 28px',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.12em',
    color: 'var(--text-muted)',
    marginBottom: '20px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 20px',
    gap: '4px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '10px 8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 'var(--radius)',
    transition: 'background 0.2s ease',
    position: 'relative',
    textAlign: 'left',
  },
  navItemActive: {
    background: 'rgba(92, 92, 248, 0.06)',
  },
  connector: {
    position: 'absolute',
    left: '22px',
    top: '36px',
    width: '1px',
    height: '28px',
    background: 'var(--border)',
    transition: 'background 0.3s ease',
  },
  connectorActive: {
    background: 'var(--accent)',
    boxShadow: '0 0 6px var(--accent)',
  },
  bullet: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid var(--border)',
    background: 'var(--surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease',
    zIndex: 1,
  },
  bulletActive: {
    border: '2px solid var(--accent)',
    background: 'var(--accent)',
    boxShadow: '0 0 14px var(--accent-glow)',
  },
  bulletInner: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#fff',
  },
  navTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navSectionLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-display)',
    transition: 'color 0.2s ease',
  },
  navSectionLabelActive: {
    color: 'var(--text-primary)',
  },
  navSectionSub: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
  },
  footer: {
    padding: '0 28px',
    marginTop: 'auto',
  },
  footerLine: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '16px',
  },
  footerText: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
  },
}

export default Sidebar
