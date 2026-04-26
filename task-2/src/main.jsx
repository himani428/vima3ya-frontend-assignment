import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'

// React.lazy defers loading the heavy Viewer component (which dynamic-imports Three.js)
// until it is first rendered. This prevents Three.js from blocking the initial page render.
const Viewer = React.lazy(() => import('./Viewer.jsx'))

function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Viewer />
    </Suspense>
  )
}

// Shown by React.Suspense while the lazy component (and Three.js) are downloading
function Fallback() {
  return (
    <div style={fallbackStyles.wrap}>
      <div style={fallbackStyles.spinner} />
      <p style={fallbackStyles.text}>Loading viewer…</p>
    </div>
  )
}

const fallbackStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#060610',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(92,92,248,0.2)',
    borderTop: '3px solid #5c5cf8',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  text: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
    color: '#8888aa',
    letterSpacing: '0.06em',
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
