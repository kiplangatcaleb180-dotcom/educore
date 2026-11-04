// Home Page Module: Main landing page for the EducoreHub platform.
import React from 'react';
import Link from 'next/link';
// Auth and database tools
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// Layout and UI components
import { Header } from '@/components/public/Header';
import { Footer } from '@/components/public/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
// Icons
import {
  GraduationCap,
  Video,
  Award,
  CheckCircle2,
  ArrowRight,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Retrieve platform statistics from the database
  const [studentCount, courseCount, examCount, lecturerCount] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count(),
    prisma.exam.count(),
    prisma.user.count({ where: { role: 'LECTURER' } }),
  ]);

  const stats = [
    { label: 'Active Students', value: `${studentCount.toLocaleString()}+` },
    { label: 'Courses Managed', value: `${courseCount.toLocaleString()}+` },
    { label: 'Exams & CATs', value: `${examCount.toLocaleString()}+` },
    { label: 'Expert Faculty', value: `${lecturerCount.toLocaleString()}+` },
  ];

  const features = [
    {
      icon: <Video className="w-6 h-6 text-sky-400" />,
      title: 'WebRTC Live Virtual Classroom',
      description: 'Ultra-low latency HD video streaming, screen sharing, and interactive live chat for remote lectures.',
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-indigo-400" />,
      title: 'Automated CATs & Grading',
      description: 'Timed exams with tab-switch anti-cheating tracking, randomized question bank, and instant grading.',
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-400" />,
      title: 'Multi-Role Portal Access',
      description: 'Tailored dashboards for Students, Lecturers, Department Heads, and System Administrators.',
    },
  ];

  // Logic to determine the correct dashboard link for the current user
  const getDashboardLink = () => {
    if (!user) return '/login';
    const role = user.role.toLowerCase();
    if (role === 'admin' || role === 'superadmin') return '/admin';
    if (role === 'lecturer') return '/lecturer';
    if (role === 'student') return '/student';
    return '/login';
  };

  const dashboardLink = getDashboardLink();

  return (
    <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100">
      {/* Global site header */}
      <Header />

      <main className="flex-1">
        {/* Hero section with main headline and primary actions */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-500/20 via-slate-950/80 to-[#070a13]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <Badge variant="info" className="mb-6 px-4 py-1 text-sm border-sky-500/30 bg-sky-500/10">
              <Zap className="w-3.5 h-3.5 mr-1" /> Next-Generation University LMS
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
              Empowering Higher Education with <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-emerald-400">Real-Time Intelligence</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A unified digital campus platform integrating live classes, anti-cheating exam proctoring, attendance roll call, and academic performance analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={dashboardLink}>
                <Button size="lg" className="gap-2 px-8">
                  {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="secondary" size="lg" className="px-8">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Real-time platform usage statistics */}
        <section className="py-12 bg-slate-900/50 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-4">
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature showcase section */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Everything Your University Needs
            </h2>
            <p className="text-slate-400 text-lg">
              Designed from the ground up to streamline administration, teaching, and student engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="flex flex-col gap-4 p-8 hover:border-sky-500/40">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      {/* Global site footer */}
      <Footer />
    </div>
  );
}
