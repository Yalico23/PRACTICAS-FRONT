export const cargarEvaluacion = async (token: string, idEvaluacion: number) => {

    const URL = `http://localhost:8080/api/evaluaciones/listarEvaluacionById?idEvaluacion=${idEvaluacion}`;
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            }
        })
        if (!response.ok) {
            console.error("Error al obtener la evaluación:", response);
            return;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

export const cargarEvaluacionEstudiante = async (token: string, idEvaliacionEstudiante: number) => {

    const URL = `http://localhost:8080/api/evaluacionEstudiante/evaluacionesEstudiante/${idEvaliacionEstudiante}`
    try {
        const respone = await fetch(URL, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json; charset=UTF-8',
                'Authorization': `Bearer ${token}`
            }
        });
        if (!respone.ok) {
            console.error("Error al obtener la evaluación del estudiante:", respone);
            return;
        }
        const data = await respone.json();
        return data;

    } catch (error) {
        console.error("Error:", error);
    }
}