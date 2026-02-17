'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDialog } from '@/hooks/useDialog'
import './RequestAccessModal.css'

interface RequestAccessModalProps {
  isOpen: boolean
  onClose: () => void
  source?: 'request-access' | 'get-in-touch'
}

export default function RequestAccessModal({ isOpen, onClose, source = 'request-access' }: RequestAccessModalProps) {
  const dialogRef = useDialog(isOpen, onClose)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    workType: '',
    workTypeOther: '',
    github: '',
    projectLink: '',
    socialPlatform: 'twitter',
    socialLink: '',
    source: source
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/request-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit request')
      }

      setSubmitStatus('success')

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          workType: '',
          workTypeOther: '',
          github: '',
          projectLink: '',
          socialPlatform: 'twitter',
          socialLink: '',
          source: source
        })
        setSubmitStatus('idle')
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="request-access-title" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <h2 className="modal-title" id="request-access-title">Request Access</h2>
        <p className="modal-subtitle">Fill out the form below and we'll get back to you soon.</p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="firstName">
              First Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Jane"
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">
              Last Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder="Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="workType">
              Type of work <span className="required">*</span>
            </label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="product">Product</option>
              <option value="marketing">Marketing</option>
              <option value="research">Research</option>
              <option value="other">Other</option>
            </select>
          </div>

          {formData.workType === 'other' && (
            <div className="form-group">
              <label htmlFor="workTypeOther">
                Please specify <span className="required">*</span>
              </label>
              <input
                type="text"
                id="workTypeOther"
                name="workTypeOther"
                value={formData.workTypeOther}
                onChange={handleChange}
                required
                placeholder="Enter your type of work"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="github">GitHub (optional)</label>
            <input
              type="text"
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="github.com/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="projectLink">Link to project (optional)</label>
            <input
              type="text"
              id="projectLink"
              name="projectLink"
              value={formData.projectLink}
              onChange={handleChange}
              placeholder="yourproject.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="socialLink">Social link (optional)</label>
            <div className="social-input-group">
              <select
                name="socialPlatform"
                value={formData.socialPlatform}
                onChange={handleChange}
                className="social-platform-select"
              >
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
                <option value="threads">Threads</option>
                <option value="bluesky">Bluesky</option>
                <option value="website">Website</option>
              </select>
              <input
                type="text"
                id="socialLink"
                name="socialLink"
                value={formData.socialLink}
                onChange={handleChange}
                placeholder="twitter.com/username"
                className="social-link-input"
              />
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="status-message success">
              ✓ Request submitted successfully! We'll be in touch soon.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="status-message error">
              ✗ Failed to submit request. Please try again.
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
