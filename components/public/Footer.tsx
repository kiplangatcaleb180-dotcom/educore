'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Icons for visual aid in contact info
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

/**
 * Footer Component
 * Displays institutional brand information, quick navigation, and contact details.
 */
export const Footer: React.FC = () => {
  const [year, setYear] = useState<number | string>('...');

  // Effect to set the current year on mount to avoid server/client mismatch
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-slate-900/90 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand and Mission statement */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-lg font-black text-white">EducoreHub</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering higher education institutions with real-time analytics, virtual classrooms, and automated assessment.
            </p>
          </div>

          {/* Quick navigation links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">Home</Link></li>
              <li><Link href="/services" className="hover:text-sky-400 transition-colors">Services</Link></li>
              <li><Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-sky-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Site legal and support documentation links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/support" className="hover:text-sky-400 transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Physical campus and support contact info */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Campus Contact</h4>
            <ul className="space-y-2 text-sm" suppressHydrationWarning>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Academic Campus HQ</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>support@educore.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>+254 700 000 000</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Global copyright and attribution footer bar */}
        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          &copy; {year} EducoreHub Inc. All rights reserved. Built for Higher Education Excellence.
        </div>
      </div>
    </footer>
  );
};
