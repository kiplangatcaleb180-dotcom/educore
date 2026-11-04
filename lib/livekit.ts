/**
 * Server-only helpers for the LiveKit-backed classroom.
 * Keep LIVEKIT_API_SECRET in the deployment environment; it must never be
 * exposed to a browser or prefixed with NEXT_PUBLIC_.
 */
export const liveKitConfig = {
  url: process.env.LIVEKIT_URL,
  apiKey: process.env.LIVEKIT_API_KEY,
  apiSecret: process.env.LIVEKIT_API_SECRET,
};

export function isLiveKitConfigured() {
  return Boolean(liveKitConfig.url && liveKitConfig.apiKey && liveKitConfig.apiSecret);
}

export function getLiveClassRoomName(classId: number) {
  return `educore-live-class-${classId}`;
}

export function getLiveKitHttpUrl() {
  if (!liveKitConfig.url) return undefined;

  return liveKitConfig.url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
}

export function getLiveKitWsUrl() {
  if (!liveKitConfig.url) return undefined;

  // Returning the https:// version of the URL is recommended for browser clients.
  // The LiveKit SDK will automatically upgrade this to a WebSocket connection.
  // This is more compatible with corporate firewalls and proxy servers.
  return liveKitConfig.url.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
}
