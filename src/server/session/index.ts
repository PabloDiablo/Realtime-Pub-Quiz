import { Socket } from '../types/socket';

const sessions = new Map<string, Socket>();

// add socket to session
export function addSocketToSession(id: string, socket: Socket): void {
  console.log(`Adding socket to session: ${id}`);

  sessions.set(id, socket);
}

// close socket
export function removeSocketFromSession(id: string): void {
  if (sessions.has(id)) {
    sessions.delete(id);
  }
}

export function getSocketHandleByTeamName(teamId: string): Socket | undefined {
  for (const socket of sessions.values()) {
    const session = socket.handshake.session;
    if (session && !session.isQuizMaster && session.teamId === String(teamId)) {
      console.log(`Found session for ${teamId}`);
      return socket;
    }
  }

  console.log(`Failed to find socket for ${teamId}`, sessions);
}

export function getQuizMasterSocketHandleByGameRoom(gameRoom: string): Socket | undefined {
  for (const socket of sessions.values()) {
    const session = socket.handshake.session;
    if (session && session.isQuizMaster && session.gameRoom === gameRoom) {
      return socket;
    }
  }
}

export function getAllSocketHandlesByGameRoom(gameRoom: string): Socket[] {
  const handles: Socket[] = [];

  for (const socket of sessions.values()) {
    const session = socket.handshake.session;

    if (session && session.gameRoom === gameRoom) {
      handles.push(socket);
    }
  }

  return handles;
}
