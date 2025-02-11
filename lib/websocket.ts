import { io } from "socket.io-client"

// Define the URL and token from environment variables,
// adding "http://" as a fallback default protocol.
const SOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || "ws://78.46.77.85:20646";
const SOCKET_AUTH_TOKEN = process.env.NEXT_PUBLIC_WEBSOCKET_AUTH_TOKEN;

// Debug logging: verify that the URL and token are as expected
console.log("Connecting to WebSocket at:", SOCKET_URL);
console.log("Using Auth Token:", SOCKET_AUTH_TOKEN);

/* 
  Added Error Throttling:
  We log errors only once per defined interval to avoid spam.
*/
const LOG_INTERVAL = 10000; // 10 seconds in milliseconds
let lastLogTime = 0;

function logThrottled(label: string, error: any) {
    const now = Date.now();
    if (now - lastLogTime > LOG_INTERVAL) {
        console.error(label, error);
        lastLogTime = now;
    }
}

export const socket = io(SOCKET_URL, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: true,
    reconnectionAttempts: 3,
    timeout: 5000,
    query: {
        token: SOCKET_AUTH_TOKEN,
    },
})

socket.on('connect', () => {
    console.log('Connected to WebSocket server')
})

socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket server')
})

socket.on('error', (error) => {
    logThrottled('WebSocket error:', error)
})

socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected to WebSocket server on attempt:', attemptNumber)
})

socket.on('reconnect_error', (error) => {
    logThrottled('WebSocket reconnection error:', error)
})

socket.on('reconnect_failed', () => {
    console.log('WebSocket reconnection failed')
})

socket.on('connect_error', (error) => {
    logThrottled('WebSocket connection error:', error)
})

socket.on('connect_timeout', () => {
    console.error('WebSocket connection timeout')
})

socket.on('reconnect_delay', (delay) => {
    console.log('WebSocket reconnecting in:', delay, 'ms')
})

