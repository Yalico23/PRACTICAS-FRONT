import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface datoEntrevista {
    id: number;
    fechaEntrevista: string;
    videoResumen: string;
    urlvideo: string;
    feedBack: string;
    valoracion: string;
}

interface EvaluacionData {
    feedback: string;
    nota: number;
}

interface EvaluacionIA {
    analisis?: string;
    notaSugerida?: number;
    fortalezas?: string[];
    debilidades?: string[];
    recomendaciones?: string[];
}

// Componente para carga lazy del video
const VideoLazy = ({ videoUrl }: { videoUrl: string }) => {
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

    const handleLoadVideo = () => {
        setShouldLoadVideo(true);
    };

    if (!shouldLoadVideo) {
        return (
            <div
                className="relative bg-gray-900 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors"
                style={{ height: '400px', maxHeight: '400px' }}
                onClick={handleLoadVideo}
            >
                <div className="text-center text-white">
                    <div className="mb-4">
                        <svg
                            className="w-16 h-16 mx-auto text-white opacity-80"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium">Reproducir Video</p>
                    <p className="text-sm text-gray-300 mt-1">Haz clic para cargar y reproducir</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <video
                src={videoUrl}
                controls
                autoPlay
                preload="metadata"
                className="w-full rounded-lg shadow-md"
                style={{ maxHeight: '400px' }}
            >
                Tu navegador no soporta el elemento video.
            </video>
        </div>
    );
};

const EntrevistaPendiente = () => {
    const navigate = useNavigate();
    const { idEntrevista } = useParams();

    const [entrevista, setEntrevista] = useState<datoEntrevista>();
    const [evaluacion, setEvaluacion] = useState<EvaluacionData>({
        feedback: '',
        nota: 1
    });
    const [evaluacionIA, setEvaluacionIA] = useState<EvaluacionIA>({});
    const [generandoResumen, setGenerandoResumen] = useState(false);
    const [errors, setErrors] = useState<{ nota?: string }>({});

    const token = localStorage.getItem('token');

    useEffect(() => {
        cargarEntrevista();
    }, []);

    const cargarEntrevista = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/buscarEntrevistaEstudiante?idEntrevistaEstudiante=${idEntrevista}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Error al cargar la entrevista');
            }

            const data: datoEntrevista = await response.json();
            setEntrevista(data);
            // Inicializar feedback y nota si ya existen en la BD
            setEvaluacion({
                feedback: data.feedBack || '',
                nota: data.valoracion ? parseInt(data.valoracion) : 1
            });
        } catch (error) {
            console.error("Error al cargar la entrevista:", error);
        }
    };

    const generarResumenCritico = async () => {
        setGenerandoResumen(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/generarResumenEntrevistaIA?texto=${entrevista?.videoResumen}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al generar resumen crítico');
            }

            const data: EvaluacionIA = await response.json();
            setEvaluacionIA(data);

            // Si hay una nota sugerida, ofrecerla al evaluador
            if (data.notaSugerida) {
                setEvaluacion(prev => ({ ...prev, nota: data.notaSugerida! }));
            }

        } catch (error) {
            console.error("Error al generar resumen crítico:", error);
        } finally {
            setGenerandoResumen(false);
        }
    };

    const handleNotaChange = (value: string) => {
        const nota = parseInt(value);

        // Validaciones
        if (isNaN(nota) || nota < 1 || nota > 20) {
            setErrors({ nota: "La nota debe ser un número entero entre 1 y 20" });
            return;
        }

        setErrors({});
        setEvaluacion(prev => ({ ...prev, nota }));
    };

    const handleFeedbackChange = (value: string) => {
        setEvaluacion(prev => ({ ...prev, feedback: value }));
    };

    const guardarEvaluacion = async () => {
        if (errors.nota) {
            alert("Por favor corrige los errores antes de guardar");
            return;
        }

        const params = new URLSearchParams({
            idEntrevistaEstudiante: idEntrevista?.toString() || '',
            feedback: evaluacion.feedback,
            valoracion: evaluacion.nota.toString()
        });

        try {
            const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/evaluarEntrevista?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Error al guardar la evaluación');
            }
            navigate(-1);
        } catch (error) {
            console.error("Error al guardar la evaluación:", error);
        }
    };

    if (!entrevista) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Cargando entrevista...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Evaluación de Entrevista Técnica
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda - Video y resumen */}
                <div className="space-y-6">
                    {/* Video */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            Video de la Entrevista
                        </h2>
                        <VideoLazy videoUrl={entrevista.urlvideo} />
                        <div className="mt-2 text-sm text-gray-600">
                            <strong>Fecha:</strong> {new Date(entrevista.fechaEntrevista).toLocaleDateString()}
                        </div>
                    </div>

                    {/* Resumen del video */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            Resumen del Video
                        </h2>
                        <div className="bg-white p-3 rounded border">
                            <p className="text-gray-700 leading-relaxed">
                                {entrevista.videoResumen || "No hay resumen disponible"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Evaluación */}
                <div className="space-y-6">
                    {/* Evaluación IA Estructurada */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Evaluación con IA
                            </h2>
                            <button
                                onClick={generarResumenCritico}
                                disabled={generandoResumen}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${generandoResumen
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                    }`}
                            >
                                {generandoResumen ? 'Analizando...' : 'Generar Análisis con IA'}
                            </button>
                        </div>

                        {/* Nota Sugerida */}
                        {evaluacionIA.notaSugerida && (
                            <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-yellow-800">
                                        Nota sugerida por IA:
                                    </span>
                                    <span className="text-2xl font-bold text-yellow-900">
                                        {evaluacionIA.notaSugerida}/20
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Análisis General */}
                        {evaluacionIA.analisis && (
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-700 mb-2">📋 Análisis General:</h3>
                                <div className="bg-white p-3 rounded border text-sm text-gray-700">
                                    {evaluacionIA.analisis}
                                </div>
                            </div>
                        )}

                        {/* Fortalezas */}
                        {evaluacionIA.fortalezas && evaluacionIA.fortalezas.length > 0 ? (
                            <div className="mb-4">
                                <h3 className="font-medium text-green-700 mb-2">✅ Fortalezas:</h3>
                                <ul className="bg-green-50 p-3 rounded border border-green-200 text-sm text-gray-700 list-disc pl-5 space-y-1">
                                    {evaluacionIA.fortalezas.map((fortaleza, idx) => (
                                        <li key={idx}>{fortaleza}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : evaluacionIA.analisis && (
                            <div className="mb-4">
                                <h3 className="font-medium text-green-700 mb-2">✅ Fortalezas:</h3>
                                <div className="bg-green-50 p-3 rounded border border-green-200 text-sm text-gray-500 italic">
                                    Las fortalezas están incluidas en el análisis general
                                </div>
                            </div>
                        )}

                        {/* Debilidades */}
                        {evaluacionIA.debilidades && evaluacionIA.debilidades.length > 0 ? (
                            <div className="mb-4">
                                <h3 className="font-medium text-red-700 mb-2">⚠️ Áreas de Mejora:</h3>
                                <ul className="bg-red-50 p-3 rounded border border-red-200 text-sm text-gray-700 list-disc pl-5 space-y-1">
                                    {evaluacionIA.debilidades.map((debilidad, idx) => (
                                        <li key={idx}>{debilidad}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : evaluacionIA.analisis && (
                            <div className="mb-4">
                                <h3 className="font-medium text-red-700 mb-2">⚠️ Áreas de Mejora:</h3>
                                <div className="bg-red-50 p-3 rounded border border-red-200 text-sm text-gray-500 italic">
                                    Se requiere más información para identificar áreas específicas de mejora
                                </div>
                            </div>
                        )}

                        {/* Recomendaciones */}
                        {evaluacionIA.recomendaciones && evaluacionIA.recomendaciones.length > 0 ? (
                            <div className="mb-4">
                                <h3 className="font-medium text-blue-700 mb-2">💡 Recomendaciones:</h3>
                                <ul className="bg-blue-50 p-3 rounded border border-blue-200 text-sm text-gray-700 list-disc pl-5 space-y-1">
                                    {evaluacionIA.recomendaciones.map((recomendacion, idx) => (
                                        <li key={idx}>{recomendacion}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : evaluacionIA.analisis && (
                            <div className="mb-4">
                                <h3 className="font-medium text-blue-700 mb-2">💡 Recomendaciones:</h3>
                                <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm text-gray-500 italic">
                                    Continuar con desarrollo profesional y práctica constante
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Feedback */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            Feedback de Evaluación
                        </h2>
                        <textarea
                            value={evaluacion.feedback}
                            onChange={(e) => {
                                if (e.target.value.length <= 255) {
                                    handleFeedbackChange(e.target.value);
                                }
                            }}
                            maxLength={255} // importante para bloquear la escritura extra
                            placeholder="Escribe tu feedback detallado sobre el desempeño del estudiante..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {evaluacion.feedback.length}/255
                        </div>
                    </div>


                    {/* Nota */}
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-3">
                            Calificación
                        </h2>
                        <div className="flex items-center space-x-4">
                            <label htmlFor="nota" className="font-medium text-gray-700">
                                Nota (1-20):
                            </label>
                            <input
                                id="nota"
                                type="number"
                                min="1"
                                max="20"
                                step="1"
                                value={evaluacion.nota}
                                onChange={(e) => handleNotaChange(e.target.value)}
                                className={`w-20 p-2 border rounded-md text-center font-bold text-lg ${errors.nota
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-gray-300 focus:ring-orange-500'
                                    } focus:ring-2 focus:border-transparent`}
                            />
                            <span className="text-gray-600">/ 20</span>
                        </div>
                        {errors.nota && (
                            <p className="mt-2 text-sm text-red-600">{errors.nota}</p>
                        )}
                    </div>

                    {/* Botón de guardar */}
                    <div className="pt-4">
                        <button
                            onClick={guardarEvaluacion}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                        >
                            Guardar Evaluación
                        </button>
                        
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md mt-3"
                        >
                            Regresar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntrevistaPendiente;