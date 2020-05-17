import { Socket } from '../types/socket';

interface PlayerSession {
  id: string;
  teamId: string;
  gameRoom: string;
  isQuizMaster: boolean;
  socket?: Socket;
}

const sessions = new Map<string, PlayerSession>();

const activeGameRooms = new Map<string, Set<string>>();

// get session
export function getSessionById(id: string): PlayerSession | undefined {
  return sessions.get(id);
}

// session exists
export function hasSession(id: string): boolean {
  return sessions.has(id);
}

export function getPlayerCountByGameRoom(gameRoom: string): number {
  if (activeGameRooms.has(gameRoom)) {
    return activeGameRooms.get(gameRoom).size;
  }

  return 0;
}

// create session
export function createSession(id: string, teamId: string, gameRoom: string, isQuizMaster = false): void {
  // brand new session
  if (!sessions.has(id)) {
    const session = {
      id,
      teamId: String(teamId),
      gameRoom,
      isQuizMaster
    };

    console.log(`Session created: ${id} TeamId: ${teamId}`);

    sessions.set(id, session);
  } else {
    sessions.get(id).teamId = String(teamId);
  }

  if (activeGameRooms.has(gameRoom)) {
    activeGameRooms.get(gameRoom).add(id);
  }
}

// add socket to session
export function addSocketToSession(id: string, socket: Socket): void {
  console.log(`Adding socket to session: ${id}`);
  if (sessions.has(id)) {
    sessions.get(id).socket = socket;
  } else {
    console.log(`Session not found in map: ${id}`);
  }
}

// close socket
export function removeSocketFromSession(id: string): void {
  if (sessions.has(id)) {
    sessions.get(id).socket = undefined;
  }
}

// close session
export function removeSession(id: string): void {
  if (sessions.has(id)) {
    const gameRoom = sessions.get(id).gameRoom;

    if (activeGameRooms.has(gameRoom)) {
      activeGameRooms.get(gameRoom).delete(id);
    }

    sessions.delete(id);
  }
}

export function createGameRoom(gameRoom: string): void {
  activeGameRooms.set(gameRoom, new Set());
}

// close gameroom
export function closeGameroom(gameRoom: string): void {
  if (activeGameRooms.has(gameRoom)) {
    const playersInRoom = activeGameRooms.get(gameRoom);

    playersInRoom.forEach(player => {
      if (sessions.has(player)) {
        sessions.delete(player);
      }
    });

    activeGameRooms.delete(gameRoom);
  }
}

export function getSocketHandleByTeamName(teamId: string): Socket | undefined {
  for (const session of sessions.values()) {
    if (session.teamId === String(teamId)) {
      console.log(`Found session for ${teamId}`);
      return session.socket;
    }
  }

  console.log(`Failed to find socket for ${teamId}`, sessions);
}

export function getQuizMasterSocketHandleByGameRoom(gameRoom: string): Socket | undefined {
  for (const session of sessions.values()) {
    if (session.isQuizMaster && session.gameRoom === gameRoom) {
      return session.socket;
    }
  }
}

export function getAllSocketHandlesByGameRoom(gameRoom: string): Socket[] {
  const handles: Socket[] = [];

  for (const session of sessions.values()) {
    if (session.gameRoom === gameRoom && session.socket !== undefined) {
      handles.push(session.socket);
    }
  }

  return handles;
}

export function getAllSessions() {
  return sessions;
}
