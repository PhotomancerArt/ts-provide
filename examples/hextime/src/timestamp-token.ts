const TOKEN_VERSION = 1;

type TimestampTokenBody = {
  v: typeof TOKEN_VERSION;
  t: number;
};

export function encodeTimestampToken(epochMs: number) {
  const body: TimestampTokenBody = { v: TOKEN_VERSION, t: epochMs };
  return Buffer.from(JSON.stringify(body), 'utf8').toString('base64url');
}

export function decodeTimestampToken(token: string) {
  let body: unknown;

  try {
    body = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
  } catch (error) {
    throw new Error('Invalid timestamp token', { cause: error });
  }

  if (!isTimestampTokenBody(body)) {
    throw new Error('Invalid timestamp token');
  }

  return body.t;
}

function isTimestampTokenBody(value: unknown): value is TimestampTokenBody {
  return (
    value != null &&
    typeof value === 'object' &&
    'v' in value &&
    value.v === TOKEN_VERSION &&
    't' in value &&
    typeof value.t === 'number'
  );
}
