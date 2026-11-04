'use client';

import { LiveClassRoom } from '@/components/live/LiveClassRoom';

interface StudentRoomClientProps {
  liveClass: {
    id: number;
    title: string;
    course: { code: string; name: string };
    lecturer: { firstName: string; surname: string };
  };
  participantName: string;
}

export function StudentRoomClient({ liveClass, participantName }: StudentRoomClientProps) {
  return (
    <LiveClassRoom
      liveClass={liveClass}
      participantName={participantName}
      isHost={false}
      leavePath="/student/live-classes"
    />
  );
}
