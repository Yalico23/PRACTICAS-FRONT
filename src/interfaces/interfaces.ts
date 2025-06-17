// Interfaz para la autenticación de usuario
export type FormData = {
  email: string;
  password: string;
}

// Interfaz para el token JWT

export type JwTPayload = {
  sub: string;
  authorities: string; // viene como string JSON
  email: string;
  iat: number;
  exp: number;
}

// Interfaz para el usuario autenticado

export type UsuarioInfo = {
  id: number
  nombre: string;
  apellidos: string;
  email: string
}

// Interfaz para la evaluación

export interface OpcionRespuesta {
  id ?: number;
  opcionRespuesta: string;
  correcta: boolean;
}

export interface Pregunta {
  id ?: number;
  pregunta: string;
  tipoPregunta: string;
  tiempo: number;
  valor: number;
  opcionRespuestas?: OpcionRespuesta[];
}

export interface EvaluacionData {
  id ?: number;
  titulo: string;
  descripcion: string;
  tags: string;
  mentorId: number;
  preguntas: Pregunta[];
}

// Interfaz para la lista de evaluaciones parte del mentor

export interface listEvalaciones {
  id: number;
  titulo: string;
  descripcion: string;
  activo: boolean;
}

export interface EvaluacionEstudiante {
  id: number;
  titulo: string;
  descripcion: string;
  mentor: string;
  tecnologia: string;
  estado: string;
  tiempo: string;
}

// interfaces para dar la evaluacion por parte del estudiante
export interface evaluacionByIdEstudiante{
  id: number;
  titulo: string;
  preguntas: Pregunta[];
}

export type RespuestaEstudiante = {
  respuesta?: string;
  pregunta: {
    id: number;
  };
  opcionRespuesta?: {
    id: number;
  };
}