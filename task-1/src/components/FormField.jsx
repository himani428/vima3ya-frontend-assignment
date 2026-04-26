import React from 'react'
import { useField } from 'formik'

/**
 * Reusable FormField component using Formik's useField hook.
 *
 * Props:
 *  - name: field key in Formik state
 *  - label: visible label text
 *  - type: input type (text | email | tel | etc.)
 *  - placeholder: input placeholder text
 *  - validator: preset validator type — "email" | "phone" | "required"
 *  - errorMessage: custom error message string (overrides default)
 *
 * Validation behaviour:
 *  - Errors only show after form submission attempt (controlled by `submitAttempted` prop)
 *  - After submit attempt, errors update live as user corrects them (Formik default with validateOnChange)
 */
const FormField = ({
  label,
  type = 'text',
  placeholder,
  submitAttempted,
  as: Component = 'input',
  rows,
  ...props
}) => {
  // useField binds this input to Formik state by `name`
  const [field, meta] = useField(props)

  // Only show error if:
  // 1. A submission has been attempted (not on focus/type before submit)
  // 2. The field has been touched (Formik sets touched on blur)
  // 3. There is an actual error
  const showError = submitAttempted && meta.touched && meta.error

  return (
    <div style={styles.fieldWrapper}>
      {label && (
        <label htmlFor={props.name} style={styles.label}>
          {label}
        </label>
      )}
      {Component === 'textarea' ? (
        <textarea
          id={props.name}
          {...field}
          placeholder={placeholder}
          rows={rows || 3}
          style={{
            ...styles.input,
            ...styles.textarea,
            ...(showError ? styles.inputError : {}),
          }}
        />
      ) : (
        <input
          id={props.name}
          type={type}
          {...field}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...(showError ? styles.inputError : {}),
          }}
        />
      )}
      <div style={styles.errorContainer}>
        {showError && (
          <span style={styles.errorText} role="alert">
            {meta.error}
          </span>
        )}
      </div>
    </div>
  )
}

const styles = {
  fieldWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '4px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-display)',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    // Focus styles applied via onFocus/onBlur inline would need state;
    // instead use CSS-in-JS trick via a class or just rely on :focus-within
  },
  textarea: {
    resize: 'vertical',
    minHeight: '80px',
  },
  inputError: {
    borderColor: 'var(--error)',
    background: 'var(--error-bg)',
  },
  errorContainer: {
    minHeight: '18px',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--error)',
    fontFamily: 'var(--font-mono)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
}

export default FormField
