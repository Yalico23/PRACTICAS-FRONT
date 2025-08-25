import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";

interface infoEntrevistas {
  idEntrevistaEstudiante: number;
  nombreEstudiante: string;
  notaFinal: number;
}

const EntrevistasMentorPendientes = () => {

  const navigate = useNavigate();

  const { idEntrevista, titulo } = useParams();

  const [infoEntrevistas, setEntrevista] = useState<infoEntrevistas[]>([]);

  useEffect(() => {
    listarEntrevistasPendientes();
  }, []);

  const listarEntrevistasPendientes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/entrevistasPendientes/${idEntrevista}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json();
      setEntrevista(data);
    } catch (error) {
      console.error("Error fetching entrevistas pendientes:", error);
    }
  }

  const handleCalificarEntrevista = (idEntrevista: number) => {
    navigate(`/mentor/entrevista/calificar/${idEntrevista}`);
  }

  return (
    <>
      <h1>{titulo}</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Estudiante</th>
            <th>Nota Final</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {infoEntrevistas.map((entrevista) => (
            <tr key={entrevista.idEntrevistaEstudiante}>
              <td>{entrevista.idEntrevistaEstudiante}</td>
              <td>{entrevista.nombreEstudiante}</td>
              <td>{entrevista.notaFinal}</td>
              <td>
                <button onClick={() => handleCalificarEntrevista(entrevista.idEntrevistaEstudiante)}>Calificar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default EntrevistasMentorPendientes