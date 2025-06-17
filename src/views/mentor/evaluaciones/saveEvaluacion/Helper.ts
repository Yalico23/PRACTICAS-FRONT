export const cargarUsuario = async (email: string, token: string) => {
    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/usuarioByEmail?email=${email}`, {
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

export const crearEvaluacion = async (evaluacion: any, token: string) => {
    try {
        const response = await fetch('http://localhost:8080/api/evaluaciones/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(evaluacion)
        });
        console.log("Evaluación a crear:", evaluacion);
        if (!response.ok) {
            console.error("Error al crear la evaluación:", response);
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("Error al crear la evaluación:", error);
    }
}

export const actualizarEvaluacion = async (evaluacion: any, token: string) => {
    try {
        const response = await fetch(`http://localhost:8080/api/evaluaciones/actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(evaluacion)
        });
        console.log("Evaluación a actualizar:", evaluacion);
        if (!response.ok) {
            console.error("Error al actualizar la evaluación:", response);
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("Error al actualizar la evaluación:", error);
    }
}

export const cargarEvaluacion = async (idEvaluacion: number, token: string) => {
    try {
        const response = await fetch(`http://localhost:8080/api/evaluaciones/listarEvaluacionById?idEvaluacion=${idEvaluacion}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const evaluacionData = await response.json();
            return evaluacionData;
        } else {
            console.error("Error al cargar la evaluación");
        }
    } catch (error) {
        console.error("Error de conexión:", error);
    }
}