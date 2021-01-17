let offset = 0;

export const setOffset = (serverTimeNow: number): void => {
  const localNow = Date.now();
  offset = localNow - serverTimeNow;
};

export const getOffset = () => offset;

export const toLocalTime = (time: number) => time + offset;
