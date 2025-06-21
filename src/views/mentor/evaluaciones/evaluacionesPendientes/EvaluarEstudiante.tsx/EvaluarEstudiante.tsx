import { useParams } from "react-router-dom"
import { useState, useEffect } from 'react';
import { cargarEvaluacion, cargarEvaluacionEstudiante } from "./Helpers";

const EvaluarEstudiante = () => {
  const { idEvaluacion } = useParams();
  const { idEvaluacionEstudiante } = useParams();

  const [Evaluacion, setEvaluacion] = useState();
  const [EvaluacionEstudiante, setEvaluacionEstudiante] = useState();
  const [respuestasEvaluadas, setRespuestasEvaluadas] = useState([]);
  const [notaFinal, setNotaFinal] = useState(0);

  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    const Request = async () => {
      const dataEvaluacion = await cargarEvaluacion(token, Number(idEvaluacion));
      const dataEvaluacionEstudiante = await cargarEvaluacionEstudiante(token, Number(idEvaluacionEstudiante));
      setEvaluacion(dataEvaluacion);
      setEvaluacionEstudiante(dataEvaluacionEstudiante);
    }
    Request();
  }, [])

  // Cuando se carguen los datos, procesar las respuestas
  useEffect(() => {
    if (Evaluacion && EvaluacionEstudiante) {
      procesarRespuestas();
    }
  }, [Evaluacion, EvaluacionEstudiante])

  const procesarRespuestas = () => {
    const respuestas = EvaluacionEstudiante.respuestaEstudiantes.map(respuestaEst => {
      const pregunta = Evaluacion.preguntas.find(p => p.id === respuestaEst.pregunta.id);
      
      let esCorrecta = false;
      let notaCalculada = 0;

      if (pregunta.tipoPregunta === 'opcion') {
        // Para preguntas de opción, verificar automáticamente
        if (respuestaEst.opcionRespuesta) {
          const opcionSeleccionada = pregunta.opcionRespuestas.find(
            op => op.id === respuestaEst.opcionRespuesta.id
          );
          esCorrecta = opcionSeleccionada?.correcta || false;
          notaCalculada = esCorrecta ? pregunta.valor : 0;
        }
      }
      // Para preguntas de texto, mantener la nota actual (0 por defecto)
      else {
        notaCalculada = respuestaEst.nota || 0;
      }

      return {
        ...respuestaEst,
        esCorrecta,
        nota: notaCalculada,
        preguntaCompleta: pregunta
      };
    });

    setRespuestasEvaluadas(respuestas);
    calcularNotaFinal(respuestas);
  };

  const calcularNotaFinal = (respuestas) => {
    const totalPuntos = Evaluacion.preguntas.reduce((sum, pregunta) => sum + pregunta.valor, 0);
    const puntosObtenidos = respuestas.reduce((sum, respuesta) => sum + respuesta.nota, 0);
    const notaFinalCalculada = (puntosObtenidos / totalPuntos) * 20; // Asumiendo escala de 0-20
    setNotaFinal(Math.round(notaFinalCalculada * 100) / 100);
  };

  const actualizarNotaTexto = (respuestaId, nuevaNota) => {
    const respuestasActualizadas = respuestasEvaluadas.map(respuesta => {
      if (respuesta.id === respuestaId) {
        return { ...respuesta, nota: Number(nuevaNota) };
      }
      return respuesta;
    });
    
    setRespuestasEvaluadas(respuestasActualizadas);
    calcularNotaFinal(respuestasActualizadas);
  };

  const obtenerTextoOpcionSeleccionada = (respuesta) => {
    if (respuesta.opcionRespuesta) {
      const opcion = respuesta.preguntaCompleta.opcionRespuestas.find(
        op => op.id === respuesta.opcionRespuesta.id
      );
      return opcion?.opcionRespuesta || 'Opción no encontrada';
    }
    return 'No respondida';
  };

  if (!Evaluacion || !EvaluacionEstudiante || respuestasEvaluadas.length === 0) {
    return <div className="p-6">Cargando evaluación...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Evaluar Estudiante - {Evaluacion.titulo}
        </h1>
        <p className="text-gray-600">{Evaluacion.descripcion}</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800">
            Nota Final: {notaFinal}/20
          </h2>
        </div>
      </div>

      <div className="space-y-6">
        {respuestasEvaluadas.map((respuesta, index) => (
          <div key={respuesta.id} className="border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Pregunta {index + 1} ({respuesta.preguntaCompleta.valor} puntos)
              </h3>
              <p className="text-gray-700 mb-4">{respuesta.preguntaCompleta.pregunta}</p>
            </div>

            {respuesta.preguntaCompleta.tipoPregunta === 'opcion' ? (
              // Pregunta de opción múltiple
              <div className="space-y-3">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Opciones disponibles:</h4>
                  <div className="space-y-2">
                    {respuesta.preguntaCompleta.opcionRespuestas.map(opcion => (
                      <div 
                        key={opcion.id} 
                        className={`p-3 rounded border-2 ${
                          opcion.correcta 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        } ${
                          respuesta.opcionRespuesta?.id === opcion.id
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
                
                <div className={`p-4 rounded-lg ${
                  respuesta.esCorrecta ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <p className="font-medium">
                    Respuesta del estudiante: {obtenerTextoOpcionSeleccionada(respuesta)}
                  </p>
                  <p className={`text-sm mt-1 ${
                    respuesta.esCorrecta ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {respuesta.esCorrecta ? '✓ Correcta' : '✗ Incorrecta'} - 
                    Nota: {respuesta.nota}/{respuesta.preguntaCompleta.valor}
                  </p>
                </div>
              </div>
            ) : (
              // Pregunta de texto
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Respuesta del estudiante:</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {respuesta.respuesta || 'No respondida'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="font-medium text-gray-700">
                    Calificar (0-{respuesta.preguntaCompleta.valor}):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={respuesta.preguntaCompleta.valor}
                    step="0.5"
                    value={respuesta.nota}
                    onChange={(e) => actualizarNotaTexto(respuesta.id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-20 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-600">/ {respuesta.preguntaCompleta.valor}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Resumen de Evaluación</h3>
            <p className="text-gray-600">
              Puntos obtenidos: {respuestasEvaluadas.reduce((sum, r) => sum + r.nota, 0)} / {Evaluacion.preguntas.reduce((sum, p) => sum + p.valor, 0)}
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
          onClick={() => {
            console.log('Evaluación final a enviar:', {
              idEvaluacionEstudiante: Number(idEvaluacionEstudiante),
              respuestasEvaluadas,
              notaFinal
            });
            // Aquí implementarás el envío cuando me digas cómo
          }}
        >
          Guardar Evaluación
        </button>
      </div>
    </div>
  );
};

export default EvaluarEstudiante;