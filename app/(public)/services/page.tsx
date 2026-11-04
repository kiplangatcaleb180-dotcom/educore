// Services Page Module: Displays core features and services offered by the LMS.
import React from 'react';
// Layout and UI components
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
// Icons
import { Video, BarChart3, Users, ShieldCheck, BookOpen, Clock } from 'lucide-react';

export default function ServicesPage() {
  // Mapping of institutional service offerings
  const servicesList = [
    { icon: <Video className="w-8 h-8 text-sky-400" />, title: 'Virtual WebRTC Classroom', description: 'HD multi-party video, screen sharing, and interactive live chat for lectures.' },
    { icon: <BarChart3 className="w-8 h-8 text-indigo-400" />, title: 'Online Assessment & Proctoring', description: 'Timed exams, randomized question banks, tab-switch monitoring, and auto-grading.' },
    { icon: <Users className="w-8 h-8 text-emerald-400" />, title: 'Multi-Role Campus Portal', description: 'Custom dashboards for Students, Lecturers, Department Heads, and Admins.' },
    { icon: <BookOpen className="w-8 h-8 text-amber-400" />, title: 'Digital Course Library', description: 'Centralized repository for syllabus documents, slide decks, and lecture recordings.' },
    { icon: <Clock className="w-8 h-8 text-purple-400" />, title: 'Attendance & Roll Call Tracking', description: 'Automated student check-ins, roll calls, and attendance trend analytics.' },
    { icon: <ShieldCheck className="w-8 h-8 text-red-400" />, title: 'Enterprise Security & Audit', description: 'Role-based access control, encrypted passwords, and detailed action audit logs.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      <Header />

      <main className="flex-1 py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with page title and description */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">Our Core LMS Services</h1>
          <p className="text-slate-400 text-lg">Comprehensive tools designed to transform digital higher education.</p>
        </div>

        {/* Grid for service feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((s, idx) => (
            <Card key={idx} className="p-8 space-y-4">
              <div className="p-3 w-fit rounded-xl bg-slate-800/80 border border-slate-700">{s.icon}</div>
              <h3 className="text-xl font-bold text-white">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.description}</p>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
