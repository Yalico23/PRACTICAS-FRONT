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
  id: number
  nombre: string;
  apellidos: string;
  email: string
}

export interface OpcionRespuesta {
  opcionRespuesta: string;
  correcta: boolean;
}

export interface Pregunta {
  pregunta: string;
  tipoPregunta: string;
  tiempo: number;
  valor: number;
  opcionRespuestas?: OpcionRespuesta[];
}

export interface EvaluacionData {
  titulo: string;
  descripcion: string;
  tags: string;
  mentor: number;
  preguntas: Pregunta[];
}