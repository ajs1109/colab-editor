// lib/socket.ts
import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { EditChange, UserPresence } from '@/types/socket';

let socket: Socket;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState('N/A');

  useEffect(() => {
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
        withCredentials: true,
        transports: ['websocket'],
        autoConnect: false,
      });

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        setTransport(socket.io.engine.transport.name);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        setTransport('N/A');
      });

      socket.on('upgrade', (transport) => {
        setTransport(transport.name);
      });

      // Connect after setting up listeners
      socket.connect();
    }

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  return socket;
};

export const joinFileRoom = (
  socket: Socket,
  roomId: string,
  userData: { name: string; userId: string }
) => {
  socket.emit('join-file-room', { roomId, ...userData });
};

export const leaveFileRoom = (socket: Socket, roomId: string) => {
  socket.emit('leave-file-room', { roomId });
};

export const sendFileChanges = (
  socket: Socket,
  roomId: string,
  changes: EditChange[]
) => {
  socket.emit('file-changes', { roomId, changes });
};

export const subscribeToFileChanges = (
  socket: Socket,
  callback: (changes: EditChange[]) => void
) => {
  socket.on('file-changes', callback);
  return () => socket.off('file-changes', callback);
};

export const subscribeToPresenceUpdates = (
  socket: Socket,
  callback: (users: UserPresence[]) => void
) => {
  socket.on('presence-update', callback);
  return () => socket.off('presence-update', callback);
};