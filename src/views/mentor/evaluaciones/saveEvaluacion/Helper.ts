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

type Tecnologias = {
    value: string;
    label: string;
}

export const dataTecnologias: Tecnologias[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'react', label: 'React' },
    { value: 'angular', label: 'Angular' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'python', label: 'Python' },
    { value: 'php', label: 'PHP' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'react-native', label: 'React Native' },
    { value: 'html-css', label: 'HTML/CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'docker', label: 'Docker' },
    { value: 'aws', label: 'AWS' },
    { value: 'azure', label: 'Azure' },
    { value: 'otros', label: 'Otros' }
]