interface SocketHandshake extends SocketIO.Handshake {
  session: Express.Session;
}

export interface Socket extends SocketIO.Socket {
  handshake: SocketHandshake;
}
