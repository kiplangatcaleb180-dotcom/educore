import React from 'react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      <Header />
      <main className="flex-1 py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms of Service</h1>
        <Card className="p-8 space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>Welcome to EducoreHub. By accessing or using our university LMS portal, you agree to comply with academic integrity policies and portal guidelines.</p>
          <h3 className="text-base font-bold text-white">1. Academic Integrity & Proctoring</h3>
          <p>Online examinations monitored via tab-switch tracking require honest participation. Any attempt to bypass proctoring will result in submission cancellation.</p>
          <h3 className="text-base font-bold text-white">2. Account Responsibility</h3>
          <p>Users are responsible for maintaining the confidentiality of login credentials. Unauthorized sharing of accounts is strictly prohibited.</p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
