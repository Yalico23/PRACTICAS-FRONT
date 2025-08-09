import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, Mic, Camera, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Pregunta {
  id: number;
  pregunta: string;
  tiempo: number;
}

interface EntrevistaMetadata {
  sessionId: string;
  videoUrl?: string;
  audioUrl?: string;
  duracionTotal: number;
  preguntas: number;
  fechaInicio: Date;
  fechaFin: Date;
}

interface ProgresoEntrevista {
  actual: number;
  total: number;
  porcentaje: number;
}

type EstadoPolly = 'idle' | 'hablando' | 'completado';

interface EstadoEntrevista {
  entrevistaIniciada: boolean;
  preguntaActual: number;
  tiempoRestante: number;
  grabando: boolean;
  preguntas: Pregunta[];
  estadoPolly: EstadoPolly;
  serviciosInicializados: boolean;
  loading: boolean;
  error: string;
  completada: boolean;
}

class MockPollyService {
  // Simula la síntesis de voz usando SpeechSynthesis API
  async synthesizeSpeech(texto: string) {
    return new Promise(resolve => {
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      resolve(utterance);
    });
  }

  async playAudio(utterance: SpeechSynthesisUtterance, onStart?: () => void, onEnd?: () => void, onError?: () => void) {
    return new Promise<void>((resolve, reject) => {
      utterance.onstart = () => onStart?.();
      utterance.onend = () => {
        onEnd?.();
        resolve();
      };
      utterance.onerror = () => {
        onError?.();
        reject();
      };
      speechSynthesis.speak(utterance);
    });
  }

  stopCurrentSpeech() {
    speechSynthesis.cancel();
  }
}

class MockMediaService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  async initializeMedia() {
  try {
    console.log('[MediaService line:87] Enumerando dispositivos...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(d => d.kind === 'videoinput');
    console.log('[MediaService line:90] Dispositivos de video:', videoInputs);

    if (videoInputs.length === 0) {
      throw new Error('No se detectaron dispositivos de video');
    }

    console.log('[MediaService line:96] Solicitando acceso a cámara y micrófono...');
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });
    console.log('[MediaService line:101] Stream obtenido:', this.stream);

    return { success: true, stream: this.stream };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('[MediaService line:106] Error al obtener media:', errorMsg);
    return { success: false, error: errorMsg };
  }
}



  startRecording() {
    if (!this.stream) return { success: false, error: 'No stream' };

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.start();
    return { success: true };
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve({ success: false, error: 'No recorder' });
        return;
      }

      this.mediaRecorder.onstop = () => {
        const videoBlob = new Blob(this.chunks, { type: 'video/webm' });
        resolve({ success: true, videoBlob });
      };

      this.mediaRecorder.stop();
    });
  }

  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }
}

class MockEntrevistaService {
  private preguntas: Pregunta[] = [
    { id: 1, pregunta: "Cuéntame sobre tu experiencia profesional más relevante", tiempo: 120 },
    { id: 2, pregunta: "¿Cuáles consideras que son tus principales fortalezas?", tiempo: 90 },
    { id: 3, pregunta: "Describe una situación difícil que hayas enfrentado y cómo la resolviste", tiempo: 150 },
    { id: 4, pregunta: "¿Por qué te interesa esta posición?", tiempo: 60 }
  ];

  public preguntaActual: number = 0;
  private tiempoInicio: number | null = null;

  async loadQuestions() {
    return { success: true, data: this.preguntas };
  }

  getCurrentQuestion() {
    return this.preguntas[this.preguntaActual] || null;
  }

  nextQuestion() {
    if (this.preguntaActual < this.preguntas.length - 1) {
      this.preguntaActual++;
      return this.getCurrentQuestion();
    }
    return null;
  }

  isLastQuestion() {
    return this.preguntaActual >= this.preguntas.length - 1;
  }

  getProgress(): ProgresoEntrevista {
    return {
      actual: this.preguntaActual + 1,
      total: this.preguntas.length,
      porcentaje: Math.round(((this.preguntaActual + 1) / this.preguntas.length) * 100)
    };
  }

  start() {
    this.tiempoInicio = Date.now();
    this.preguntaActual = 0;
  }

  end() {
    const duracion = this.tiempoInicio ? Date.now() - this.tiempoInicio : 0;
    return {
      duracionTotal: duracion,
      preguntasCompletadas: this.preguntaActual + 1,
      preguntasTotal: this.preguntas.length
    };
  }

  reset() {
    this.preguntaActual = 0;
    this.tiempoInicio = null;
  }
}

// Instancias de servicios
const pollyService = new MockPollyService();
const mediaService = new MockMediaService();
const entrevistaService = new MockEntrevistaService();

const Entrevista: React.FC = () => {
  const [estado, setEstado] = useState<EstadoEntrevista>({
    entrevistaIniciada: false,
    preguntaActual: 0,
    tiempoRestante: 0,
    grabando: false,
    preguntas: [],
    estadoPolly: 'idle',
    serviciosInicializados: false,
    loading: false,
    error: '',
    completada: false
  });

  // Referencia para el elemento de video
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Vincula el stream al video una vez que comienza a grabar
  useEffect(() => {
    const stream = mediaService.getStream();
    if (stream) {
      console.log('[Entrevista line:241] Stream obtenido para videoRef:', stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        console.warn('[Entrevista line:245] videoRef no está disponible.');
      }
    } else {
      console.warn('[Entrevista line:248] No se obtuvo ningún stream.');
    }
  }, [estado.grabando]);


  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateEstado = useCallback((updates: Partial<EstadoEntrevista>) => {
    setEstado(prev => ({ ...prev, ...updates }));
  }, []);

  // Inicializar servicios
  const inicializarServicios = useCallback(async (): Promise<void> => {
    try {
      updateEstado({ loading: true, error: '' });

      const preguntasResult = await entrevistaService.loadQuestions();

      if (!preguntasResult.success) {
        throw new Error(`Error cargando preguntas`);
      }

      updateEstado({
        preguntas: preguntasResult.data || [],
        serviciosInicializados: true,
        loading: false
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateEstado({
        error: `Error de inicialización: ${errorMessage}`,
        loading: false
      });
    }
  }, [updateEstado]);

  // Hablar pregunta
  const hablarPregunta = useCallback(async (pregunta: string): Promise<void> => {
    try {
      updateEstado({ estadoPolly: 'hablando' });

      const utterance = await pollyService.synthesizeSpeech(pregunta);

      await pollyService.playAudio(
        utterance as SpeechSynthesisUtterance,
        () => console.log('Iniciando reproducción de pregunta line:294'),
        () => {
          updateEstado({ estadoPolly: 'completado' });
          iniciarTiempoRespuesta();
        },
        () => {
          updateEstado({ estadoPolly: 'completado' });
          iniciarTiempoRespuesta();
        }
      );

    } catch (error) {
      console.error('Error con Polly: line:306', error);
      updateEstado({ estadoPolly: 'completado' });
      iniciarTiempoRespuesta();
    }
  }, [updateEstado]);

  // Iniciar tiempo de respuesta
  const iniciarTiempoRespuesta = useCallback((): void => {
    const pregunta = entrevistaService.getCurrentQuestion();
    if (!pregunta) return;

    updateEstado({ tiempoRestante: pregunta.tiempo });

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setEstado(prev => {
        const nuevoTiempo = prev.tiempoRestante - 1;
        if (nuevoTiempo <= 0) {
          siguientePregunta();
          return { ...prev, tiempoRestante: 0 };
        }
        return { ...prev, tiempoRestante: nuevoTiempo };
      });
    }, 1000);
  }, [updateEstado]);

  // Iniciar grabación
  const iniciarGrabacion = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[Entrevista line:338] Iniciando grabación...');
      const mediaResult = await mediaService.initializeMedia();

      if (!mediaResult.success) {
        console.error('[Entrevista line:342] Error en initializeMedia:', mediaResult.error);
        throw new Error(mediaResult.error);
      }

      if (videoRef.current && mediaResult.stream) {
        console.log('[Entrevista line:347] Asignando stream al elemento video');
        videoRef.current.srcObject = mediaResult.stream;
      } else {
        console.warn('[Entrevista line:350] videoRef o stream no disponibles');
      }

      const recordResult = mediaService.startRecording();

      if (!recordResult.success) {
        console.error('[Entrevista line:356] Error al iniciar grabación:', recordResult.error);
        throw new Error(recordResult.error);
      }

      updateEstado({ grabando: true });
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[Entrevista line:365] Error iniciando grabación:', errorMessage);
      updateEstado({ error: `Error de grabación: ${errorMessage}` });
      return false;
    }
  }, [updateEstado]);


  // Detener grabación
  const detenerGrabacion = useCallback(async (): Promise<void> => {
    try {
      const recordResult = await mediaService.stopRecording();
      const typedRecordResult = recordResult as { success: boolean; error?: string; videoBlob?: Blob };

      if (!typedRecordResult.success) {
        throw new Error(typedRecordResult.error);
      }

      updateEstado({ grabando: false });
      console.log('Grabación completada line:383');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateEstado({ error: `Error procesando grabación: ${errorMessage}` });
    }
  }, [updateEstado]);

  // Siguiente pregunta
  const siguientePregunta = useCallback((): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    pollyService.stopCurrentSpeech();

    const siguientePreguntaData = entrevistaService.nextQuestion();

    if (siguientePreguntaData) {
      updateEstado({
        preguntaActual: entrevistaService.preguntaActual,
        estadoPolly: 'idle',
        tiempoRestante: 0
      });

      setTimeout(() => {
        hablarPregunta(siguientePreguntaData.pregunta);
      }, 1000);
    } else {
      finalizarEntrevista();
    }
  }, [updateEstado, hablarPregunta]);

  // Finalizar entrevista
  const finalizarEntrevista = useCallback(async (): Promise<void> => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await detenerGrabacion();

      const resultados = entrevistaService.end();

      const metadata: EntrevistaMetadata = {
        sessionId: `entrevista_${Date.now()}`,
        duracionTotal: resultados.duracionTotal,
        preguntas: resultados.preguntasTotal,
        fechaInicio: new Date(Date.now() - resultados.duracionTotal),
        fechaFin: new Date()
      };

      console.log('Entrevista completada line:437 :', metadata);

      updateEstado({
        completada: true,
        entrevistaIniciada: false
      });

    } catch (error) {
      console.error('Error finalizando entrevista line:445 :', error);
    }
  }, [detenerGrabacion, updateEstado]);

  // Iniciar entrevista
  const iniciarEntrevista = useCallback(async (): Promise<void> => {
    try {
      updateEstado({ loading: true, error: '' });

      const grabacionIniciada = await iniciarGrabacion();

      if (!grabacionIniciada) {
        throw new Error('No se pudo iniciar la grabación');
      }

      entrevistaService.start();

      updateEstado({
        entrevistaIniciada: true,
        preguntaActual: 0,
        loading: false
      });

      const primeraPregunta = entrevistaService.getCurrentQuestion();
      if (primeraPregunta) {
        setTimeout(() => {
          hablarPregunta(primeraPregunta.pregunta);
        }, 2000);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      updateEstado({
        error: `Error iniciando entrevista: ${errorMessage}`,
        loading: false
      });
    }
  }, [updateEstado, iniciarGrabacion, hablarPregunta]);

  // Reiniciar entrevista
  const reiniciarEntrevista = useCallback((): void => {
    mediaService.cleanup();
    entrevistaService.reset();

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setEstado({
      entrevistaIniciada: false,
      preguntaActual: 0,
      tiempoRestante: 0,
      grabando: false,
      preguntas: estado.preguntas,
      estadoPolly: 'idle',
      serviciosInicializados: estado.serviciosInicializados,
      loading: false,
      error: '',
      completada: false
    });
  }, [estado.preguntas, estado.serviciosInicializados]);

  // Formatear tiempo
  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Efecto para inicializar servicios
  useEffect(() => {
    inicializarServicios();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      mediaService.cleanup();
    };
  }, [inicializarServicios]);

  // Obtener progreso
  const progreso = entrevistaService.getProgress();

  if (estado.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando servicios...</p>
        </div>
      </div>
    );
  }

  if (estado.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">Error</h2>
          </div>
          <p className="text-gray-700 mb-4">{estado.error}</p>
          <button
            onClick={inicializarServicios}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (estado.completada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Entrevista Completada!</h2>
          <p className="text-gray-600 mb-6">
            Has completado todas las preguntas exitosamente.
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-gray-500">
              Preguntas completadas: {progreso.actual} de {progreso.total}
            </p>
            <p className="text-sm text-gray-500">
              Duración total: {formatearTiempo(Math.floor(entrevistaService.end().duracionTotal / 1000))}
            </p>
          </div>
          <button
            onClick={reiniciarEntrevista}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nueva Entrevista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Sistema de Entrevista Virtual</h1>
            <p className="text-gray-600">
              {estado.entrevistaIniciada ?
                `Pregunta ${progreso.actual} de ${progreso.total}` :
                'Prepárate para comenzar tu entrevista'
              }
            </p>
          </div>

          {/* Progreso */}
          {estado.entrevistaIniciada && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{progreso.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progreso.porcentaje}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Video y controles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Video */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                  className="w-full h-full object-cover"
                />

                {/* Indicador si no se detecta la cámara */}
                {!mediaService.getStream() && (() => {
                  console.warn('[Entrevista line:636] Cámara no detectada o permisos denegados.');
                  return (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-50">
                      <p>No se detectó la cámara</p>
                    </div>
                  );
                })()}

                {estado.grabando && (
                  <div className="absolute top-4 right-4 flex items-center bg-red-600 text-white px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                    <span className="text-sm font-medium">REC</span>
                  </div>
                )}
              </div>


              {/* Indicadores de estado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${estado.grabando ? 'text-red-600' : 'text-gray-400'}`}>
                    <Camera className="h-4 w-4 mr-1" />
                    <span className="text-sm">Cámara</span>
                  </div>
                  <div className={`flex items-center ${estado.grabando ? 'text-red-600' : 'text-gray-400'}`}>
                    <Mic className="h-4 w-4 mr-1" />
                    <span className="text-sm">Audio</span>
                  </div>
                </div>

                {estado.estadoPolly === 'hablando' && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm">Reproduciendo pregunta...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de control */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              {!estado.entrevistaIniciada ? (
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">¿Listo para comenzar?</h3>
                  <p className="text-gray-600 mb-6">
                    La entrevista consta de {estado.preguntas.length} preguntas.
                    Cada pregunta tiene un tiempo límite para responder.
                  </p>
                  <button
                    onClick={iniciarEntrevista}
                    disabled={!estado.serviciosInicializados || estado.loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Iniciar Entrevista
                  </button>
                </div>
              ) : (
                <div>
                  {/* Pregunta actual */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Pregunta {progreso.actual}</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-800">
                        {entrevistaService.getCurrentQuestion()?.pregunta}
                      </p>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Tiempo restante</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-600" />
                        <span className={`font-mono text-lg ${estado.tiempoRestante <= 30 ? 'text-red-600' : 'text-gray-800'}`}>
                          {formatearTiempo(estado.tiempoRestante)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${estado.tiempoRestante <= 30 ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        style={{
                          width: `${(estado.tiempoRestante / (entrevistaService.getCurrentQuestion()?.tiempo || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Botones de control */}
                  <div className="space-y-3">
                    <button
                      onClick={siguientePregunta}
                      disabled={entrevistaService.isLastQuestion()}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {entrevistaService.isLastQuestion() ? 'Última Pregunta' : 'Siguiente Pregunta'}
                    </button>

                    <button
                      onClick={finalizarEntrevista}
                      className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Finalizar Entrevista
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Entrevista;