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

export type UsuarioInfo = {
  id : number
  nombre : string;
  apellidos : string;
  email : string
}