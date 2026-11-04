'use client';

import { LiveClassRoom } from '@/components/live/LiveClassRoom';

interface LecturerRoomClientProps {
  liveClass: {
    id: number;
    title: string;
    course: { code: string; name: string };
    lecturer: { firstName: string; surname: string };
  };
  participantName: string;
}

export function LecturerRoomClient({ liveClass, participantName }: LecturerRoomClientProps) {
  return (
    <LiveClassRoom
      liveClass={liveClass}
      participantName={participantName}
      isHost
      leavePath="/lecturer/classes"
    />
  );
}
