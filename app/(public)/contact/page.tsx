// Contact Page Module: Allows users to get in touch with campus support.
'use client';

import React, { useState } from 'react';
// Layout and UI components
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// Icons
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  // Feedback and form data states
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Handles form submission to support API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      <Header />

      <main className="flex-1 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Contact Campus Support</h1>
          <p className="text-slate-400 text-lg">Have questions? Get in touch with our administrative support team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Campus location information */}
            <Card className="p-6 flex items-center gap-4">
              <MapPin className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">University Campus HQ</h4>
                <p className="text-xs text-slate-400">Academic Administration Building</p>
              </div>
            </Card>

            {/* Email support details */}
            <Card className="p-6 flex items-center gap-4">
              <Mail className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Email Support</h4>
                <p className="text-xs text-slate-400">support@educore.edu</p>
              </div>
            </Card>

            {/* Phone hotline information */}
            <Card className="p-6 flex items-center gap-4">
              <Phone className="w-6 h-6 text-sky-400 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white">Phone Hotline</h4>
                <p className="text-xs text-slate-400">+254 700 000 000</p>
              </div>
            </Card>
          </div>

          <Card className="p-8">
            {submitted ? (
              <div className="text-center space-y-4 py-8">
                {/* Visual confirmation of successful submission */}
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                <p className="text-xs text-slate-400">Thank you for reaching out. We will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Alert box for any submission errors */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    {error}
                  </div>
                )}
                <Input
                  label="Your Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Message</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
