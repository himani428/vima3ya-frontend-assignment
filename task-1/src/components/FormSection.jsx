import React from 'react'

/**
 * FormSection — wraps each form section with a heading and consistent card styling.
 * The `id` prop is used by IntersectionObserver in App.jsx for scroll detection.
 */
const FormSection = ({ id, letter, title, children }) => {
  return (
    <section id={id} style={styles.section}>
      <div style={styles.sectionHeader}>
        <span style={styles.letter}>{letter}</span>
        <div>
          <div style={styles.sectionLabel}>Section {letter}</div>
          <h2 style={styles.title}>{title}</h2>
        </div>
      </div>
      <div style={styles.divider} />
      <div style={styles.fields}>{children}</div>
    </section>
  )
}

const styles = {
  section: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px',
    scrollMarginTop: '32px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  letter: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 4px 20px var(--accent-glow)',
  },
  sectionLabel: {
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.1em',
    color: 'var(--accent)',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    marginBottom: '28px',
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px 20px',
  },
}

export default FormSection
