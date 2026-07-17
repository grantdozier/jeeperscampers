import React, { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';

const API_BASE = (process.env.REACT_APP_CHECKOUT_API_BASE || '').trim().replace(/\/+$/, '');
const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };

export default function ContactForm() {
  const [fields, setFields] = useState(EMPTY);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const update =
    (field: keyof typeof EMPTY) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      if (!API_BASE) throw new Error('The contact service is not configured yet.');
      const response = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Your message could not be sent.');
      setFields(EMPTY);
      setStatus('sent');
    } catch (submissionError: any) {
      setError(submissionError?.message || 'Your message could not be sent. Please try again.');
      setStatus('error');
    }
  };

  const fieldClass =
    'mt-2 w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-3 text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20';

  return (
    <section id="contact" className="border-t border-gray-700 bg-gray-950 px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-500">Talk with us</p>
          <h2 className="mb-4 text-3xl font-black sm:text-4xl">Let’s plan your Badland camper.</h2>
          <p className="max-w-md text-gray-300">
            Questions about a build, options, or availability? Send a message and the Badland Campers team will
            follow up directly.
          </p>
          <div className="mt-7 space-y-3 text-sm text-gray-300">
            <p className="flex items-center gap-3"><Mail className="text-orange-500" size={19} />matthew@badlandcampers.com</p>
            <p className="flex items-center gap-3"><MessageSquare className="text-orange-500" size={19} />Call or text Matt: (843) 540-8503</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl sm:p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-200">Name
              <input required maxLength={100} autoComplete="name" value={fields.name} onChange={update('name')} className={fieldClass} />
            </label>
            <label className="text-sm font-semibold text-gray-200">Email
              <input required type="email" maxLength={254} autoComplete="email" value={fields.email} onChange={update('email')} className={fieldClass} />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold text-gray-200">Subject
            <input required maxLength={160} value={fields.subject} onChange={update('subject')} className={fieldClass} />
          </label>
          <label className="mt-5 block text-sm font-semibold text-gray-200">Message
            <textarea required rows={6} maxLength={5000} value={fields.message} onChange={update('message')} className={`${fieldClass} resize-y`} />
          </label>
          <label className="hidden" aria-hidden="true">Website
            <input tabIndex={-1} autoComplete="off" value={fields.website} onChange={update('website')} />
          </label>
          {status === 'sent' && <p role="status" className="mt-5 rounded-lg border border-green-700 bg-green-950/50 px-4 py-3 text-green-200">Thanks—your message was sent. We’ll be in touch soon.</p>}
          {status === 'error' && <p role="alert" className="mt-5 rounded-lg border border-red-700 bg-red-950/50 px-4 py-3 text-red-200">{error}</p>}
          <button type="submit" disabled={status === 'sending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3.5 font-black text-white transition hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            <Send size={18} />{status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
