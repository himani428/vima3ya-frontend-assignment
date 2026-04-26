# Task 2 — Notes

## GLB File Size

The 3D model in this project is built **programmatically** inside Three.js (see `Viewer.jsx` → `buildModel()`), then exported in-memory as a GLB via `GLTFExporter`, and immediately parsed back by `GLTFLoader + DRACOLoader`.

This means there is no separate `.glb` file on disk — the "file" is generated at runtime. This approach was chosen to keep the repo self-contained and demonstrate the full loader pipeline without requiring Blender.

For a typical external GLB the compression savings look like:

| Stage | Size |
|---|---|
| Raw GLB (uncompressed) | ~420 KB |
| After `gltf-pipeline --draco.compressMeshes` | ~95 KB |
| Reduction | ~77% |

Draco compresses mesh vertex data (positions, normals, UVs) using a predictive algorithm — far more efficient than gzip alone because it exploits the spatial coherence of 3D geometry.

---

## Why Lazy-Loading Three.js Matters

Three.js minified is approximately **600 KB** of JavaScript. Without lazy loading:

- The browser must **download, parse, and compile** all 600 KB before it can execute any page code
- This directly delays **First Contentful Paint (FCP)** and **Largest Contentful Paint (LCP)** — Core Web Vitals that affect SEO and user experience
- On a 3G connection (~1.5 Mbit/s) that's an extra ~3 seconds of blank screen

With `const THREE = await import('three')` (or `React.lazy`):

- The page shell renders immediately with a spinner
- Three.js is downloaded in the background on a **separate network request**
- The user sees *something* faster, even if the 3D scene takes a moment longer
- Code splitting also means **other pages** in the same app don't pay the Three.js cost at all

---

## What Breaks Without `dispose()` in a Long-Running Session

Three.js objects (geometries, materials, textures, render targets) allocate memory **on the GPU**, not in the JavaScript heap. The JavaScript garbage collector has no visibility into GPU memory.

When you remove a mesh from the scene without calling `.dispose()`:

- **Geometry buffers** (vertex positions, normals, indices) remain allocated in GPU VRAM
- **Textures** stay uploaded to the GPU texture units
- **Shader programs** compiled for those materials are not freed
- **Render targets / framebuffers** accumulate if used for post-processing

In a long-running app (e.g. a product configurator where users swap models, or a game level loader):

- GPU memory grows unboundedly → `CONTEXT_LOST_WEBGL` error once VRAM is exhausted
- The browser tab crashes or freezes entirely
- On mobile devices (256–512 MB shared GPU memory) this can happen in minutes

**Correct cleanup pattern:**

```js
// Removing a mesh and freeing ALL its GPU resources:
scene.remove(mesh)
mesh.geometry.dispose()
mesh.material.dispose()       // also disposes textures referenced by the material
renderer.renderLists.dispose() // clear internal render lists
```

And when tearing down the entire renderer:

```js
renderer.dispose()
renderer.forceContextLoss() // explicitly releases the WebGL context
```

Without this, every component re-mount (e.g. React hot-reload, route change) leaks GPU memory permanently for that browser session.
