import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface datoEntrevista {
    id: number;
    fechaEntrevista: string;
    urlvideo: string;
}

const EntrevistaPendiente = () => {

    const { idEntrevista } = useParams();

    const [entrevista, setEntrevista] = useState<datoEntrevista>();

    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarEntrevista()
    }, []);

    const cargarEntrevista = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/buscarEntrevistaEstudiante?idEntrevistaEstudiante=${idEntrevista}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            const data: datoEntrevista = await response.json();
            setEntrevista(data);
        } catch (error) {
            console.error("Error al cargar la entrevista:", error);
        }
    }

    return (
        <>
            <video
                src={entrevista?.urlvideo}
                controls
                width="640"
                height="360"
            />

        </>
    )
}

export default EntrevistaPendiente