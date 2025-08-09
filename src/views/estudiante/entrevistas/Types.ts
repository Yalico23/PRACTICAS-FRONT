export type JwTPayload = {
  sub: string;
  authorities: string; 
  email: string;
  iat: number;
  exp: number;
}

export interface ListaEntrevistas {
    id: number;
    nombre: string;
    descripcion:string;
    mentor: string;
    estado: string;
    tiempo: string;
}

export interface PaginatedResponse {
    content: ListaEntrevistas[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface PreguntasEntrevista{
    id: number;
    pregunta: string;
    tiempo: number;
    valor: number;
}

export interface Entrevista {
    id: number;
    titulo: number;
    preguntas: PreguntasEntrevista[];
}

// const timerRef = useRef<number | null>(null);