import { io } from 'socket.io-client';
const server= "http://localhost:8000"
export const socket = io(server, {
    autoConnect: false
  });