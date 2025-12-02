export interface Usuario {
    id: number | null;
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    mentor  : boolean;
    habilitado: boolean;    
}