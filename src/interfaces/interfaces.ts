export type FormData = {
  email: string;
  password: string;
}

export type JwTPayload = {
  sub: string;
  authorities: string; // viene como string JSON
  email: string;
  iat: number;
  exp: number;
}