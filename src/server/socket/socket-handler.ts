import { Socket } from '../types/socket';

import { addSocketToSession, removeSocketFromSession, reloadSessionData } from '../session';
import { sendMessageToAllPlayers } from './sender';

export function onSocketConnection(socket: Socket) {
  // reload session data
  reloadSessionData(socket.handshake.session).then(() => {
    const session = socket.handshake.session;
    const sessionId = session && session.id;
    const gameRoom = session && session.gameRoom;

    if (!session || !sessionId || !gameRoom) {
      console.log(`Socket connected but unknown session. SessionId: ${sessionId}  gameRoom: ${gameRoom}`);
      return;
    }

    const getStatusMessage = () => {
      const getTeamName = () => (session.isQuizMaster ? 'Quiz Master' : `Team: ${session.teamName}`);
      return `${sessionId} (${getTeamName()})`;
    };

    addSocketToSession(sessionId, socket);

    console.log(`Socket connected: ${getStatusMessage()}`);

    socket.on('disconnect', function close() {
      if (session.isQuizMaster) {
        sendMessageToAllPlayers(
          {
            messageType: 'QUIZ MASTER LEFT GAME'
          },
          session.gameRoom
        );
      }

      removeSocketFromSession(sessionId);

      console.log(`Socket disconnected: ${getStatusMessage()}`);
    });
  });
}
