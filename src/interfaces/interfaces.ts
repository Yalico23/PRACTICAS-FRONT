export type FormData = {
  email: string;
  password: string;
}

// -------------------------------

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

// --------------------------------

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
  mentorId: number;
  preguntas: Pregunta[];
}

// -----------------------

export interface listEvalaciones {
  id: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

// -----------------------
export interface OpcionRespuesta { opcionRespuesta: string; correcta: boolean; }
export interface Pregunta {
  pregunta: string;
  tipoPregunta: string;
  tiempo: number;
  valor: number;
  opcionRespuestas?: OpcionRespuesta[];
}
export interface EvaluacionFromAPI {
  id: number;
  titulo: string;
  descripcion: string;
  tags: string;
  activo: boolean;
  fechaCreacion: string;
  preguntas: Pregunta[];
  mentor: { id: number };
}
export interface Evaluacion {
  id: number;
  titulo: string;
  descripcion: string;
  tecnologia: string;
  estado: "Disponible" | "Completado";
  tiempo: string;
}
