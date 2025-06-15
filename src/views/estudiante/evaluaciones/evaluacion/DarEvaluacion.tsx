import { useEffect, useState } from "react";
import type { evaluacionByIdEstudiante, RespuestaEstudiante, UsuarioInfo } from "../../../../interfaces/interfaces";
import { useParams , useNavigate } from "react-router-dom";
import { getEvalucionById, getUsuarioByemail, verificarSiRespondioEvaluacion } from "./Helpers";
import { decodeJWT } from "../../../mentor/evaluaciones/crearEvaluacion/decodeJWT";
import GraciasEvaluacion from "./GraciasEvaluacion";



const DarEvaluacion = () => {
  const [Usuario, setUsuario] = useState<UsuarioInfo>();
  const [Evaluacion, setEvaluacion] = useState<evaluacionByIdEstudiante>();
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaEstudiante[]>([]);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [evaluacionTerminada, setEvaluacionTerminada] = useState(false);

  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  // Función para formatear tiempo (minutos a MM:SS)
  const formatearTiempo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;

    if (horas > 0) {
      return `${horas}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}:00`;
  };

  // Función para convertir tiempo a segundos
  const convertirASegundos = (minutos: number): number => {
    return minutos * 60;
  };

  // Función para formatear tiempo restante en cuenta regresiva
  const formatearTiempoRestante = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!evaluacionId) return;

      const token = localStorage.getItem("token");
      const decode = decodeJWT(token ?? "");

      try {
        const data = await getEvalucionById(Number(evaluacionId), token ?? "");
        const usuario = await getUsuarioByemail(token ?? "", decode.email);
        const yaRespondio = await verificarSiRespondioEvaluacion(Number(evaluacionId), usuario.id, token ?? "");

        if (yaRespondio) {
          navigate("/estudiante/evaluaciones");
          return;
        }

        if (data && usuario) {
          setUsuario(usuario);
          setEvaluacion(data);
          // Inicializar el tiempo de la primera pregunta
          if (data.preguntas.length > 0) {
            setTiempoRestante(convertirASegundos(data.preguntas[0].tiempo));
          }
        } else {
          console.warn("No se encontró evaluación.");
        }
      } catch (error) {
        console.error("Error al obtener la evaluación:", error);
      }
    };

    fetchData();
  }, [evaluacionId]);

  // Timer para cuenta regresiva
  useEffect(() => {
    if (tiempoRestante > 0 && !evaluacionTerminada) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0 && !evaluacionTerminada) {
      // Tiempo agotado, pasar a siguiente pregunta
      siguientePregunta();
    }
  }, [tiempoRestante, evaluacionTerminada]);

  const siguientePregunta = () => {
    if (!Evaluacion) return;

    const preguntaActualData = Evaluacion.preguntas[preguntaActual];

    // Guardar respuesta actual
    const nuevaRespuesta: RespuestaEstudiante = {
      pregunta: { id: preguntaActualData.id ?? 0 }
    };

    if (preguntaActualData.tipoPregunta === "texto") {
      if (respuestaTexto.trim()) {
        nuevaRespuesta.respuesta = respuestaTexto;
      }
      // Si está vacío, se omite la respuesta (no se agrega nada más)
    } else {
      if (opcionSeleccionada !== null) {
        nuevaRespuesta.opcionRespuesta = { id: opcionSeleccionada };
      }
      // Si no hay opción seleccionada, se omite la respuesta
    }

    // Crear nueva lista de respuestas
    let nuevasRespuestas = [...respuestas];

    // Solo agregar respuesta si hay contenido
    if (nuevaRespuesta.respuesta || nuevaRespuesta.opcionRespuesta) {
      nuevasRespuestas = [...respuestas, nuevaRespuesta];
    }

    // Limpiar campos
    setRespuestaTexto("");
    setOpcionSeleccionada(null);

    // Verificar si hay más preguntas
    if (preguntaActual + 1 < Evaluacion.preguntas.length) {
      const siguienteIndice = preguntaActual + 1;
      setRespuestas(nuevasRespuestas); // Actualizar estado
      setPreguntaActual(siguienteIndice);
      setTiempoRestante(convertirASegundos(Evaluacion.preguntas[siguienteIndice].tiempo));
    } else {
      // Finalizar evaluación con todas las respuestas incluyendo la última
      setEvaluacionTerminada(true);
      finalizarEvaluacion(nuevasRespuestas);
    }
  };

  const finalizarEvaluacion = (respuestasFinales: RespuestaEstudiante[]) => {
    // Función vacía para trabajar desde aquí más cosas
    console.log("Evaluación finalizada");
    console.log("Respuestas:", respuestasFinales);
    mandarEvaluacion(respuestasFinales)
    // Aquí iría la lógica para enviar al endpoint
    // mandarEvaluacion(respuestasFinales);
  };

  const mandarEvaluacion = async (respuestasFinales: RespuestaEstudiante[]) => {
    // Función para enviar evaluación al backend
    if (!Usuario || !Evaluacion) return;

    const evaluacionData = {
      estudiante: {
        id: Usuario.id
      },
      evaluacion: {
        id: Evaluacion.id
      },
      respuestaEstudiantes: respuestasFinales
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/evaluacionEstudiante/mandarEvaluacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(evaluacionData)
      });

      if (response.ok) {
        console.log("Evaluación enviada exitosamente");
        // Redirigir o mostrar mensaje de éxito
      } else {
        console.error("Error al enviar evaluación");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!Evaluacion || !Usuario) {
    return <div>Cargando...</div>;
  }

  if (evaluacionTerminada) {
    console.log("Preguntas" + Evaluacion.preguntas);
    console.log("Respuestas" + respuestas);
    return (
      <>
        <GraciasEvaluacion
          nombreEstudiante={Usuario.nombre + " " + Usuario.apellidos}
          tituloEvaluacion={Evaluacion.titulo}
          totalPreguntas={Evaluacion.preguntas.length}
          preguntasRespondidas={respuestas.length + 1} // +1 para incluir la última pregunta respondida
        />
      </>
    );
  }

  const preguntaActualData = Evaluacion.preguntas[preguntaActual];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{Evaluacion.titulo}</h1>
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Pregunta {preguntaActual + 1} de {Evaluacion.preguntas.length}
          </p>
          <div className="text-lg font-semibold">
            <span className="text-blue-600">Tiempo límite: {formatearTiempo(preguntaActualData.tiempo)}</span>
            <span className="ml-4 text-red-600">
              Restante: {formatearTiempoRestante(tiempoRestante)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{preguntaActualData.pregunta}</h2>
          <p className="text-sm text-gray-500 mb-4">Valor: {preguntaActualData.valor} puntos</p>
        </div>

        {preguntaActualData.tipoPregunta === "opcion" ? (
          <div className="space-y-3 mb-6">
            {preguntaActualData.opcionRespuestas?.map((opcion) => (
              <div
                key={opcion.id}
                onClick={() => opcion.id !== undefined && setOpcionSeleccionada(opcion.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${opcionSeleccionada === opcion.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="opcion"
                    checked={opcionSeleccionada === opcion.id}
                    onChange={() => opcion.id !== undefined && setOpcionSeleccionada(opcion.id)}
                    className="mr-3"
                  />
                  <span>{opcion.opcionRespuesta}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6">
            <textarea
              value={respuestaTexto}
              onChange={(e) => setRespuestaTexto(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            {preguntaActual > 0 && (
              <span>Pregunta anterior completada</span>
            )}
          </div>
          <button
            onClick={siguientePregunta}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {preguntaActual + 1 === Evaluacion.preguntas.length ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mt-6">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((preguntaActual + 1) / Evaluacion.preguntas.length) * 100}%`
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DarEvaluacion;