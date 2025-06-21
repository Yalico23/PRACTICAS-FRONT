import { useEffect, useState } from "react";
import { listarEvaluacionesEstudiante } from "./Helpers";
import { useParams, useNavigate} from "react-router-dom";
import type { EvaluacionEstudianteResponse } from "../../../../interfaces/interfaces";
import Button from "../../../../components/Button";


const EvaluacionesEstudiantes = () => {

  const navigate = useNavigate();
  const { idEvaluacion } = useParams();
  const { titulo } = useParams();
  const [EvaluacionesPendientes, setEvaluacionesPendientes] = useState<EvaluacionEstudianteResponse[]>();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const request = async () => {
    const dataEvaluaciones = await listarEvaluacionesEstudiante(Number(idEvaluacion), token ?? "");
    setEvaluacionesPendientes(dataEvaluaciones);
    }
    request();
  }, [])

  const evaluarEstudiante = (idEvaluacionEstudiante: number) => {
    navigate(`/mentor/evaluaciones/${idEvaluacion}/${idEvaluacionEstudiante}/evaluar`);
  }

  const getEstadoEvaluacion = (notaFinal: number) => {
    return notaFinal === 0 ? "Pendiente" : "Evaluado";
  }

  const getTextoBoton = (notaFinal: number) => {
    return notaFinal === 0 ? "Evaluar" : "Editar Evaluación";
  }

  const getEstadoClase = (notaFinal: number) => {
    return notaFinal === 0 
      ? "text-yellow-600 font-semibold" 
      : "text-green-600 font-semibold";
  }

  return (
    <>
      <h3 className="my-10 text-center font-mono text-3xl">{titulo}</h3>
      <Button className="mb-5" onClick={() => navigate(-1)}>
        Regresar
      </Button>
      <table className="bg-gray-600 w-[97%] mx-auto">
        <thead>
          <tr className="text-white">
            <th className="p-3 text-left">Estudiante</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Nota</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {EvaluacionesPendientes?.map((ep) => (
            <tr key={ep.idEvaluacionEstudiante} className="border-b border-gray-500">
              <td className="p-3 text-white">{ep.nombreEstudiante}</td>
              <td className={`p-3 ${getEstadoClase(ep.notaFinal)}`}>
                {getEstadoEvaluacion(ep.notaFinal)}
              </td>
              <td className="p-3 text-white">
                {ep.notaFinal === 0 ? "-" : ep.notaFinal}
              </td>
              <td className="p-3">
                <Button onClick={() => evaluarEstudiante(ep.idEvaluacionEstudiante)}>
                  {getTextoBoton(ep.notaFinal)}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default EvaluacionesEstudiantes