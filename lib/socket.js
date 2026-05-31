import { io } from "socket.io-client";

// Strip /api from the NEXT_PUBLIC_API_URL to get the root server URL
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL 
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
  : "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});
