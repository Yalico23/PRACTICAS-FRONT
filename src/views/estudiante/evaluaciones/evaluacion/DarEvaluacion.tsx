import { useEffect, useState } from "react";
import type { JwTPayload,  evaluacionByIdEstudiante, RespuestaEstudiante, UsuarioInfo } from "../../../../interfaces/interfaces";
import { useParams , useNavigate } from "react-router-dom";
import { getEvalucionById, getUsuarioByemail, verificarSiRespondioEvaluacion } from "./Helpers";
import { jwtDecode } from "jwt-decode";
import GraciasEvaluacion from "./GraciasEvaluacion";
import Swal from 'sweetalert2';

const DarEvaluacion = () => {
  const [Usuario, setUsuario] = useState<UsuarioInfo>();
  const [Evaluacion, setEvaluacion] = useState<evaluacionByIdEstudiante>();
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaEstudiante[]>([]);
  const [respuestaTexto, setRespuestaTexto] = useState("");
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [evaluacionTerminada, setEvaluacionTerminada] = useState(false);
  
  // Estados para el sistema anti-plagio
  const [advertencias, setAdvertencias] = useState(0);
  const [ultimaAdvertencia, setUltimaAdvertencia] = useState<Date | null>(null);
  const [evaluacionIniciada, setEvaluacionIniciada] = useState(false);

  const { evaluacionId } = useParams<{ evaluacionId: string }>();
  const navigate = useNavigate();

  // Constantes para el sistema anti-plagio
  const MAX_ADVERTENCIAS = 3;
  const TIEMPO_MIN_ENTRE_ADVERTENCIAS = 2000; // 2 segundos

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

  // Función para manejar cambio de pestaña/aplicación
  const manejarCambioDeFoco = () => {
    // Solo detectar si la evaluación ya comenzó y no ha terminado
    if (!evaluacionIniciada || evaluacionTerminada) return;

    const ahora = new Date();
    
    // Evitar múltiples advertencias muy rápidas
    if (ultimaAdvertencia && (ahora.getTime() - ultimaAdvertencia.getTime()) < TIEMPO_MIN_ENTRE_ADVERTENCIAS) {
      return;
    }

    const nuevasAdvertencias = advertencias + 1;
    setAdvertencias(nuevasAdvertencias);
    setUltimaAdvertencia(ahora);

    if (nuevasAdvertencias >= MAX_ADVERTENCIAS) {
      // Máximo de advertencias alcanzado - finalizar evaluación
      Swal.fire({
        title: '¡Evaluación Finalizada!',
        text: 'Has excedido el límite de advertencias por cambiar de pestaña/aplicación. Tu evaluación ha sido enviada automáticamente.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#dc2626'
      }).then(() => {
        finalizarEvaluacionPorPlagio();
      });
    } else {
      // Mostrar advertencia y pasar a siguiente pregunta
      const advertenciasRestantes = MAX_ADVERTENCIAS - nuevasAdvertencias;
      
      Swal.fire({
        title: '⚠️ Advertencia de Seguridad',
        html: `
          <p><strong>Se detectó que cambiaste de pestaña o aplicación.</strong></p>
          <p>Se avanzará automáticamente a la siguiente pregunta.</p>
          <p class="text-red-600 font-semibold">Advertencias restantes: ${advertenciasRestantes}</p>
          <p class="text-sm text-gray-600 mt-2">Si recibes ${advertenciasRestantes} advertencia(s) más, tu evaluación será enviada automáticamente.</p>
        `,
        icon: 'warning',
        confirmButtonText: 'Continuar Evaluación',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#f59e0b',
        timer: 5000,
        timerProgressBar: true
      }).then(() => {
        siguientePregunta();
      });
    }
  };

  // Función para finalizar evaluación por plagio
  const finalizarEvaluacionPorPlagio = () => {
    setEvaluacionTerminada(true);
    
    // Guardar respuesta actual si existe
    let respuestasFinales = [...respuestas];
    
    if (Evaluacion) {
      const preguntaActualData = Evaluacion.preguntas[preguntaActual];
      const nuevaRespuesta: RespuestaEstudiante = {
        pregunta: { id: preguntaActualData.id ?? 0 }
      };

      if (preguntaActualData.tipoPregunta === "texto" && respuestaTexto.trim()) {
        nuevaRespuesta.respuesta = respuestaTexto;
        respuestasFinales.push(nuevaRespuesta);
      } else if (preguntaActualData.tipoPregunta === "opcion" && opcionSeleccionada !== null) {
        nuevaRespuesta.opcionRespuesta = { id: opcionSeleccionada };
        respuestasFinales.push(nuevaRespuesta);
      }
    }

    finalizarEvaluacion(respuestasFinales);
  };

  // Effect para configurar detectores de cambio de foco
  useEffect(() => {
    if (!evaluacionIniciada || evaluacionTerminada) return;

    const detectarCambioDeTab = () => {
      if (document.hidden) {
        manejarCambioDeFoco();
      }
    };

    const detectarCambioDeFoco = () => {
      manejarCambioDeFoco();
    };

    // Detectar cambio de pestaña
    document.addEventListener('visibilitychange', detectarCambioDeTab);
    
    // Detectar pérdida de foco de la ventana
    window.addEventListener('blur', detectarCambioDeFoco);
    
    // Detectar cambio de aplicación (Alt+Tab, Cmd+Tab)
    document.addEventListener('keydown', (e) => {
      if ((e.altKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        manejarCambioDeFoco();
      }
    });

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', detectarCambioDeTab);
      window.removeEventListener('blur', detectarCambioDeFoco);
    };
  }, [evaluacionIniciada, evaluacionTerminada, advertencias, ultimaAdvertencia]);

  // Effect para mostrar advertencia inicial
  useEffect(() => {
    if (Evaluacion && Usuario && !evaluacionIniciada) {
      Swal.fire({
        title: '⚠️ Importante: Sistema Anti-Plagio Activado',
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Durante esta evaluación:</strong></p>
            <ul class="list-disc list-inside mb-4 text-sm">
              <li>No cambies de pestaña o aplicación</li>
              <li>No uses Alt+Tab o Cmd+Tab</li>
              <li>Mantén esta ventana siempre activa</li>
            </ul>
            <p class="text-red-600 font-semibold">⚠️ Tienes máximo ${MAX_ADVERTENCIAS} advertencias</p>
            <p class="text-sm text-gray-600">Si excedes este límite, tu evaluación será enviada automáticamente.</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido, Comenzar Evaluación',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#2563eb'
      }).then(() => {
        setEvaluacionIniciada(true);
      });
    }
  }, [Evaluacion, Usuario]);

  useEffect(() => {
    const fetchData = async () => {
      if (!evaluacionId) return;

      const token = localStorage.getItem("token");
      const decode = jwtDecode<JwTPayload>(token ?? "") as JwTPayload;

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
    if (tiempoRestante > 0 && !evaluacionTerminada && evaluacionIniciada) {
      const timer = setTimeout(() => {
        setTiempoRestante(tiempoRestante - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0 && !evaluacionTerminada && evaluacionIniciada) {
      // Tiempo agotado, pasar a siguiente pregunta
      siguientePregunta();
    }
  }, [tiempoRestante, evaluacionTerminada, evaluacionIniciada]);

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
      respuestaEstudiantes: respuestasFinales,
      advertenciasPlagio: advertencias, // Agregar número de advertencias
      finalizadaPorPlagio: advertencias >= MAX_ADVERTENCIAS // Indicar si fue finalizada por plagio
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/mandarEvaluacion`, {
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

  // No mostrar la evaluación hasta que el usuario acepte las reglas
  if (!evaluacionIniciada) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Preparando evaluación...</p>
      </div>
    </div>;
  }

  const preguntaActualData = Evaluacion.preguntas[preguntaActual];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Indicador de advertencias */}
      {advertencias > 0 && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          advertencias >= MAX_ADVERTENCIAS - 1 
            ? 'bg-red-50 border-red-500 text-red-700' 
            : 'bg-yellow-50 border-yellow-500 text-yellow-700'
        }`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">
              ⚠️ Advertencias de seguridad: {advertencias}/{MAX_ADVERTENCIAS}
            </span>
            {advertencias < MAX_ADVERTENCIAS && (
              <span className="text-sm">
                {MAX_ADVERTENCIAS - advertencias} restante(s)
              </span>
            )}
          </div>
        </div>
      )}

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