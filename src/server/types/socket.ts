import { IncomingMessage } from 'http';

export interface IncomingSocketMessage extends IncomingMessage {
  session: Express.Session;
}
