import { useParams , useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { cargarEvaluacion, cargarEvaluacionEstudiante } from "./Helpers";
import type { Evaluacion, EvaluacionEstudiante, RespuestaEvaluada, OpcionRespuesta, Pregunta } from "./types";
import Button from "../../../../../components/Button";


const EvaluarEstudiante: React.FC = () => {
  const navigate = useNavigate();
  const { idEvaluacion, idEvaluacionEstudiante } = useParams();

  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null);
  const [evaluacionEstudiante, setEvaluacionEstudiante] = useState<EvaluacionEstudiante | null>(null);
  
  const [respuestasEvaluadas, setRespuestasEvaluadas] = useState<RespuestaEvaluada[]>([]);
  const [notaFinal, setNotaFinal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const request = async (): Promise<void> => {
      try {
        setLoading(true);

        if (!idEvaluacion || !idEvaluacionEstudiante) {
          throw new Error('IDs de evaluación no válidos');
        }

        const dataEvaluacion = await cargarEvaluacion(token, Number(idEvaluacion));
        const dataEvaluacionEstudiante = await cargarEvaluacionEstudiante(token, Number(idEvaluacionEstudiante));

        setEvaluacion(dataEvaluacion);
        setEvaluacionEstudiante(dataEvaluacionEstudiante);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    request();
  }, [idEvaluacion, idEvaluacionEstudiante, token]);

  // Cuando se carguen los datos, procesar las respuestas
  useEffect(() => {
    if (evaluacion && evaluacionEstudiante) {
      procesarRespuestas();
    }
  }, [evaluacion, evaluacionEstudiante]);

  const procesarRespuestas = (): void => {
    if (!evaluacion || !evaluacionEstudiante) return;

    // Crear una respuesta para CADA pregunta de la evaluación
    const respuestas: RespuestaEvaluada[] = evaluacion.preguntas.map((pregunta: Pregunta) => {
      // Buscar si el estudiante respondió esta pregunta
      const respuestaEstudiante = evaluacionEstudiante.respuestaEstudiantes.find(
        resp => resp.pregunta.id === pregunta.id
      );

      let esCorrecta = false;
      let notaCalculada = 0;
      const respondida = !!respuestaEstudiante;

      if (respuestaEstudiante) {
        if (pregunta.tipoPregunta === 'opcion') {
          // Para preguntas de opción, verificar automáticamente
          if (respuestaEstudiante.opcionRespuesta) {
            const opcionSeleccionada = pregunta.opcionRespuestas.find(
              op => op.id === respuestaEstudiante.opcionRespuesta!.id
            );
            esCorrecta = opcionSeleccionada?.correcta ?? false;
            notaCalculada = esCorrecta ? pregunta.valor : 0;
          }
        } else {
          // Para preguntas de texto, mantener la nota actual (0 por defecto)
          notaCalculada = respuestaEstudiante.nota ?? 0;
        }
      }

      return {
        // Si existe respuesta del estudiante, usar sus datos, sino crear estructura básica
        id: respuestaEstudiante?.id ?? `no-respondida-${pregunta.id}`,
        esCorrecta,
        nota: notaCalculada,
        respuesta: respuestaEstudiante?.respuesta ?? null,
        pregunta: { id: pregunta.id },
        opcionRespuesta: respuestaEstudiante?.opcionRespuesta ?? null,
        preguntaCompleta: pregunta,
        respondida
      };
    });

    setRespuestasEvaluadas(respuestas);
    calcularNotaFinal(respuestas);
  };

  const calcularNotaFinal = (respuestas: RespuestaEvaluada[]): void => {
    if (!evaluacion) return;

    const totalPuntos = evaluacion.preguntas.reduce((sum, pregunta) => sum + pregunta.valor, 0);
    const puntosObtenidos = respuestas.reduce((sum, respuesta) => sum + respuesta.nota, 0);
    const notaFinalCalculada = totalPuntos > 0 ? (puntosObtenidos / totalPuntos) * 20 : 0; // Asumiendo escala de 0-20
    setNotaFinal(Math.round(notaFinalCalculada * 100) / 100);
  };

  const actualizarNotaTexto = (respuestaId: number | string, nuevaNota: string): void => {
    // Solo actualizar si la respuesta fue respondida (no tiene ID generado)
    if (respuestaId.toString().startsWith('no-respondida-')) {
      return; // No permitir editar preguntas no respondidas
    }

    const respuestasActualizadas = respuestasEvaluadas.map(respuesta => {
      if (respuesta.id === respuestaId) {
        return { ...respuesta, nota: Number(nuevaNota) };
      }
      return respuesta;
    });

    setRespuestasEvaluadas(respuestasActualizadas);
    calcularNotaFinal(respuestasActualizadas);
  };

  const obtenerTextoOpcionSeleccionada = (respuesta: RespuestaEvaluada): string => {
    if (respuesta.opcionRespuesta) {
      const opcion = respuesta.preguntaCompleta.opcionRespuestas.find(
        op => op.id === respuesta.opcionRespuesta!.id
      );
      return opcion?.opcionRespuesta ?? 'Opción no encontrada';
    }
    return 'No respondida';
  };

  const handleGuardarEvaluacion = (): void => {
    console.log('Evaluación final a enviar:', {
      idEvaluacionEstudiante: idEvaluacionEstudiante ? Number(idEvaluacionEstudiante) : null,
      respuestasEvaluadas,
      notaFinal
    });
    // Aquí implementarás el envío cuando me digas cómo
  };

  if (loading) {
    return <div className="p-6">Cargando evaluación...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!evaluacion || !evaluacionEstudiante || respuestasEvaluadas.length === 0) {
    return <div className="p-6">No se pudieron cargar los datos de la evaluación.</div>;
  }

  return (
    <div className=" mx-auto p-6 bg-[#2D2D2D] mt-5">
      <div className="mb-6">
        <div className="flex justify-between my-5">
          <h1 className="text-2xl font-bold text-[#F8F9FA] mb-2">
            Evaluar Estudiante - {evaluacion.titulo}
          </h1>
          <Button onClick={() => navigate(-1)}>
            Regresar
          </Button>
        </div>
        <p className="text-[#F8F9FA]">{evaluacion.descripcion}</p>
        <div className="mt-4 p-4 bg-[#aefff49e] rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800">
            Nota Final: {notaFinal}/20
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {respuestasEvaluadas.map((respuesta, index) => (
          <div key={respuesta.id} className="border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[#4A90E2]">
                  Pregunta {index + 1} ({respuesta.preguntaCompleta.valor} puntos)
                </h3>
                {!respuesta.respondida && (
                  <span className="bg-orange-100 text-orange-800 text-sm px-3 py-1 rounded-full font-medium">
                    No respondida
                  </span>
                )}
              </div>
              <p className="text-[#F8F9FA] mb-4">{respuesta.preguntaCompleta.pregunta}</p>
            </div>

            {!respuesta.respondida ? (
              // Pregunta no respondida
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-800 font-medium mb-2">
                  El estudiante no respondió esta pregunta
                </p>
                <p className="text-orange-700 text-sm">
                  Nota automática: 0/{respuesta.preguntaCompleta.valor}
                </p>
                {respuesta.preguntaCompleta.tipoPregunta === 'opcion' && (
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">Opciones disponibles:</h4>
                    <div className="space-y-2">
                      {respuesta.preguntaCompleta.opcionRespuestas.map((opcion: OpcionRespuesta) => (
                        <div
                          key={opcion.id}
                          className={`p-3 rounded border-2 ${opcion.correcta
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-gray-800">{opcion.opcionRespuesta}</span>
                            {opcion.correcta && (
                              <span className="text-green-600 text-sm font-medium">✓ Correcta</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : respuesta.preguntaCompleta.tipoPregunta === 'opcion' ? (
              // Pregunta de opción múltiple respondida
              <div className="space-y-3">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Opciones disponibles:</h4>
                  <div className="space-y-2">
                    {respuesta.preguntaCompleta.opcionRespuestas.map((opcion: OpcionRespuesta) => (
                      <div
                        key={opcion.id}
                        className={`p-3 rounded border-2 ${opcion.correcta
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                          } ${respuesta.opcionRespuesta?.id === opcion.id
                            ? 'ring-2 ring-blue-500'
                            : ''
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800">{opcion.opcionRespuesta}</span>
                          <div className="flex items-center space-x-2">
                            {opcion.correcta && (
                              <span className="text-green-600 text-sm font-medium">✓ Correcta</span>
                            )}
                            {respuesta.opcionRespuesta?.id === opcion.id && (
                              <span className="text-blue-600 text-sm font-medium">← Seleccionada</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${respuesta.esCorrecta ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                  <p className="font-medium">
                    Respuesta del estudiante: {obtenerTextoOpcionSeleccionada(respuesta)}
                  </p>
                  <p className={`text-sm mt-1 ${respuesta.esCorrecta ? 'text-green-700' : 'text-red-700'
                    }`}>
                    {respuesta.esCorrecta ? '✓ Correcta' : '✗ Incorrecta'} -
                    Nota: {respuesta.nota}/{respuesta.preguntaCompleta.valor}
                  </p>
                </div>
              </div>
            ) : (
              // Pregunta de texto respondida
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Respuesta del estudiante:</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {respuesta.respuesta ?? 'No respondida'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="font-medium text-[#F8F9FA]">
                    Calificar (0-{respuesta.preguntaCompleta.valor}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={respuesta.preguntaCompleta.valor}
                    step="1"
                    value={respuesta.nota}
                    onChange={(e) => actualizarNotaTexto(respuesta.id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-[#F8F9FA]">/ {respuesta.preguntaCompleta.valor}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800">FeedBack:</h3>
        <textarea
          className="w-full h-24 p-3 border border-gray-300 rounded focus:ring-2 outline-none resize-none"
          placeholder="Escribe aquí tus comentarios sobre la evaluación..."
        //value={evaluacionEstudiante?.feedback || ''}
        //onChange={(e) => setEvaluacionEstudiante({ ...evaluacionEstudiante!, feedback: e.target.value })}
        ></textarea>
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Resumen de Evaluación</h3>
            <p className="text-gray-600">
              Puntos obtenidos: {respuestasEvaluadas.reduce((sum, r) => sum + r.nota, 0)} / {evaluacion.preguntas.reduce((sum, p) => sum + p.valor, 0)}
            </p>
            <p className="text-gray-600">
              Preguntas respondidas: {respuestasEvaluadas.filter(r => r.respondida).length} / {evaluacion.preguntas.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              Nota Final: {notaFinal}/20
            </p>
          </div>
        </div>

        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={handleGuardarEvaluacion}
        >
          Guardar Evaluación
        </button>
      </div>

    </div>
  );
};

export default EvaluarEstudiante;