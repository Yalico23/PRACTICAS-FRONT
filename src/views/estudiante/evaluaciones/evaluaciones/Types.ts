export type JwTPayload = {
  sub: string;
  authorities: string; 
  email: string;
  iat: number;
  exp: number;
}

export interface ListaEvaluaciones {
    id: number;
    titulo: string;
    descripcion: string;
    mentor: string;
    tecnologia: string;
    estado: string;
    tiempo: string;
    feedback: string;
}

export interface PaginatedResponse {
    content: ListaEvaluaciones[];
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