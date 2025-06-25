export interface OpcionRespuesta {
  id: number;
  opcionRespuesta: string;
  correcta: boolean;
}

export interface Pregunta {
  id: number;
  pregunta: string;
  tipoPregunta: 'opcion' | 'texto';
  valor: number;
  opcionRespuestas: OpcionRespuesta[];
}

export interface Evaluacion {
  id: number;
  titulo: string;
  descripcion: string;
  preguntas: Pregunta[];
}

export interface RespuestaEstudiante {
  id: number;
  respuesta?: string | null;
  nota?: number;
  pregunta: {
    id: number;
  };
  opcionRespuesta?: OpcionRespuesta | null;
}

export interface EvaluacionEstudiante {
  id: number;
  respuestaEstudiantes: RespuestaEstudiante[];
}

export interface RespuestaEvaluada {
  id: number | string; // Puede ser número real o string generado para no respondidas
  esCorrecta: boolean;
  nota: number;
  respuesta: string | null;
  pregunta: {
    id: number;
  };
  opcionRespuesta: OpcionRespuesta | null;
  preguntaCompleta: Pregunta;
  respondida: boolean;
}

export interface ResumenEvaluacion {
  puntosObtenidos: number;
  totalPuntos: number;
  preguntasRespondidas: number;
  totalPreguntas: number;
  notaFinal: number;
}