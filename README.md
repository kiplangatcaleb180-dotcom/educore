Educore-hub — Project scaffold

This workspace contains a frontend and backend scaffold for the Educore-hub project. Fill in real implementations in the created files.

Top-level folders:
- backend/
- frontend/

See backend/README.md and frontend/README.md for per-subproject instructions.

## Live classroom setup

Live classes use LiveKit for real-time WebRTC audio, video, screen sharing, and
in-room chat. Copy the variables in `.env.example` into the deployment
environment and set `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and
`LIVEKIT_API_SECRET`. The API key and secret are server-only values and must
never be exposed through `NEXT_PUBLIC_` environment variables.

When those values are absent, starting or joining a live class is safely
disabled. After configuration, lecturers start a class from the existing
Classes page and every participant completes the pre-join device check before
receiving a short-lived, course-authorized room token.
