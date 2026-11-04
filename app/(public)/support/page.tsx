import React from 'react';
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
import { HelpCircle, Mail, BookOpen } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      <Header />
      <main className="flex-1 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <HelpCircle className="w-12 h-12 text-sky-400 mx-auto" />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Help & Support Center</h1>
          <p className="text-slate-400 text-sm">Find answers to common portal questions or reach technical support.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-2">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <h3 className="font-bold text-white">How do I take timed CATs?</h3>
            <p className="text-xs text-slate-400">Log in to the Student Portal, navigate to "My CATs & Exams", and click "Take Exam". Make sure to stay on the exam tab during the test.</p>
          </Card>

          <Card className="p-6 space-y-2">
            <Mail className="w-6 h-6 text-indigo-400" />
            <h3 className="font-bold text-white">Account Approval Pending</h3>
            <p className="text-xs text-slate-400">New student/lecturer registrations require administrator approval. Contact your department administrator if approval is delayed.</p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
