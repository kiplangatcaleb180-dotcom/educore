// About Page Module: Provides information about EducoreHub's mission and commitment.
import React from 'react';
// Layout and UI components
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Card } from '@/components/ui/Card';
// Icons
import { GraduationCap, Award, ShieldCheck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      {/* Global site header */}
      <Header />

      <main className="flex-1 py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            {/* Mission identifier icon */}
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">About EducoreHub</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            EducoreHub is a next-generation Higher Education Learning Management System built to bridge real-time virtual teaching and administrative excellence.
          </p>
        </div>

        {/* Informational grid for mission and security pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 space-y-3">
            <Award className="w-8 h-8 text-sky-400" />
            <h3 className="text-xl font-bold text-white">Our Academic Mission</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              To provide universities with secure, high-performance digital infrastructure for seamless coursework, online proctoring, and student engagement.
            </p>
          </Card>

          <Card className="p-8 space-y-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Security & Integrity</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Equipped with tab-switch detection, encrypted database pipelines, and role-based middleware access to maintain academic standards.
            </p>
          </Card>
        </div>
      </main>

      {/* Global site footer */}
      <Footer />
    </div>
  );
}
