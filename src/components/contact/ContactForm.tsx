'use client'

import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

type ContactFormState = {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
  website: string
}

type ContactFormStatus = 'idle' | 'submitting' | 'success' | 'error'

const initialState: ContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  subject: '',
  message: '',
  website: ''
}

export default function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(initialState)
  const [status, setStatus] = useState<ContactFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isSubmitting = status === 'submitting'
  const bannerMessage =
    status === 'success'
      ? 'Merci, votre message a bien ete envoye. Nous revenons vers vous rapidement.'
      : status === 'error'
        ? errorMessage || 'Une erreur est survenue.'
        : null
  const helperMessage =
    status === 'idle' ? 'Nous repondons rapidement a toutes les demandes.' : status === 'submitting' ? 'Envoi en cours...' : null

  const handleChange =
    (field: keyof ContactFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (status !== 'idle') {
        setStatus('idle')
        setErrorMessage('')
      }
      setFormState((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const payload = {
      firstName: formState.firstName.trim(),
      lastName: formState.lastName.trim(),
      email: formState.email.trim(),
      subject: formState.subject.trim(),
      message: formState.message.trim(),
      website: formState.website.trim()
    }

    if (!payload.firstName || !payload.lastName || !payload.email || !payload.subject || !payload.message) {
      setStatus('error')
      setErrorMessage('Merci de remplir tous les champs.')
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? 'Envoi impossible, merci de reessayer.')
      }

      setStatus('success')
      setFormState(initialState)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Une erreur est survenue.'
      setErrorMessage(message)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm md:grid-cols-2">
      {bannerMessage ? (
        <div
          role="status"
          aria-live="polite"
          className={`md:col-span-2 rounded-xl border px-5 py-4 text-sm font-montserrat ${
            status === 'success' ? 'border-black bg-black text-white' : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {bannerMessage}
        </div>
      ) : null}

      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          value={formState.website}
          onChange={handleChange('website')}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-last-name" className="text-[10px] font-montserrat uppercase tracking-[0.35em] text-black/60">
          Nom
        </label>
        <input
          id="contact-last-name"
          name="lastName"
          type="text"
          autoComplete="family-name"
          required
          maxLength={80}
          value={formState.lastName}
          onChange={handleChange('lastName')}
          className="h-12 border border-black/20 px-4 text-sm font-montserrat text-black placeholder:text-black/30 focus:border-black focus:outline-none"
          placeholder="Nom"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-first-name" className="text-[10px] font-montserrat uppercase tracking-[0.35em] text-black/60">
          Prenom
        </label>
        <input
          id="contact-first-name"
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
          maxLength={80}
          value={formState.firstName}
          onChange={handleChange('firstName')}
          className="h-12 border border-black/20 px-4 text-sm font-montserrat text-black placeholder:text-black/30 focus:border-black focus:outline-none"
          placeholder="Prenom"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="contact-email" className="text-[10px] font-montserrat uppercase tracking-[0.35em] text-black/60">
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={160}
          value={formState.email}
          onChange={handleChange('email')}
          className="h-12 border border-black/20 px-4 text-sm font-montserrat text-black placeholder:text-black/30 focus:border-black focus:outline-none"
          placeholder="nom@email.com"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="contact-subject" className="text-[10px] font-montserrat uppercase tracking-[0.35em] text-black/60">
          Objet
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          maxLength={160}
          value={formState.subject}
          onChange={handleChange('subject')}
          className="h-12 border border-black/20 px-4 text-sm font-montserrat text-black placeholder:text-black/30 focus:border-black focus:outline-none"
          placeholder="Votre demande"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label htmlFor="contact-message" className="text-[10px] font-montserrat uppercase tracking-[0.35em] text-black/60">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={2000}
          rows={6}
          value={formState.message}
          onChange={handleChange('message')}
          className="border border-black/20 px-4 py-3 text-sm font-montserrat text-black placeholder:text-black/30 focus:border-black focus:outline-none"
          placeholder="Votre message..."
        />
      </div>

      <div className="flex flex-col gap-4 md:col-span-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-black/60" role="status" aria-live="polite">
          {helperMessage}
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 border border-black bg-black px-6 text-[10px] font-montserrat uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}
