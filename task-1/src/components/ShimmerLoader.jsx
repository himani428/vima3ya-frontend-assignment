import React from 'react'

/**
 * ShimmerLoader — shown for 3 seconds when onFormComplete() fires,
 * simulating an API call response.
 */
const ShimmerLoader = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{ ...styles.shimmerBlock, width: '40px', height: '40px', borderRadius: '50%' }} />
          <div style={styles.headerText}>
            <div style={{ ...styles.shimmerBlock, width: '140px', height: '14px', borderRadius: '4px' }} />
            <div style={{ ...styles.shimmerBlock, width: '90px', height: '10px', borderRadius: '4px', marginTop: '8px' }} />
          </div>
        </div>
        <div style={styles.rows}>
          {[100, 80, 90, 70, 85].map((w, i) => (
            <div
              key={i}
              style={{
                ...styles.shimmerBlock,
                width: `${w}%`,
                height: '12px',
                borderRadius: '4px',
              }}
            />
          ))}
        </div>
        <div style={styles.footer}>
          <div style={{ ...styles.shimmerBlock, width: '120px', height: '36px', borderRadius: '8px' }} />
          <div style={{ ...styles.shimmerBlock, width: '80px', height: '36px', borderRadius: '8px' }} />
        </div>
        <div style={styles.label}>Processing submission…</div>
      </div>
    </div>
  )
}

const shimmerGradient = {
  background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)',
  backgroundSize: '600px 100%',
  animation: 'shimmer 1.6s infinite linear',
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '32px',
    width: '420px',
    maxWidth: '90vw',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  headerText: {
    flex: 1,
  },
  shimmerBlock: {
    ...shimmerGradient,
  },
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  label: {
    textAlign: 'center',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    letterSpacing: '0.04em',
  },
}

export default ShimmerLoader
