export interface Pregunta {
    id?: number;
    pregunta: string;
    tiempo: number;
    valor: number;
}

export interface mentor{
    id: number;
}

export interface EntrevistaData {
    id?: number;
    titulo: string;
    descripcion: string;
    mentor: mentor;
    preguntas: Pregunta[];
}