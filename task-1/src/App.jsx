import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import Sidebar from './components/Sidebar.jsx'
import FormField from './components/FormField.jsx'
import FormSection from './components/FormSection.jsx'
import ShimmerLoader from './components/ShimmerLoader.jsx'

// ─── Validation Schema ───────────────────────────────────────────────────────
// Each field uses a preset validator type ("email" | "phone" | "required")
// or falls back to a default "required" rule.
const buildValidator = (validatorType, customError) => {
  const msg = customError || 'This field is required'
  switch (validatorType) {
    case 'email':
      return Yup.string()
        .email(customError || 'Enter a valid email address')
        .required(msg)
    case 'phone':
      return Yup.string()
        .matches(/^[+\d][\d\s\-().]{7,}$/, customError || 'Enter a valid phone number')
        .required(msg)
    default:
      return Yup.string().required(msg)
  }
}

const validationSchema = Yup.object({
  // Section A — Personal Info
  firstName:   buildValidator('required', 'First name is required'),
  lastName:    buildValidator('required', 'Last name is required'),
  dob:         buildValidator('required', 'Date of birth is required'),

  // Section B — Contact Details
  email:       buildValidator('email'),
  phone:       buildValidator('phone'),
  address:     buildValidator('required', 'Address is required'),

  // Section C — Professional
  company:     buildValidator('required', 'Company / Organization is required'),
  role:        buildValidator('required', 'Job role is required'),
  experience:  buildValidator('required', 'Years of experience is required'),

  // Section D — Preferences
  timezone:    buildValidator('required', 'Timezone is required'),
  bio:         buildValidator('required', 'Short bio is required'),
  linkedin:    buildValidator('required', 'LinkedIn / portfolio URL is required'),
})

const initialValues = {
  firstName: '', lastName: '', dob: '',
  email: '', phone: '', address: '',
  company: '', role: '', experience: '',
  timezone: '', bio: '', linkedin: '',
}

// IDs for the 4 sections — must match the `id` on FormSection components
const SECTION_IDS = ['section-a', 'section-b', 'section-c', 'section-d']

export default function App() {
  const [activeIndex, setActiveIndex]   = useState(-1)   // highest section index scrolled into view
  const [submitAttempted, setSubmit]    = useState(false) // controls when errors appear
  const [showShimmer, setShowShimmer]   = useState(false) // shimmer overlay state
  const shimmerTimer = useRef(null)

  // ─── onFormComplete ─────────────────────────────────────────────────────────
  // Called when all fields across all sections are valid.
  // Shows shimmer for 3 seconds then hides it.
  // Re-triggers on every subsequent change as long as form stays valid.
  const onFormComplete = useCallback(() => {
    setShowShimmer(true)
    if (shimmerTimer.current) clearTimeout(shimmerTimer.current)
    shimmerTimer.current = setTimeout(() => setShowShimmer(false), 3000)
  }, [])

  // ─── Scroll Observer ────────────────────────────────────────────────────────
  // IntersectionObserver watches each section. Once a section enters the viewport,
  // its index is "unlocked" — bullets highlight cumulatively and never go back.
  useEffect(() => {
    const observers = []

    SECTION_IDS.forEach((id, i) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            // Cumulative: only ever increase activeIndex
            setActiveIndex(prev => Math.max(prev, i))
          }
        },
        {
          // Root is the scrollable container; threshold 0.15 means
          // 15% of the section must be visible to count it as "in view"
          root: null,
          threshold: 0.15,
        }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ─── Cleanup shimmer timer on unmount ────────────────────────────────────────
  useEffect(() => () => clearTimeout(shimmerTimer.current), [])

  return (
    <div style={styles.app}>
      <Sidebar activeIndex={activeIndex} />

      <main style={styles.main}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Application Form</h1>
          <p style={styles.pageSubtitle}>
            Complete all four sections to submit your application.
          </p>
        </div>

        {/* ─── Formik handles all form state, validation, and submission ─── */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnChange={true}   // live updates after first submit attempt
          validateOnBlur={true}     // fields are "touched" on blur, needed for error gating
          onSubmit={(values, actions) => {
            // Form is fully valid — this only fires if all validations pass
            console.log('Form submitted:', values)
            actions.setSubmitting(false)
          }}
        >
          {({ values, errors, isValid, dirty, touched, validateForm }) => {
            // Watch validity changes and fire onFormComplete
            // We use a side-effect triggered by render via useEffect inside Formik render.
            // This is safe because Formik re-renders on every field change.
            return (
              <FormWatcher
                values={values}
                isValid={isValid}
                onFormComplete={onFormComplete}
              >
                <Form noValidate style={styles.form}>
                  {/* ── Section A ── */}
                  <FormSection id="section-a" letter="A" title="Personal Info">
                    <FormField
                      name="firstName"
                      label="First Name"
                      placeholder="Jane"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="lastName"
                      label="Last Name"
                      placeholder="Doe"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="dob"
                      label="Date of Birth"
                      type="date"
                      placeholder=""
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                  </FormSection>

                  {/* ── Section B ── */}
                  <FormSection id="section-b" letter="B" title="Contact Details">
                    <FormField
                      name="email"
                      label="Email Address"
                      type="email"
                      placeholder="jane@example.com"
                      validator="email"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="phone"
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      validator="phone"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="address"
                      label="Street Address"
                      placeholder="123 Main St, City"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                  </FormSection>

                  {/* ── Section C ── */}
                  <FormSection id="section-c" letter="C" title="Professional">
                    <FormField
                      name="company"
                      label="Company / Organisation"
                      placeholder="Acme Corp"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="role"
                      label="Job Role / Title"
                      placeholder="Senior Engineer"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="experience"
                      label="Years of Experience"
                      type="number"
                      placeholder="5"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                  </FormSection>

                  {/* ── Section D ── */}
                  <FormSection id="section-d" letter="D" title="Preferences">
                    <FormField
                      name="timezone"
                      label="Timezone"
                      placeholder="Asia/Kolkata (IST)"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="linkedin"
                      label="LinkedIn / Portfolio URL"
                      placeholder="https://linkedin.com/in/janedoe"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                    <FormField
                      name="bio"
                      label="Short Bio"
                      as="textarea"
                      placeholder="Tell us a bit about yourself…"
                      validator="required"
                      submitAttempted={submitAttempted}
                    />
                  </FormSection>

                  {/* ── Submit Button ── */}
                  <div style={styles.submitRow}>
                    <button
                      type="submit"
                      onClick={() => setSubmit(true)}
                      style={styles.submitBtn}
                    >
                      Submit Application
                    </button>
                    {submitAttempted && !isValid && (
                      <span style={styles.formError}>
                        Please fix the errors above before submitting.
                      </span>
                    )}
                  </div>
                </Form>
              </FormWatcher>
            )
          }}
        </Formik>
      </main>

      {/* Shimmer overlay — visible for 3s when onFormComplete fires */}
      {showShimmer && <ShimmerLoader />}
    </div>
  )
}

// ─── FormWatcher ────────────────────────────────────────────────────────────
// Watches Formik state and fires onFormComplete() only when:
//   1. Every single field has a non-empty value (allFilled)
//   2. Yup reports the whole form as valid (no errors on any field)
//
// Why both checks?
// Formik's `isValid` is true by default on mount (no errors yet) and also
// when only *some* fields are filled — Yup only validates fields that have
// been touched or changed. So typing "h" in firstName makes that field valid
// while the other 11 empty fields are still untouched/unvalidated.
// We must guard with `allFilled` to ensure every field has actual content.
function FormWatcher({ values, isValid, onFormComplete, children }) {
  useEffect(() => {
    // Check every field in `values` has a non-empty, non-whitespace value
    const allFilled = Object.values(values).every(
      (v) => typeof v === 'string' && v.trim().length > 0
    )

    if (allFilled && isValid) {
      onFormComplete()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]) // Re-run on every keystroke; onFormComplete is stable via useCallback

  return children
}

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
  },
  main: {
    marginLeft: '240px',
    flex: 1,
    padding: '48px 56px',
    maxWidth: 'calc(100vw - 240px)',
  },
  pageHeader: {
    marginBottom: '40px',
    paddingBottom: '32px',
    borderBottom: '1px solid var(--border)',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  submitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    paddingTop: '12px',
  },
  submitBtn: {
    padding: '14px 40px',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    border: 'none',
    borderRadius: 'var(--radius)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s ease, transform 0.1s ease',
    boxShadow: '0 4px 24px var(--accent-glow)',
  },
  formError: {
    fontSize: '13px',
    color: 'var(--error)',
    fontFamily: 'var(--font-mono)',
  },
}
