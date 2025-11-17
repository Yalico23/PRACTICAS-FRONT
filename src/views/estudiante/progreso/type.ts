export interface PromedioCalificacion {
    rangoCalificacion: string;
    promedioRango: number;
    cantidad: number;
}

export interface ComparacionPromedio {
    evaluacion: string;
    miCalificacion: number;
    diferenciaConPromedio: number;
    calificacionPromedioGeneral: number;
    posicionRelativa: string;
}

export interface ProgresoMensual {
    mesAnio: string;
    evaluacionesRealizadas: number;
    calificacionPromedio: number;
    calificacionMinima: number;
    calificacionMaxima: number;
}