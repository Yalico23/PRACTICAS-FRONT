import { useEffect, useState } from "react";
import { listarEvaluacionesEstudiante } from "./Helpers";
import { useParams, useNavigate } from "react-router-dom";
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
      ? "text-[#FFC107] font-semibold"
      : "text-[#28A745] font-semibold";
  }

  return (
    <>
      <h3 className="my-10 text-center font-mono text-3xl text-[#F8F9FA]">{titulo}</h3>
      <Button className="mb-5 rounded-sm" onClick={() => navigate(-1)}>
        Regresar
      </Button>
      <table className="w-full text-sm text-left rtl:text-right text-[#1D1D1D]">
        <thead className="text-xs text-[#1D1D1D] uppercase bg-[#E9ECEF]">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">Estudiante</th>
            <th scope="col" className="px-6 py-3 text-center">Estado</th>
            <th scope="col" className="px-6 py-3 text-center">Nota</th>
            <th scope="col" className="px-6 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-[#F8F9FA] border-b dark:border-gray-700 border-gray-200">
          {EvaluacionesPendientes?.map((ep) => (
            <tr key={ep.idEvaluacionEstudiante}>
              <td className="px-6 py-4 text-center">{ep.nombreEstudiante}</td>
              <td className={`px-6 py-4 text-center ${getEstadoClase(ep.notaFinal)}`}>
                {getEstadoEvaluacion(ep.notaFinal)}
              </td>
              <td className="px-6 py-4 text-center text-[#1D1D1D]">
                {ep.notaFinal === 0 ? "-" : ep.notaFinal}
              </td>
              <td className="px-6 py-4 text-center">
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