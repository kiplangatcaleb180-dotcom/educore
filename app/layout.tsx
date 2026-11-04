import type { Metadata } from 'next';
import '@/app/globals.css';
import '@livekit/components-styles';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'EducoreAPP — Higher Education Learning Management System',
  description: 'Enterprise-grade Learning Management System & Virtual Campus Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#070a13] text-slate-100 antialiased selection:bg-sky-500 selection:text-white">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
