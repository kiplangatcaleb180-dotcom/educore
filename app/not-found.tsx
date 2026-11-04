import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070a13] flex items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-6xl font-black text-white tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The campus page or resource you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="inline-block">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Campus Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
