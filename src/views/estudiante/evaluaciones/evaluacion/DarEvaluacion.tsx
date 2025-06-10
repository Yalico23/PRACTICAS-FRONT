import { useEffect, useState } from "react"
import type { evaluacionByIdEstudiante } from "../../../../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getEvalucionById } from "./RequestGetEvaluacion";

const DarEvaluacion = () => {

  const [Evaluacion, setEvaluacion] = useState<evaluacionByIdEstudiante>();
  const { evaluacionId } = useParams<{ evaluacionId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!evaluacionId) return;

      const token = localStorage.getItem('token');
      try {
        const data = await getEvalucionById(Number(evaluacionId), token ?? "");
        if (data) {
          setEvaluacion(data);
        } else {
          console.warn("No se encontró evaluación.");
        }
      } catch (error) {
        console.error("Error al obtener la evaluación:", error);
      }
    };

    fetchData();
  }, [evaluacionId]);

  console.log("Evaluacion:", Evaluacion);

  return (
    <>
      <h1>{Evaluacion?.titulo}</h1>

      <div>
        {Evaluacion?.preguntas.map((pregunta) =>(
          <div key={pregunta.id}>
            <p>{pregunta.pregunta}</p>
          </div>
        ))}
      </div>
    </>
  )
}

export default DarEvaluacion