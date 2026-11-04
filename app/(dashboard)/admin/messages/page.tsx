import React from 'react';
import ChatInterface from '@/components/shared/ChatInterface';

export default function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight text-sky-400">Admin Messaging</h1>
        <p className="text-sm text-slate-400 mt-1">Official communication channel for administrative support</p>
      </div>
      <ChatInterface />
    </div>
  );
}
