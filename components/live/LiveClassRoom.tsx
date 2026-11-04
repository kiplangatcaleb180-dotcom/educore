// Module Title: Live Classroom Experience System
// Virtual classroom environment with video, audio, and attendance tracking.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// LiveKit components and tools
import {
  Chat,
  ConnectionStateToast,
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useParticipants,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
// Icons and standard components
import { AlertCircle, ArrowLeft, Camera, Info, MessageSquare, Mic, PhoneOff, Radio, ShieldCheck, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Internal component to track student presence during the live session
function AttendanceTracker({ classId }: { classId: number }) {
  useEffect(() => {
    // Initial join heartbeat notification to the server
    const sendHeartbeat = async () => {
      try {
        await fetch(`/api/live-class/${classId}/heartbeat`, { method: 'POST' });
      } catch (err) {
        console.error('Attendance heartbeat failed', err);
      }
    };

    sendHeartbeat();

    // Sends heartbeat every 30 seconds to confirm ongoing presence
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [classId]);

  return null;
}

interface LiveClassRoomProps {
  liveClass: {
    id: number;
    title: string;
    course: { code: string; name: string };
    lecturer: { firstName: string; surname: string };
  };
  participantName: string;
  isHost: boolean;
  leavePath: string;
}

interface JoinCredentials {
  token: string;
  serverUrl: string;
}

interface MediaChoices {
  audioEnabled: boolean;
  videoEnabled: boolean;
}

/**
 * Handles the visual rendering of the video conference grid and chat sidebar.
 */
function ClassroomConference() {
  const [chatOpen, setChatOpen] = useState(false);
  const participants = useParticipants();
  // Fetch active video and screen share tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Main stage for video streams */}
        <section className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Classroom stage</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-sky-400" /> {participants.length} participant{participants.length === 1 ? '' : 's'}</span>
          </div>
          {tracks.length > 0 ? (
            <div className="grid auto-rows-[minmax(12rem,1fr)] grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tracks.map((trackRef) => (
                <ParticipantTile
                  key={`${trackRef.participant.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? 'pending'}`}
                  trackRef={trackRef}
                  className="min-h-48 overflow-hidden rounded-xl border border-slate-800 bg-slate-900"
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
              <Video className="mb-3 h-10 w-10 text-slate-600" />
              <h2 className="font-bold text-slate-200">Waiting for video</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">When the lecturer or a participant enables their camera or screen share, it will appear here.</p>
            </div>
          )}
        </section>

        {/* Sidebar chat integration */}
        {chatOpen && (
          <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-900 sm:w-96">
            <Chat className="h-full" />
          </aside>
        )}
      </div>
      {/* Footer controls for mic, camera, and chat toggle */}
      <footer className="flex items-center justify-center gap-2 border-t border-slate-800 bg-slate-900/95 p-3">
        <ControlBar controls={{ chat: false, settings: false }} saveUserChoices={false} />
        <button
          type="button"
          onClick={() => setChatOpen((open) => !open)}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${chatOpen ? 'border-sky-400 bg-sky-500/10 text-sky-300' : 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
          aria-label={chatOpen ? 'Close chat' : 'Open chat'}
        >
          <MessageSquare className="h-4 w-4" /> Chat
        </button>
      </footer>
    </div>
  );
}

export function LiveClassRoom({
  liveClass,
  participantName,
  isHost,
  leavePath,
}: LiveClassRoomProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState<JoinCredentials | null>(null);
  const [choices, setChoices] = useState<MediaChoices | null>(null);
  const [joining, setJoining] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaAvailable, setMediaAvailable] = useState<boolean | null>(null);

  // Check for camera and microphone support on load
  useEffect(() => {
    const supported =
      window.isSecureContext &&
      Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
    setMediaAvailable(supported);
  }, []);

  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);

  // Authenticates with backend and retrieves room connection details
  const joinRoom = async (selectedChoices: MediaChoices) => {
    setJoining(true);
    setError(null);

    try {
      const response = await fetch(`/api/live-class/${liveClass.id}/token`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to join this live class.');
      }

      setChoices(selectedChoices);
      setCredentials({ token: payload.token, serverUrl: payload.serverUrl });
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Unable to join this live class.');
    } finally {
      setJoining(false);
    }
  };

  const joinClass = () => {
    void joinRoom({ audioEnabled: microphoneEnabled, videoEnabled: cameraEnabled && mediaAvailable === true });
  };

  // Host only: Terminates the class session for all users
  const endClass = async () => {
    if (!window.confirm('End this live class for every participant?')) return;

    setEnding(true);
    setError(null);

    try {
      const response = await fetch('/api/live-class/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: liveClass.id }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to end this live class.');
      }

      router.push(leavePath);
      router.refresh();
    } catch (endError) {
      setError(endError instanceof Error ? endError.message : 'Unable to end this live class.');
      setEnding(false);
    }
  };

  // Render pre-join selection screen if connection is not yet established
  if (!credentials || !choices) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Unit and class summary information */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Radio className="h-4 w-4 text-red-400" /> Secure live classroom
            </div>
            <h1 className="truncate text-xl font-black text-white">{liveClass.title}</h1>
            <p className="text-xs text-slate-400">{liveClass.course.code} — {liveClass.course.name}</p>
          </div>
          <Button variant="secondary" onClick={() => router.push(leavePath)} className="shrink-0 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>

        {/* Hardware check and media settings section */}
        <section className="edu-prejoin rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/30 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Check your camera and microphone</h2>
              <p className="mt-1 text-sm text-slate-400">You decide what to share before entering the room.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Encrypted media connection
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {mediaAvailable === null && (
            <div className="flex min-h-56 items-center justify-center text-sm text-slate-400">
              Preparing your device check…
            </div>
          )}

          {mediaAvailable === true && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setCameraEnabled((enabled) => !enabled)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${cameraEnabled ? 'border-sky-400/60 bg-sky-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-400'}`}
                >
                  <span className="flex items-center gap-3"><Camera className="h-5 w-5" /><span><span className="block font-bold">Camera</span><span className="text-xs opacity-75">{cameraEnabled ? 'On when you join' : 'Join with camera off'}</span></span></span>
                  <span className={`h-2.5 w-2.5 rounded-full ${cameraEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setMicrophoneEnabled((enabled) => !enabled)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${microphoneEnabled ? 'border-sky-400/60 bg-sky-500/10 text-white' : 'border-slate-700 bg-slate-950 text-slate-400'}`}
                >
                  <span className="flex items-center gap-3"><Mic className="h-5 w-5" /><span><span className="block font-bold">Microphone</span><span className="text-xs opacity-75">{microphoneEnabled ? 'On when you join' : 'Join muted'}</span></span></span>
                  <span className={`h-2.5 w-2.5 rounded-full ${microphoneEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                </button>
              </div>
              <Button onClick={joinClass} disabled={joining} className="w-full gap-2">
                <Video className="h-4 w-4" /> {joining ? 'Joining classroom…' : 'Join live class'}
              </Button>
              <p className="text-xs text-slate-500">Your browser will ask for camera or microphone permission only after you join.</p>
            </div>
          )}

          {mediaAvailable === false && (
            <div className="space-y-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
              <div className="flex gap-3 text-sm text-amber-100">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="font-bold">Camera and microphone are unavailable here.</p>
                  <p className="mt-1 text-amber-100/80">
                    Join in listen-only mode, or open the classroom in a modern browser over HTTPS to use your camera and microphone.
                  </p>
                </div>
              </div>
              <Button onClick={joinClass} disabled={joining} className="w-full gap-2">
                <Video className="h-4 w-4" /> {joining ? 'Joining classroom…' : 'Join without camera or microphone'}
              </Button>
            </div>
          )}

          {/* Quick labels for classroom features */}
          <div className="mt-6 grid gap-3 border-t border-slate-800 pt-5 text-xs text-slate-400 sm:grid-cols-3">
            <span className="flex items-center gap-2"><Video className="h-4 w-4 text-sky-400" /> Camera is optional</span>
            <span className="flex items-center gap-2"><Users className="h-4 w-4 text-violet-400" /> Use raise hand to speak</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Course members only</span>
          </div>
        </section>
      </div>
    );
  }

  return (
    <LiveKitRoom
      className="edu-livekit flex min-h-[calc(100vh-11rem)] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/40"
      token={credentials.token}
      serverUrl={credentials.serverUrl}
      connect
      audio={choices.audioEnabled}
      video={choices.videoEnabled}
      onDisconnected={() => {
        console.log('[LiveKit] Disconnected from room');
        router.push(leavePath);
      }}
      onError={(roomError) => {
        console.error('[LiveKit] Room error:', roomError);
        setError(`Connection failed: ${roomError.message}. This usually happens due to network issues or invalid credentials.`);
      }}
      onMediaDeviceFailure={() => setError('Your camera or microphone could not be started. Check browser permission, then use the call controls to try again.')}
    >
      <AttendanceTracker classId={liveClass.id} />
      <RoomAudioRenderer />
      <ConnectionStateToast />
      {/* Session header with live status and host controls */}
      <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/95 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-red-400">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" /></span>
            Live now
          </div>
          <h1 className="truncate text-base font-black text-white sm:text-lg">{liveClass.title}</h1>
          <p className="truncate text-xs text-sky-400">{liveClass.course.code} — {liveClass.course.name} · {isHost ? 'Host controls enabled' : `Instructor: ${liveClass.lecturer.firstName} ${liveClass.lecturer.surname}`}</p>
        </div>
        {isHost ? (
          <Button variant="danger" size="sm" disabled={ending} onClick={endClass} className="gap-2 self-start sm:self-auto">
            <PhoneOff className="h-4 w-4" /> {ending ? 'Ending…' : 'End class'}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" /> Secure room
          </div>
        )}
      </header>
      {error && <div className="m-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
      <ClassroomConference />
    </LiveKitRoom>
  );
}
