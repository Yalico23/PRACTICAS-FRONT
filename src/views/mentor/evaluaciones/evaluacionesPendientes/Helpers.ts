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

export const listarEvaluacionesPendientes = async (idMentor:number, token:string) => {
    try {
        const URL = `${import.meta.env.VITE_HOST_BACKEND}/api/evaluaciones/listPendingEvaluaciones?idMentor=${idMentor}`;
        const response = await fetch(URL,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener las evaluaciones pendientes');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        
    }
}

export const listarEvaluacionesEstudiante = async (idEvaluacion: number, token: string) => {

    try {
        const URL = `${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/evaluacionesPendientes/${idEvaluacion}`;
        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Error al obtener las evaluaciones del estudiante');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
    }

}