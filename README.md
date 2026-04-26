# vima3ya-frontend-assignment

Frontend engineering assignment — two standalone Vite + React apps.

---

## Quick Start

Each task is a separate app. Run them independently:

### Task 1 — Reusable Form System with Scroll Navigation

```bash
cd task-1
npm install
npm start        # or: npm run dev
```

Opens at **http://localhost:5173**

**What it does:**
- Two-column layout: fixed sidebar (left) + scrollable form (right)
- 4 form sections (A–D) with relevant fields per section
- Reusable `<FormField />` component built on Formik + Yup
- Errors only appear **after** the Submit button is clicked, then update live
- Sidebar bullets highlight **cumulatively** as sections scroll into view
- When all fields are valid, `onFormComplete()` fires a 3-second shimmer/skeleton overlay

---

### Task 2 — 3D Model Viewer (Three.js, Optimised Loading)

```bash
cd task-2
npm install
npm start        # or: npm run dev
```

Opens at **http://localhost:5173**

**What it does:**
- Three.js is lazy-loaded via `React.lazy` + `Suspense` + dynamic `import()`
- A programmatic 3D model (torus knot + orbital rings + floating icosahedra) is built with Three.js, exported as GLB in-memory via `GLTFExporter`, then loaded back via `GLTFLoader + DRACOLoader`
- Load time is logged to the browser console in milliseconds
- HUD overlay shows live load stats
- Full `dispose()` cleanup on unmount prevents GPU memory leaks
- See `task-2/NOTES.md` for file size comparison and technical explanations

---

## Repository Structure

```
vima3ya-frontend-assignment/
├── README.md
├── task-1/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       └── components/
│           ├── FormField.jsx
│           ├── FormSection.jsx
│           ├── Sidebar.jsx
│           └── ShimmerLoader.jsx
└── task-2/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── NOTES.md
    └── src/
        ├── main.jsx
        └── Viewer.jsx
```

## Tech Stack

| | Task 1 | Task 2 |
|---|---|---|
| Framework | React 18 + Vite | React 18 + Vite |
| Forms | Formik + Yup | — |
| 3D | — | Three.js (lazy) |
| Fonts | Syne + DM Mono | Syne + DM Mono |
