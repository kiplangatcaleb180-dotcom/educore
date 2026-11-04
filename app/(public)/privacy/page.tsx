import React from 'react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      <Header />
      <main className="flex-1 py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
        <Card className="p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>EducoreHub is committed to protecting user privacy and student academic records.</p>
          <h3 className="text-base font-bold text-white">1. Information Collection</h3>
          <p>We collect registration information, course enrollment records, assignment submissions, and exam results to deliver academic services.</p>
          <h3 className="text-base font-bold text-white">2. Data Security</h3>
          <p>Passwords are hashed using bcrypt. All session communications are transmitted securely via HTTPS and WSS protocols.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
