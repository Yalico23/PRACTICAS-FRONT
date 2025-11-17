import type { EntrevistaData } from "./types";

export const cargarUsuario = async (email: string, token: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/usuarioByEmail?email=${email}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Error al obtener el usuario:", response);
            return;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }
}

export const crearEntrevista = async (entrevista: any, token: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistas/crear`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entrevista)
        });
        if (!response.ok) {
            console.error("Error al crear la entrevista:", response);
            return;
        }
        return await response.json();

    } catch (error) {
        console.error("Error al crear la entrevista:", error);
    }
}

export const actualizarEntrevista = async (entrevista: EntrevistaData, token: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistas/modificar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(entrevista)
        });
        if (!response.ok) {
            console.error("Error al actualizar la entrevista:", response);
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("Error al actualizar la entrevista:", error);
    }
}

// * Agregar la funcion luego en el backend

export const cargarEntrevista = async (idEntrevista: number, token: string) => {
    console.log("Cargando entrevista con ID:", idEntrevista);
    try {
        const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistas/listEntrevistasById?idEntrevista=${idEntrevista}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const entrevistaData = await response.json();
            return entrevistaData;
        } else {
            console.error("Error al cargar la entrevista");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}
