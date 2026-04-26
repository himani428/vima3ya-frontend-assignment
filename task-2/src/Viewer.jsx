import React, { useEffect, useRef, useState } from 'react'

/**
 * Viewer — lazy-loads Three.js via dynamic import(), builds a simple
 * geometric model (box + pyramid + orbital rings) programmatically,
 * exports it as GLB via GLTFExporter, then loads it back through
 * GLTFLoader + DRACOLoader — exercising the full optimised-loading pipeline.
 *
 * Classic colour palette: deep navy background, gold primary, ivory/cream accents.
 */
export default function Viewer() {
  const canvasRef = useRef(null)
  const mountRef  = useRef(null)
  const [status,  setStatus]  = useState('init')
  const [loadMs,  setLoadMs]  = useState(null)

  useEffect(() => {
    let animId
    let disposed = false
    let cleanupFn = null

    async function init() {
      setStatus('loading')

      // ── Dynamic import — Three.js is NOT in the initial bundle ──────────
      // This means the page shell (spinner) renders immediately; Three.js
      // (~600 KB) downloads in the background on a separate network request.
      const THREE = await import('three')
      const { GLTFLoader }    = await import('three/addons/loaders/GLTFLoader.js')
      const { DRACOLoader }   = await import('three/addons/loaders/DRACOLoader.js')
      const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
      const { GLTFExporter }  = await import('three/addons/exporters/GLTFExporter.js')

      if (disposed) return

      const container = mountRef.current
      const W = container.clientWidth
      const H = container.clientHeight

      // ── Scene ────────────────────────────────────────────────────────────
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x080c1a)
      scene.fog = new THREE.FogExp2(0x080c1a, 0.025)

      // ── Camera ──────────────────────────────────────────────────────────
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
      camera.position.set(0, 2.5, 7)

      // ── Renderer ────────────────────────────────────────────────────────
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.4

      // ── Lights ──────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xc8b8e8, 0.5))

      const keyLight = new THREE.DirectionalLight(0xfff5d6, 3.5)
      keyLight.position.set(5, 10, 6)
      keyLight.castShadow = true
      keyLight.shadow.mapSize.setScalar(2048)
      scene.add(keyLight)

      const fillLight = new THREE.DirectionalLight(0x4060c0, 1.2)
      fillLight.position.set(-6, 3, -4)
      scene.add(fillLight)

      // Gold point light that orbits — creates dynamic shimmer on model surfaces
      const goldLight = new THREE.PointLight(0xffc844, 4, 12)
      scene.add(goldLight)

      // ── Ground + grid ────────────────────────────────────────────────────
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.MeshStandardMaterial({ color: 0x0d1225, metalness: 0.1, roughness: 0.95 })
      )
      ground.rotation.x = -Math.PI / 2
      ground.position.y = -2
      ground.receiveShadow = true
      scene.add(ground)
      const grid = new THREE.GridHelper(20, 20, 0x1a2545, 0x1a2545)
      grid.position.y = -1.99
      scene.add(grid)

      // ── Build the programmatic model ─────────────────────────────────────
      const modelGroup = buildModel(THREE)
      scene.add(modelGroup)

      // ── Controls ────────────────────────────────────────────────────────
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.06
      controls.minDistance = 3
      controls.maxDistance = 18
      controls.maxPolarAngle = Math.PI * 0.55
      controls.target.set(0, 0, 0)

      // ── DRACOLoader + GLTFLoader ─────────────────────────────────────────
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath(
        'https://www.gstatic.com/draco/versioned/decoders/1.5.6/'
      )
      dracoLoader.preload()

      const gltfLoader = new GLTFLoader()
      gltfLoader.setDRACOLoader(dracoLoader)

      // ── Export → parse cycle ─────────────────────────────────────────────
      // Demonstrates the full GLTFExporter → DRACOLoader/GLTFLoader pipeline.
      const exporter = new GLTFExporter()
      const start = performance.now()

      exporter.parse(
        modelGroup,
        (glbBuffer) => {
          if (disposed) return
          gltfLoader.parse(
            glbBuffer,
            '',
            (gltf) => {
              if (disposed) return
              const elapsed = (performance.now() - start).toFixed(2)
              console.log(`Model loaded in ${elapsed}ms`)
              setLoadMs(elapsed)

              // Swap out raw group for the loaded GLTF scene
              scene.remove(modelGroup)
              disposeGroup(modelGroup)

              gltf.scene.traverse(c => {
                if (c.isMesh) { c.castShadow = true; c.receiveShadow = true }
              })
              scene.add(gltf.scene)
              setStatus('ready')
            },
            (err) => { console.error(err); setStatus('error') }
          )
        },
        (err) => { console.error(err); setStatus('error') },
        { binary: true }
      )

      // ── Resize ──────────────────────────────────────────────────────────
      const onResize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // ── Animation loop ───────────────────────────────────────────────────
      let t = 0
      const animate = () => {
        animId = requestAnimationFrame(animate)
        t += 0.008
        controls.update()

        // Orbit the gold point light for dynamic shimmer
        goldLight.position.set(
          Math.sin(t * 0.9) * 4,
          2 + Math.sin(t * 0.5) * 1.5,
          Math.cos(t * 0.9) * 4
        )

        // Gently float + spin every loaded group
        scene.traverse(child => {
          if (child.isGroup && child !== scene) {
            child.rotation.y = t * 0.35
            child.position.y = Math.sin(t * 1.2) * 0.18
          }
        })

        renderer.render(scene, camera)
      }
      animate()

      // ── Full cleanup — prevents GPU memory leaks on unmount ──────────────
      cleanupFn = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('resize', onResize)
        controls.dispose()
        dracoLoader.dispose()
        scene.traverse(child => {
          if (!child.isMesh) return
          child.geometry.dispose()
          const m = child.material
          ;(Array.isArray(m) ? m : [m]).forEach(mat => mat.dispose())
        })
        renderer.dispose()
        renderer.forceContextLoss()
      }
    }

    init().catch(console.error)
    return () => {
      disposed = true
      cancelAnimationFrame(animId)
      cleanupFn && cleanupFn()
    }
  }, [])

  return (
    <div ref={mountRef} style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div style={styles.overlay}>
          <div style={styles.loaderWrap}>
            <div style={styles.loaderRing} />
            <div style={styles.loaderRingInner} />
            <div style={styles.loaderDiamond} />
          </div>
          <p style={styles.loaderTitle}>Preparing Scene</p>
          <p style={styles.loaderSub}>Loading Three.js · Initialising DRACO</p>
        </div>
      )}

      {/* HUD */}
      {status === 'ready' && (
        <div style={styles.hud}>
          <div style={styles.hudTitle}>
            <span style={styles.hudPulse} />
            LIVE RENDER
          </div>
          <div style={styles.hudRow}>
            <span style={styles.hudKey}>Load time</span>
            <span style={styles.hudVal}>{loadMs} ms</span>
          </div>
          <div style={styles.hudRow}>
            <span style={styles.hudKey}>Loader</span>
            <span style={styles.hudVal}>DRACO · GLTF</span>
          </div>
          <div style={styles.hudRow}>
            <span style={styles.hudKey}>Renderer</span>
            <span style={styles.hudVal}>WebGL2</span>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <div style={styles.hint}>
          <span>Drag to orbit</span>
          <span style={styles.hintDivider}>·</span>
          <span>Scroll to zoom</span>
        </div>
      )}

      {status === 'error' && (
        <div style={styles.overlay}>
          <p style={{ color: '#ff6b6b', fontFamily: 'monospace' }}>
            Failed to load 3D model.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes spinR     { to { transform: rotate(-360deg); } }
        @keyframes bob       { 0%,100%{transform:translateY(0) rotate(45deg)} 50%{transform:translateY(-6px) rotate(45deg)} }
        @keyframes hudPulse  { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
      `}</style>
    </div>
  )
}

// ─── buildModel — simple box + 4-sided pyramid + orbital rings ────────────────
function buildModel(THREE) {
  const group = new THREE.Group()

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a017, metalness: 0.92, roughness: 0.12,
    emissive: 0x3a2000, emissiveIntensity: 0.25,
  })
  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xf5f0e0, metalness: 0.3, roughness: 0.45,
  })
  const navyMat = new THREE.MeshStandardMaterial({
    color: 0x1a2b6d, metalness: 0.6, roughness: 0.3,
    emissive: 0x080f2a, emissiveIntensity: 0.4,
  })
  const darkGoldMat = new THREE.MeshStandardMaterial({
    color: 0xb8860b, metalness: 0.85, roughness: 0.2,
  })

  // Base box
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4, 4, 4, 4), ivoryMat)
  box.position.y = -0.3
  box.castShadow = true
  group.add(box)

  // Pyramid (4-sided cone) on top of box
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.5, 4, 1), goldMat)
  cone.position.y = 1.45
  cone.rotation.y = Math.PI / 4  // align edges with box corners
  cone.castShadow = true
  group.add(cone)

  // Gold orb at tip
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), goldMat)
  tip.position.y = 2.22
  tip.castShadow = true
  group.add(tip)

  // Three flat torus rings at varied orientations
  ;[
    { r: 1.8, tube: 0.035, rot: [0, 0, 0],              mat: goldMat },
    { r: 2.1, tube: 0.028, rot: [Math.PI / 2, 0, 0],    mat: darkGoldMat },
    { r: 2.4, tube: 0.022, rot: [Math.PI / 3, 0, 0.5],  mat: navyMat },
  ].forEach(({ r, tube, rot, mat }) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 100), mat)
    mesh.rotation.set(...rot)
    mesh.castShadow = true
    group.add(mesh)
  })

  // Small octahedra (diamond shapes) orbiting the equatorial ring
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1, 0),
      i % 2 === 0 ? goldMat : darkGoldMat
    )
    mesh.position.set(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.8)
    mesh.castShadow = true
    group.add(mesh)
  }

  return group
}

// ─── disposeGroup — free GPU buffers held by a Three.js group ─────────────────
function disposeGroup(obj) {
  obj.traverse(child => {
    if (!child.isMesh) return
    child.geometry.dispose()
    const m = child.material
    ;(Array.isArray(m) ? m : [m]).forEach(mat => mat.dispose())
  })
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  container: {
    position: 'relative', width: '100vw', height: '100vh',
    overflow: 'hidden', background: '#080c1a',
    fontFamily: "'DM Mono', monospace",
  },
  canvas: { display: 'block', width: '100%', height: '100%' },

  overlay: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'rgba(8,12,26,0.96)', backdropFilter: 'blur(14px)',
    gap: '18px',
  },
  loaderWrap: {
    position: 'relative', width: '72px', height: '72px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  loaderRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '2px solid rgba(212,160,23,0.15)',
    borderTop: '2px solid #d4a017',
    animation: 'spin 1s linear infinite',
  },
  loaderRingInner: {
    position: 'absolute', inset: '12px', borderRadius: '50%',
    border: '2px solid rgba(245,240,224,0.1)',
    borderBottom: '2px solid #f5f0e0',
    animation: 'spinR 1.4s linear infinite',
  },
  loaderDiamond: {
    width: '14px', height: '14px', background: '#d4a017',
    transform: 'rotate(45deg)',
    animation: 'bob 1.6s ease-in-out infinite',
    boxShadow: '0 0 16px rgba(212,160,23,0.7)',
  },
  loaderTitle: {
    fontSize: '15px', fontWeight: '600', color: '#f5f0e0',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    fontFamily: "'Syne', sans-serif",
  },
  loaderSub: { fontSize: '11px', color: '#6070a0', letterSpacing: '0.06em' },

  hud: {
    position: 'absolute', top: '24px', left: '24px',
    background: 'rgba(8,12,26,0.82)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(212,160,23,0.2)', borderRadius: '10px',
    padding: '16px 20px', minWidth: '170px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  hudTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '10px', letterSpacing: '0.14em', color: '#d4a017',
    fontWeight: '500', textTransform: 'uppercase', marginBottom: '2px',
  },
  hudPulse: {
    display: 'inline-block', width: '6px', height: '6px',
    borderRadius: '50%', background: '#d4a017',
    animation: 'hudPulse 2s ease-in-out infinite',
  },
  hudRow: { display: 'flex', justifyContent: 'space-between', gap: '16px' },
  hudKey: { fontSize: '11px', color: '#6070a0' },
  hudVal: { fontSize: '11px', color: '#f5f0e0', fontWeight: '500' },

  hint: {
    position: 'absolute', bottom: '28px', left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: '12px',
    fontSize: '12px', color: '#3a4a70', letterSpacing: '0.05em',
    background: 'rgba(8,12,26,0.7)', backdropFilter: 'blur(10px)',
    padding: '9px 22px', borderRadius: '100px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  hintDivider: { color: '#1e2840' },
}
