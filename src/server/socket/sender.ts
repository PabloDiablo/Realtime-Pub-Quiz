import { getAllSocketHandlesByGameRoom, getQuizMasterSocketHandleByGameRoom, getSocketHandleByTeamName } from '../session';

export function sendMessageToAllPlayers(message: {}, gameRoom: string): void {
  const sockets = getAllSocketHandlesByGameRoom(gameRoom);
  sockets.forEach(playerSocket => playerSocket && playerSocket.send(JSON.stringify(message)));
}

export function sendMessageToQuizMaster(message: {}, gameRoom: string): void {
  const playerSocket = getQuizMasterSocketHandleByGameRoom(gameRoom);
  if (playerSocket) {
    playerSocket.send(JSON.stringify(message));
  }
}

export function sendMessageToTeam(message: {}, receivingTeamName: string): void {
  const playerSocket = getSocketHandleByTeamName(receivingTeamName);
  if (playerSocket) {
    playerSocket.send(JSON.stringify(message));
  } else {
    console.log(`Cannnot find socket for ${receivingTeamName}`);
  }
}
