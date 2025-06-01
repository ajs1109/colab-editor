// types/socket.ts
import { NextApiResponse } from 'next';
import { Socket, Server } from 'socket.io';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    } & Partial<Server>;
  };
};
export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface SelectionRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  position: CursorPosition;
  selection?: SelectionRange;
}

export interface FileEditEvent {
  userId: string;
  filePath: string;
  changes: EditChange[];
}

export interface EditChange {
  range: SelectionRange;
  text: string;
  timestamp: number;
}