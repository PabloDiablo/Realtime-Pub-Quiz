export class DatabaseError extends Error {
  public name = 'DatabaseError';
}

export class NotFoundError extends Error {
  public name = 'NotFoundError';
}

export class NotAuthorizedError extends Error {
  public name = 'NotAuthorizedError';
}
