import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import type { JwTPayload, Entrevista } from "../Types"
import Spinner from "../../../../components/Spinner";
import { Play, AlertTriangle, Clock, CheckCircle, SkipForward } from 'lucide-react';
import type { UsuarioInfo } from "../../../../interfaces/interfaces";
import { getUsuarioByemail } from "../../evaluaciones/evaluacion/Helpers";
import { jwtDecode } from "jwt-decode";
import { speakWithPolly } from "../../../../services/PollyClient";

const DarEntrevista = () => {
    const { entrevistaId } = useParams();
    const token = localStorage.getItem("token");
    const decoded = jwtDecode<JwTPayload>(token || '');

    // Estados principales
    const [usuario, setUsuario] = useState<UsuarioInfo>();
    const [entrevista, setEntrevista] = useState<Entrevista>();
    const [loading, setLoading] = useState<boolean>(false);
    const [preguntaActual, setPreguntaActual] = useState<number>(0);
    const [entrevistaIniciada, setEntrevistaIniciada] = useState<boolean>(false);
    const [tiempoRestante, setTiempoRestante] = useState<number>(0);
    const [grabando, setGrabando] = useState<boolean>(false);

    // Referencias optimizadas
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const micGainRef = useRef<GainNode | null>(null);
    const pollyGainRef = useRef<GainNode | null>(null);
    const pollyAudioRef = useRef<HTMLAudioElement | null>(null);
    const pollySourceRef = useRef<MediaElementAudioSourceNode | null>(null);

    useEffect(() => {
        cargarUsuario();
        cargarEntrevista();

        return () => {
            limpiarRecursos();
        };
    }, []);

    const limpiarRecursos = () => {
        // Detener grabación y streams
        if (mediaRecorderRef.current && grabando) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Limpiar audio de Polly
        if (pollyAudioRef.current) {
            pollyAudioRef.current.pause();
            pollyAudioRef.current = null;
        }
        if (pollySourceRef.current) {
            pollySourceRef.current.disconnect();
        }

        // Cerrar AudioContext
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        window.speechSynthesis.cancel();
    };

    const cargarUsuario = async () => {
        const usuarioData = await getUsuarioByemail(token ?? "", decoded.email);
        setUsuario(usuarioData);
    }

    const cargarEntrevista = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/entrevistas/listEntrevistasById?idEntrevista=${entrevistaId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Accept': 'application/json; charset=UTF-8',
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error("Error al cargar la entrevista");

            const entrevistaData: Entrevista = await response.json();
            setEntrevista(entrevistaData);

            if (entrevistaData.preguntas.length > 0) {
                setTiempoRestante(entrevistaData.preguntas[0].tiempo * 60);
            }
        } catch (error) {
            console.error("Error al cargar la entrevista:", error);
        } finally {
            setLoading(false);
        }
    };

    const inicializarCamara = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } }
            });

            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Configurar AudioContext con nodos de ganancia
            const audioContext = new (window.AudioContext)({
                sampleRate: 48000
            });
            audioContextRef.current = audioContext;

            const destination = audioContext.createMediaStreamDestination();
            const micGain = audioContext.createGain();
            const pollyGain = audioContext.createGain();

            destinationRef.current = destination;
            micGainRef.current = micGain;
            pollyGainRef.current = pollyGain;

            // Configurar volúmenes
            micGain.gain.value = 1.0;
            pollyGain.gain.value = 2.5; // Volumen más alto para Polly

            // Conectar micrófono
            const micSource = audioContext.createMediaStreamSource(audioStream);
            micSource.connect(micGain);
            micGain.connect(destination);

            // Crear stream mixto
            const mixedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...destination.stream.getAudioTracks(),
            ]);

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream; // Solo video para preview
            }

            streamRef.current = mixedStream;
            return mixedStream;
        } catch (error) {
            console.error("Error al acceder a la cámara/micrófono:", error);
            alert("No se pudo acceder a la cámara. Verifica los permisos.");
            return null;
        }
    };

    const iniciarGrabacion = (stream: MediaStream) => {
        try {
            const options: MediaRecorderOptions = {};

            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                options.mimeType = 'video/webm;codecs=vp9,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                options.mimeType = 'video/webm';
            }

            options.audioBitsPerSecond = 192000;
            options.videoBitsPerSecond = 2500000;

            const mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start(500);
            mediaRecorderRef.current = mediaRecorder;
            setGrabando(true);

            console.log("Grabación iniciada");
        } catch (error) {
            console.error("Error al iniciar grabación:", error);
        }
    };

    const leerPregunta = async (texto: string) => {
        try {
            // Limpiar audio anterior
            if (pollyAudioRef.current) {
                pollyAudioRef.current.pause();
                pollyAudioRef.current = null;
            }
            if (pollySourceRef.current) {
                pollySourceRef.current.disconnect();
                pollySourceRef.current = null;
            }

            const audioElement = await speakWithPolly(texto);

            if (audioElement && audioContextRef.current && pollyGainRef.current && destinationRef.current) {
                pollyAudioRef.current = audioElement;

                // Esperar a que el audio esté listo
                await new Promise<void>((resolve) => {
                    audioElement.addEventListener('loadeddata', () => resolve(), { once: true });
                });

                // Conectar Polly al sistema de audio
                const pollySource = audioContextRef.current.createMediaElementSource(audioElement);
                pollySourceRef.current = pollySource;

                pollySource.connect(pollyGainRef.current);
                pollyGainRef.current.connect(destinationRef.current);
                pollyGainRef.current.connect(audioContextRef.current.destination);

                audioElement.play();

                // Limpiar al terminar
                audioElement.addEventListener('ended', () => {
                    if (pollySourceRef.current) {
                        pollySourceRef.current.disconnect();
                    }
                }, { once: true });
            }
        } catch (error) {
            console.error("Error al leer pregunta con Polly:", error);
        }
    };

    const iniciarTimer = (tiempoEnMinutos: number) => {
        const tiempoEnSegundos = tiempoEnMinutos * 60;
        setTiempoRestante(tiempoEnSegundos);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    siguientePregunta();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const siguientePregunta = () => {
        if (!entrevista) return;

        window.speechSynthesis.cancel();

        if (preguntaActual < entrevista.preguntas.length - 1) {
            const siguienteIndice = preguntaActual + 1;
            setPreguntaActual(siguienteIndice);

            const siguientePreguntaObj = entrevista.preguntas[siguienteIndice];
            iniciarTimer(siguientePreguntaObj.tiempo);

            setTimeout(() => {
                leerPregunta(siguientePreguntaObj.pregunta);
            }, 500);
        } else {
            finalizarEntrevista();
        }
    };

    const iniciarEntrevista = async () => {
        if (!entrevista || entrevista.preguntas.length === 0) return;

        const stream = await inicializarCamara();
        if (!stream) return;

        setEntrevistaIniciada(true);
        iniciarGrabacion(stream);

        const primeraPregunta = entrevista.preguntas[0];
        iniciarTimer(primeraPregunta.tiempo);

        setTimeout(() => {
            leerPregunta(primeraPregunta.pregunta);
        }, 1000);
    };

    const finalizarEntrevista = async () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        window.speechSynthesis.cancel();

        if (mediaRecorderRef.current && grabando) {
            mediaRecorderRef.current.stop();
            setGrabando(false);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        setTimeout(() => {
            procesarArchivosGrabados();
        }, 1000);
    };

    const procesarArchivosGrabados = async () => {
        try {
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

            const formData = new FormData();
            formData.append('video', videoBlob, 'entrevista-completa.webm');
            formData.append('entrevistaId', entrevistaId || '');
            formData.append('usuarioId', usuario?.id.toString() || '');

            const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/guardarGrabacion`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Entrevista finalizada y guardada correctamente');
            } else {
                console.error('Error al guardar la grabación');
            }
        } catch (error) {
            console.error('Error al procesar archivos:', error);
        }
    };

    const formatearTiempo = (segundos: number): string => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    if (loading) return <Spinner />;
    if (!entrevista) return <div className="text-center text-red-500">Error al cargar la entrevista</div>;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Entrevista: {entrevista.titulo}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Pregunta {preguntaActual + 1} de {entrevista.preguntas.length}</span>
                    {entrevistaIniciada && (
                        <>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Tiempo restante: {formatearTiempo(tiempoRestante)}
                            </span>
                            {grabando && (
                                <span className="flex items-center gap-1 text-red-600">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                    Grabando
                                </span>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="bg-black rounded-lg overflow-hidden aspect-video">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover"
                            playsInline
                        />
                    </div>

                    {!entrevistaIniciada ? (
                        <button
                            onClick={iniciarEntrevista}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold"
                        >
                            <Play className="w-5 h-5" />
                            Iniciar Entrevista
                        </button>
                    ) : (
                        <button
                            onClick={siguientePregunta}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold"
                        >
                            {preguntaActual < entrevista.preguntas.length - 1 ? (
                                <>
                                    <SkipForward className="w-5 h-5" />
                                    Siguiente Pregunta
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Finalizar Entrevista
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Pregunta {preguntaActual + 1}
                        </h3>

                        <p className="text-xl leading-relaxed mb-4">
                            {entrevista.preguntas[preguntaActual]?.pregunta}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                                Tiempo asignado: {entrevista.preguntas[preguntaActual]?.tiempo} minutos
                            </span>
                            <span>
                                Valor: {entrevista.preguntas[preguntaActual]?.valor} puntos
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((preguntaActual + 1) / entrevista.preguntas.length) * 100}%`
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {!entrevistaIniciada && (
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Asegúrate de tener buena iluminación y conexión estable</li>
                                <li>• La entrevista se grabará automáticamente al iniciar</li>
                                <li>• Cada pregunta se leerá en voz alta automáticamente</li>
                                <li>• Puedes avanzar manualmente o esperar a que termine el tiempo</li>
                                <li>• Al finalizar se guardará el video completo con audio incluido</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DarEntrevista;