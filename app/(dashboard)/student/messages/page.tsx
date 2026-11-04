import React from 'react';
import ChatInterface from '@/components/shared/ChatInterface';

export default function StudentMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Messages</h1>
        <p className="text-sm text-slate-400 mt-1">Communicate with your lecturers and peers in real-time</p>
      </div>
      <ChatInterface />
    </div>
  );
}
