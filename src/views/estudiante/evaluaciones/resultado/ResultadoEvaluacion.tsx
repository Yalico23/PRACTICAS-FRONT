import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Tipos
interface OpcionRespuesta {
  id: number;
  opcionRespuesta: string;
  correcta: boolean;
}

interface Pregunta {
  id: number;
  pregunta: string;
  tipoPregunta: 'texto' | 'opcion';
  valor: number;
  opcionRespuestas: OpcionRespuesta[];
}

interface RespuestaEstudiante {
  id: number;
  respuesta: string | null;
  nota: number | null;
  opcionRespuesta: OpcionRespuesta | null;
  pregunta: {
    id: number;
  };
}

interface EvaluacionEstudiante {
  id: number;
  notaFinal: number;
  feedback: string | null;
  respuestaEstudiantes: RespuestaEstudiante[];
}

interface Evaluacion {
  id: number;
  titulo: string;
  descripcion: string;
  preguntas: Pregunta[];
}

interface RespuestaEvaluada {
  preguntaCompleta: Pregunta;
  respuestaEstudiante: RespuestaEstudiante | null;
  esCorrecta: boolean;
  respondida: boolean;
}

const ResultadoEvaluacion = () => {
  const navigate = useNavigate();
  const { idEstudiante, idEvaluacion } = useParams();

  const idEstudianteNum = Number(idEstudiante);
  const idEvaluacionNum = Number(idEvaluacion);

  const [evaluacionEstudiante, setEvaluacionEstudiante] = useState<EvaluacionEstudiante | null>(null);
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [respuestasEvaluadas, setRespuestasEvaluadas] = useState<RespuestaEvaluada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token') ?? '';

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (evaluacion && evaluacionEstudiante) {
      procesarRespuestas();
    }
  }, [evaluacion, evaluacionEstudiante]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar evaluación
      const responseEval = await fetch(
        `${import.meta.env.VITE_HOST_BACKEND}/api/evaluaciones/listarEvaluacionById?idEvaluacion=${idEvaluacionNum}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const dataEval = await responseEval.json();
      setEvaluacion(dataEval);
      
      // Cargar evaluación estudiante completa
      const responseEst = await fetch(
        `${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/idEvaluacionEstudiante/${idEvaluacionNum}/${idEstudianteNum}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const dataEst = await responseEst.json();
      setEvaluacionEstudiante(dataEst);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const procesarRespuestas = () => {
    if (!evaluacion || !evaluacionEstudiante) return;

    const respuestas: RespuestaEvaluada[] = evaluacion.preguntas.map((pregunta) => {
      const respuestaEstudiante = evaluacionEstudiante.respuestaEstudiantes.find(
        resp => resp.pregunta.id === pregunta.id
      );

      let esCorrecta = false;
      const respondida = !!respuestaEstudiante;

      if (respuestaEstudiante && pregunta.tipoPregunta === 'opcion') {
        if (respuestaEstudiante.opcionRespuesta) {
          const opcionSeleccionada = pregunta.opcionRespuestas.find(
            op => op.id === respuestaEstudiante.opcionRespuesta!.id
          );
          esCorrecta = opcionSeleccionada?.correcta ?? false;
        }
      }

      return {
        preguntaCompleta: pregunta,
        respuestaEstudiante: respuestaEstudiante || null,
        esCorrecta,
        respondida
      };
    });

    setRespuestasEvaluadas(respuestas);
  };

  const obtenerEstadisticas = () => {
    const total = evaluacion?.preguntas.length || 0;
    const respondidas = respuestasEvaluadas.filter(r => r.respondida).length;
    const correctas = respuestasEvaluadas.filter(r => r.esCorrecta && r.preguntaCompleta.tipoPregunta === 'opcion').length;
    const puntosObtenidos = respuestasEvaluadas.reduce((sum, r) => 
      sum + (r.respuestaEstudiante?.nota || 0), 0
    );
    const puntosTotal = evaluacion?.preguntas.reduce((sum, p) => sum + p.valor, 0) || 0;

    return { total, respondidas, correctas, puntosObtenidos, puntosTotal };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando resultados...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!evaluacion || !evaluacionEstudiante) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No se encontraron datos</div>
      </div>
    );
  }

  const stats = obtenerEstadisticas();

  return (
    <div className="min-h-screen  py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {evaluacion.titulo}
              </h1>
              <p className="text-gray-400">{evaluacion.descripcion}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Regresar
            </button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Preguntas</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Respondidas</p>
              <p className="text-2xl font-bold text-green-400">{stats.respondidas}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Opción Correctas</p>
              <p className="text-2xl font-bold text-blue-400">{stats.correctas}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Puntos</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.puntosObtenidos}/{stats.puntosTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback del Mentor */}
        {evaluacionEstudiante.feedback && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              💬 Comentarios del Mentor
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap">
              {evaluacionEstudiante.feedback}
            </p>
          </div>
        )}

        {/* Preguntas y Respuestas */}
        <div className="space-y-6">
          {respuestasEvaluadas.map((respuesta, index) => (
            <div key={respuesta.preguntaCompleta.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              {/* Encabezado de pregunta */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Pregunta {index + 1}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {respuesta.preguntaCompleta.valor} puntos
                    </span>
                    {!respuesta.respondida && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                        No respondida
                      </span>
                    )}
                  </div>
                  <p className="text-white text-lg">{respuesta.preguntaCompleta.pregunta}</p>
                </div>
                
                {/* Nota obtenida */}
                {respuesta.respondida && (
                  <div className="bg-gray-700 rounded-lg px-4 py-2 text-center ml-4">
                    <p className="text-gray-400 text-xs">Tu nota</p>
                    <p className="text-2xl font-bold text-white">
                      {respuesta.respuestaEstudiante?.nota || 0}
                      <span className="text-sm text-gray-400">/{respuesta.preguntaCompleta.valor}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Contenido según tipo de pregunta */}
              {!respuesta.respondida ? (
                <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
                  <p className="text-orange-400">
                    No respondiste esta pregunta
                  </p>
                </div>
              ) : respuesta.preguntaCompleta.tipoPregunta === 'opcion' ? (
                // Pregunta de opción múltiple
                <div className="space-y-3">
                  {respuesta.preguntaCompleta.opcionRespuestas.map((opcion) => {
                    const esSeleccionada = respuesta.respuestaEstudiante?.opcionRespuesta?.id === opcion.id;
                    const esCorrecta = opcion.correcta;
                    
                    let bgColor = 'bg-gray-700';
                    let borderColor = 'border-gray-600';
                    let textColor = 'text-gray-300';
                    
                    if (esSeleccionada && esCorrecta) {
                      bgColor = 'bg-green-900/30';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-400';
                    } else if (esSeleccionada && !esCorrecta) {
                      bgColor = 'bg-red-900/30';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-400';
                    } else if (esCorrecta) {
                      bgColor = 'bg-green-900/20';
                      borderColor = 'border-green-500/50';
                      textColor = 'text-green-300';
                    }
                    
                    return (
                      <div
                        key={opcion.id}
                        className={`${bgColor} border-2 ${borderColor} rounded-lg p-4`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={textColor}>{opcion.opcionRespuesta}</span>
                          <div className="flex items-center gap-2">
                            {esSeleccionada && (
                              <span className="text-blue-400 text-sm font-medium">
                                Tu respuesta
                              </span>
                            )}
                            {esCorrecta && (
                              <span className="text-green-400 text-sm font-medium">
                                ✓ Correcta
                              </span>
                            )}
                            {esSeleccionada && !esCorrecta && (
                              <span className="text-red-400 text-sm font-medium">
                                ✗ Incorrecta
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Pregunta de texto
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-gray-400 text-sm mb-2">Tu respuesta:</h4>
                    <p className="text-white whitespace-pre-wrap">
                      {respuesta.respuestaEstudiante?.respuesta || 'Sin respuesta'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resumen Final */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Resumen de tu Evaluación</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 mb-2">Puntos obtenidos</p>
              <p className="text-2xl font-bold text-white">
                {stats.puntosObtenidos} / {stats.puntosTotal}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-gray-400 mb-2">Porcentaje de logro</p>
              <p className="text-2xl font-bold text-white">
                {stats.puntosTotal > 0 
                  ? ((stats.puntosObtenidos / stats.puntosTotal) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadoEvaluacion;