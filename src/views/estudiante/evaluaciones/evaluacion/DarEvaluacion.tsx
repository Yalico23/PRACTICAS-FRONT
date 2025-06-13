import { useEffect, useState } from "react";
import type { evaluacionByIdEstudiante, UsuarioInfo } from "../../../../interfaces/interfaces";
import { useParams } from "react-router-dom";
import { getEvalucionById, getUsuarioByemail } from "./Helpers";
import { decodeJWT } from "../../../mentor/evaluaciones/crearEvaluacion/decodeJWT";

const DarEvaluacion = () => {

  const [Usuario, setUsuario] = useState<UsuarioInfo>();
  const [Evaluacion, setEvaluacion] = useState<evaluacionByIdEstudiante>();
  const { evaluacionId } = useParams<{ evaluacionId: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!evaluacionId) return;

      const token = localStorage.getItem("token");
      const decode = decodeJWT(token ?? "");

      try {
        const data = await getEvalucionById(Number(evaluacionId), token ?? "");
        const usuario = await getUsuarioByemail(token ?? "", decode.email);
        if (data && usuario) {
          setUsuario(usuario);
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


  return (
    <>
      <h1>{Evaluacion?.titulo}</h1>

      <div>
        {Evaluacion?.preguntas.map((pregunta) => (
          <div key={pregunta.id} >
            <p>{pregunta.tiempo}</p> {/** Calcular hora en cuenta regresiva */}
            <p>{pregunta.pregunta}</p>

            {pregunta.tipoPregunta === "opcion" ? (
              <div className="flex flex-col gap-3">
                {pregunta.opcionRespuestas?.map((op) => (
                  <div key={op.id} className="p-2 bg-orange-500 cursor-pointer hover:bg-orange-600 transition">
                    {op.opcionRespuesta}
                  </div>
                ))}
              </div>
            ) : (
              <input type="text" name="" id=""  className="w-full"/>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default DarEvaluacion;
