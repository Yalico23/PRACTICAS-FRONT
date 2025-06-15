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

export const verificarSiRespondioEvaluacion = async (idEvaluacion: number, idUsuario: number, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`http://localhost:8080/api/evaluacionEstudiante/validarEvaluacionDoble/${idEvaluacion}/${idUsuario}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log(response);
    if (!response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error al verificar evaluación:", error);
    return false;
  }
};
