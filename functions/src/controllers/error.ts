import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import { NotFoundError, NotAuthorizedError } from '../types/errors';

export function notFoundError(req: Request, res: Response) {
  res.status(404).send('Not Found');
}

export function badRequestError(req: Request, res: Response) {
  res.status(400).send('Bad Request');
}

export function notAuthorizedError(req: Request, res: Response) {
  res.status(401).send('Not Authorized');
}

export function internalServerError(req: Request, res: Response, err: Error) {
  const isDev = process.env.NODE_ENV === 'development';

  res.status(500).send(isDev ? `Internal Server Error: ${err.message}` : 'Internal Server Error');
}

export function handleError(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof NotFoundError) {
    notFoundError(req, res);
  } else if (err.name === 'BadRequestError') {
    badRequestError(req, res);
  } else if (err instanceof NotAuthorizedError) {
    notAuthorizedError(req, res);
  } else {
    console.error(err);

    internalServerError(req, res, err);
  }
}
