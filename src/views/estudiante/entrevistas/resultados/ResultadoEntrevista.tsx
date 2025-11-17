import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface DatoEntrevista {
    id: number;
    fechaEntrevista: string;
    videoResumen: string;
    urlvideo: string;
    feedBack: string;
    valoracion: number;
}

const ResultadoEntrevista = () => {
    const navigate = useNavigate();
    const { idEstudiante, idEntrevista } = useParams();
    const token = localStorage.getItem('token') || '';

    const [idEntrevistaEstudiante, setIdEntrevistaEstudiante] = useState<number | null>(null);
    const [entrevista, setEntrevista] = useState<DatoEntrevista | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mostrarVideo, setMostrarVideo] = useState(false);
    const [videoLoading, setVideoLoading] = useState(false);

    useEffect(() => {
        buscarEntrevistaEstudiante(Number(idEstudiante), Number(idEntrevista));
    }, []);

    useEffect(() => {
        if (idEntrevistaEstudiante) {
            cargarEntrevista(idEntrevistaEstudiante);
        }
    }, [idEntrevistaEstudiante]);

    const buscarEntrevistaEstudiante = async (idEstudiante: number, idEntrevista: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/idEntrevistaEstudiante/${idEntrevista}/${idEstudiante}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Error al buscar entrevista');

            const data = await response.json();
            setIdEntrevistaEstudiante(data.id);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setLoading(false);
        }
    };

    const cargarEntrevista = async (idEntrevistaEstudiante: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/buscarEntrevistaEstudiante?idEntrevistaEstudiante=${idEntrevistaEstudiante}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Error al cargar la entrevista');

            const data: DatoEntrevista = await response.json();
            
            // Parsear el videoResumen si viene como string JSON
            if (data.videoResumen) {
                try {
                    const resumenObj = JSON.parse(data.videoResumen);
                    data.videoResumen = resumenObj.text || data.videoResumen;
                } catch (e) {
                    console.log("videoResumen no es JSON, usando valor directo");
                }
            }

            setEntrevista(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar entrevista');
        } finally {
            setLoading(false);
        }
    };

    const handleMostrarVideo = () => {
        setVideoLoading(true);
        setMostrarVideo(true);
    };

    const formatearFecha = (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getValoracionColor = (valoracion: string) => {
        const val = valoracion?.toLowerCase() || '';
        if (val.includes('excelente') || val.includes('sobresaliente')) return 'text-green-400';
        if (val.includes('bueno') || val.includes('bien')) return 'text-blue-400';
        if (val.includes('regular') || val.includes('aceptable')) return 'text-yellow-400';
        if (val.includes('deficiente') || val.includes('malo')) return 'text-red-400';
        return 'text-gray-400';
    };

    const getValoracionIcon = (valoracion: string) => {
        const val = valoracion?.toLowerCase() || '';
        if (val.includes('excelente') || val.includes('sobresaliente')) return '🌟';
        if (val.includes('bueno') || val.includes('bien')) return '👍';
        if (val.includes('regular') || val.includes('aceptable')) return '⚡';
        if (val.includes('deficiente') || val.includes('malo')) return '📝';
        return '📊';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Cargando resultados...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
                    <p className="text-red-300">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Regresar
                    </button>
                </div>
            </div>
        );
    }

    if (!entrevista) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">No se encontró la entrevista</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                📹 Resultado de tu Entrevista
                            </h1>
                            <p className="text-gray-400 flex items-center gap-2">
                                <span>📅</span>
                                {formatearFecha(entrevista.fechaEntrevista)}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            ← Regresar
                        </button>
                    </div>

                    {/* Valoración */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mt-4">
                        <div className="text-center">
                            <p className="text-purple-200 text-lg mb-2">Valoración General</p>
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-5xl">{getValoracionIcon(entrevista.valoracion.toString())}</span>
                                <p className={`text-4xl font-bold ${getValoracionColor(entrevista.valoracion.toString())}`}>
                                    {entrevista.valoracion}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resumen del Video */}
                {entrevista.videoResumen && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            📝 Resumen de tu Entrevista
                        </h2>
                        <div className="bg-gray-700 rounded-lg p-4">
                            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {entrevista.videoResumen}
                            </p>
                        </div>
                    </div>
                )}

                {/* Feedback del Mentor */}
                {entrevista.feedBack && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            💬 Feedback del Mentor
                        </h2>
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg p-5">
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                                {entrevista.feedBack}
                            </p>
                        </div>
                    </div>
                )}

                {/* Sección del Video */}
                <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        🎥 Video de la Entrevista
                    </h2>
                    
                    {!mostrarVideo ? (
                        <div className="bg-gray-700 rounded-lg p-8 text-center">
                            <div className="mb-4">
                                <div className="inline-block bg-gray-600 rounded-full p-6 mb-4">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-300 mb-2">
                                    El video está listo para ser reproducido
                                </p>
                                <p className="text-gray-500 text-sm mb-6">
                                    Haz clic en el botón para cargar y ver tu entrevista
                                </p>
                            </div>
                            <button
                                onClick={handleMostrarVideo}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                                </svg>
                                Cargar y Reproducir Video
                            </button>
                        </div>
                    ) : (
                        <div className="bg-black rounded-lg overflow-hidden relative">
                            {videoLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                                    <div className="text-white text-lg">Cargando video...</div>
                                </div>
                            )}
                            <video
                                controls
                                className="w-full"
                                onLoadedData={() => setVideoLoading(false)}
                                onError={() => {
                                    setVideoLoading(false);
                                    setError('Error al cargar el video');
                                }}
                            >
                                <source src={entrevista.urlvideo} type="video/mp4" />
                                Tu navegador no soporta la reproducción de videos.
                            </video>
                        </div>
                    )}
                </div>

                {/* Tarjetas informativas adicionales */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-600 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold">Estado</h3>
                        </div>
                        <p className="text-gray-300 ml-11">Evaluación completada</p>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-5 shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-600 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-white font-semibold">Fecha de Evaluación</h3>
                        </div>
                        <p className="text-gray-300 ml-11">{new Date(entrevista.fechaEntrevista).toLocaleDateString('es-ES')}</p>
                    </div>
                </div>

                {/* Mensaje motivacional */}
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-lg p-6 mt-6 text-center">
                    <p className="text-lg">
                        💪 Sigue mejorando y aprendiendo de cada experiencia
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResultadoEntrevista;