export interface TopEntrevistas{
    nombre: string;
    apellidos: string;
    email: string;
    estudianteId: number;
    totalSesiones: number;
    sesionesCompletadas: number;
}

export interface ResumenEvaluaciones{
    descripcion: string;
    evaluacion: string;
    calificacionPromedio: number;
    calificacionMinima: number;
    calificacionMaxima: number;
    totalEstudiantesAsignados: number;
    completados: number;
}

export interface MejorPeorDesempeno{
    nombre: string;
    apellidos: string;
    email: string;
    evaluacionesRealizadas: number;
    calificacionPromedio: number;
    evaluacionesCompletadas: number;
}