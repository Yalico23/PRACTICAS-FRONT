import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import type { JwTPayload, Entrevista } from "../Types"
import Spinner from "../../../../components/Spinner";
import { Play, AlertTriangle, Clock, CheckCircle, SkipForward } from 'lucide-react';
import type { UsuarioInfo } from "../../../../interfaces/interfaces";
import { getUsuarioByemail } from "../../evaluaciones/evaluacion/Helpers";
import { jwtDecode } from "jwt-decode";

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

    // Referencias para el video y grabación
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        cargarUsuario();
        cargarEntrevista();
        return () => {
            // Cleanup al desmontar componente
            detenerGrabacion();
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            window.speechSynthesis.cancel();
        };
    }, []);

    const cargarUsuario = async () => {
        const usuarioData = await getUsuarioByemail(token ?? "", decoded.email);
        setUsuario(usuarioData);
    }

    // Cargar datos de la entrevista
    const cargarEntrevista = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/entrevistas/listEntrevistasById?idEntrevista=${entrevistaId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Accept': 'application/json; charset=UTF-8',
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                console.error("Error al cargar la entrevista");
                return;
            }

            const entrevistaData: Entrevista = await response.json();
            setEntrevista(entrevistaData);

            // Configurar tiempo inicial de la primera pregunta
            if (entrevistaData.preguntas.length > 0) {
                setTiempoRestante(entrevistaData.preguntas[0].tiempo * 60); // Convertir minutos a segundos
            }
        } catch (error) {
            console.error("Error al cargar la entrevista:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reemplaza la función inicializarCamara con esta versión mejorada:
    const inicializarCamara = async () => {
        try {
            // Capturar video de la cámara
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Capturar audio del micrófono
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            // Combinar las pistas de video y audio
            const combinedStream = new MediaStream([
                ...videoStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ]);

            if (videoRef.current) {
                videoRef.current.srcObject = combinedStream;
            }

            streamRef.current = combinedStream;
            return combinedStream;

        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
            alert("No se pudo acceder a la cámara. Verifica los permisos.");
            return null;
        }
    };

    // Y modifica la función iniciarGrabacion para mejor captura de audio:
    const iniciarGrabacion = (stream: MediaStream) => {
        try {
            // Crear un solo MediaRecorder para video y audio juntos con mejor configuración
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus',
                audioBitsPerSecond: 128000, // Mejor calidad de audio
                videoBitsPerSecond: 2500000 // Buena calidad de video
            });

            // Configurar grabador
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Iniciar grabación con chunks cada segundo para mejor captura
            mediaRecorder.start(1000);

            mediaRecorderRef.current = mediaRecorder;
            setGrabando(true);

            console.log("Grabación iniciada con audio mejorado");
        } catch (error) {
            console.error("Error al iniciar grabación:", error);
        }
    };

    // Detener grabación
    const detenerGrabacion = () => {
        if (mediaRecorderRef.current && grabando) {
            mediaRecorderRef.current.stop();
            setGrabando(false);
            console.log("Grabación detenida");
        }
        // Detener la cámara y el micrófono
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Limpiar el video
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    // Leer pregunta usando síntesis de voz
    const leerPregunta = (texto: string) => {
        // Cancelar cualquier síntesis anterior
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(texto);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;

        speechSynthesisRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    };

    // Iniciar timer de pregunta
    const iniciarTimer = (tiempoEnMinutos: number) => {
        const tiempoEnSegundos = tiempoEnMinutos * 60;
        setTiempoRestante(tiempoEnSegundos);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTiempoRestante((prev) => {
                if (prev <= 1) {
                    siguientePregunta(); // Pasar automáticamente a la siguiente
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Pasar a la siguiente pregunta
    const siguientePregunta = () => {
        if (!entrevista) return;

        // Cancelar síntesis de voz actual
        window.speechSynthesis.cancel();

        if (preguntaActual < entrevista.preguntas.length - 1) {
            // Hay más preguntas
            const siguienteIndice = preguntaActual + 1;
            setPreguntaActual(siguienteIndice);

            const siguientePreguntaObj = entrevista.preguntas[siguienteIndice];
            iniciarTimer(siguientePreguntaObj.tiempo);

            // Leer la nueva pregunta después de un pequeño delay
            setTimeout(() => {
                leerPregunta(siguientePreguntaObj.pregunta);
            }, 500);
        } else {
            // Es la última pregunta, finalizar entrevista
            finalizarEntrevista();
        }
    };

    // Iniciar entrevista
    const iniciarEntrevista = async () => {
        if (!entrevista || entrevista.preguntas.length === 0) return;

        const stream = await inicializarCamara();
        if (!stream) return;

        setEntrevistaIniciada(true);
        iniciarGrabacion(stream);

        // Iniciar timer para la primera pregunta
        const primeraPregunta = entrevista.preguntas[0];
        iniciarTimer(primeraPregunta.tiempo);

        // Leer primera pregunta después de un delay
        setTimeout(() => {
            leerPregunta(primeraPregunta.pregunta);
        }, 1000);
    };

    // Finalizar entrevista
    const finalizarEntrevista = async () => {
        // Detener timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Cancelar síntesis de voz
        window.speechSynthesis.cancel();

        // Detener grabación
        detenerGrabacion();

        // Detener stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        // Procesar archivos grabados
        setTimeout(() => {
            procesarArchivosGrabados();
        }, 1000);
    };

    // Procesar archivos grabados y enviar al backend
    const procesarArchivosGrabados = async () => { // mandando en formato WebM el video
        try {
            // Crear blob de video con audio incluido
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

            // Crear FormData para enviar al backend
            const formData = new FormData();
            formData.append('video', videoBlob, 'entrevista-completa.webm');
            formData.append('entrevistaId', entrevistaId || '');
            formData.append('usuarioId', usuario?.id.toString() || '');
            // Enviar al backend
            const response = await fetch('http://localhost:8080/api/entrevistaEstudiante/guardarGrabacion', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                alert('Entrevista finalizada y guardada correctamente');
                // Aquí puedes redirigir o hacer lo que necesites
            } else {
                console.error('Error al guardar la grabación');
            }
        } catch (error) {
            console.error('Error al procesar archivos:', error);
        }
    };

    // Formatear tiempo (segundos a MM:SS)
    const formatearTiempo = (segundos: number): string => {
        const minutos = Math.floor(segundos / 60);
        const segs = segundos % 60;
        return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return <Spinner />;
    }

    if (!entrevista) {
        return <div className="text-center text-red-500">Error al cargar la entrevista</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
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
                {/* Panel de Video */}
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
                        <div className="flex gap-2">
                            <button
                                onClick={siguientePregunta}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-semibold"
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
                        </div>
                    )}
                </div>

                {/* Panel de Preguntas */}
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

                    {/* Progress bar de preguntas */}
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

            {/* Instrucciones */}
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