import { io } from "socket.io-client";

const SOCKET_URL = process.env.NODE_ENV === 'production'
  ? "https://academic-event-7bk1.vercel.app"
  : (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') : "http://localhost:5000");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
});
