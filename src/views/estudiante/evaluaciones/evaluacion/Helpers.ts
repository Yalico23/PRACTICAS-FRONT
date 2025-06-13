export const getEvalucionById = async (idEvaluacion: number, token: string) => {
    try {
        const response = await 
        fetch(`http://localhost:8080/api/evaluaciones/listarEvaluacionById?idEvaluacion=${idEvaluacion}`, {
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
        alert("Error al obtener la evaluación");
    }
}

export const getUsuarioByemail = async (token: string, email: string) => {
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
        alert("Error al obtener el usuario");
    }
}