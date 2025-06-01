// pages/api/socket.ts
import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextApiResponseWithSocket, CursorPosition, SelectionRange } from '@/types/socket';

// Track rooms and users
const fileRooms = new Map<
  string,
  {
    content: string;
    users: Map<
      string,
      {
        name: string;
        color: string;
        position: CursorPosition;
        selection?: SelectionRange;
      }
    >;
  }
>();

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    return res.end();
  }

  console.log('Initializing Socket.io server');
  const io = new Server(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_SITE_URL,
      methods: ['GET', 'POST'],
    },
  });

  res.socket.server.io = io;

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a file room
    socket.on('join-file-room', ({ roomId, name, userId }) => {
      socket.join(roomId);
      
      if (!fileRooms.has(roomId)) {
        fileRooms.set(roomId, {
          content: '',
          users: new Map(),
        });
      }

      const room = fileRooms.get(roomId)!;
      const color = getRandomColor();
      room.users.set(userId, {
        name,
        color,
        position: { lineNumber: 1, column: 1 },
      });

      // Send current content to new user
      socket.emit('file-content', room.content);

      // Update all users with new presence
      io.to(roomId).emit('presence-update', Array.from(room.users.values()));
    });

    // Handle file changes
    socket.on('file-changes', ({ roomId, changes }) => {
      const room = fileRooms.get(roomId);
      if (!room) return;

      // Apply changes to content
      changes.forEach(change => {
        room.content = applyTextChange(
          room.content,
          change.range,
          change.text
        );
      });

      // Broadcast to other users in room
      socket.to(roomId).emit('file-changes', changes);
    });

    // Handle cursor position updates
    socket.on('cursor-update', ({ roomId, position, selection, userId }) => {
      const room = fileRooms.get(roomId);
      if (!room || !room.users.has(userId)) return;

      const user = room.users.get(userId)!;
      user.position = position;
      user.selection = selection;

      // Broadcast to other users
      socket.to(roomId).emit('presence-update', Array.from(room.users.values()));
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      fileRooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomId).emit('presence-update', Array.from(room.users.values()));
        }
      });
    });
  });

  res.end();
}

// Helper function to apply text changes
function applyTextChange(
  content: string,
  range: SelectionRange,
  newText: string
): string {
  const lines = content.split('\n');
  
  // Get affected lines
  const startLine = range.startLineNumber - 1;
  const endLine = range.endLineNumber - 1;
  
  // Modify lines
  const startLineText = lines[startLine].substring(0, range.startColumn - 1);
  const endLineText = lines[endLine].substring(range.endColumn - 1);
  const modifiedLine = startLineText + newText + endLineText;
  
  // Rebuild content
  lines.splice(
    startLine,
    endLine - startLine + 1,
    modifiedLine
  );
  
  return lines.join('\n');
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}