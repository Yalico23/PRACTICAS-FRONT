import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TopEntrevistas {
  nombre: string;
  apellidos: string;
  email: string;
  estudianteId: number;
  totalSesiones: number;
  sesionesCompletadas: number;
}

interface ResumenEvaluaciones {
  descripcion: string;
  evaluacion: string;
  calificacionPromedio: number;
  calificacionMinima: number;
  calificacionMaxima: number;
  totalEstudiantesAsignados: number;
  completados: number;
}

interface MejorPeorDesempeno {
  nombre: string;
  apellidos: string;
  email: string;
  evaluacionesRealizadas: number;
  calificacionPromedio: number;
  evaluacionesCompletadas: number;
}

const ResultadosMentor = () => {
  const token = localStorage.getItem("token") || "";
  const userId = localStorage.getItem("usuarioId") || "";

  const [topEntrevistas, setTopEntrevistas] = useState<TopEntrevistas[]>([]);
  const [resumenEvaluaciones, setResumenEvaluaciones] = useState<ResumenEvaluaciones[]>([]);
  const [mejorPeorDesempeno, setMejorPeorDesempeno] = useState<MejorPeorDesempeno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      getTopEntrevistas(),
      getResumenEvaluaciones(),
      getMejorPeorDesempeno()
    ]);
    setLoading(false);
  };

  const getTopEntrevistas = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/topEntrveistaEstudiantes/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTopEntrevistas(data);
    } catch (error) {
      console.error("Error al obtener las top entrevistas:", error);
    }
  };

  const getResumenEvaluaciones = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/ResumenEvaluacionMentor/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setResumenEvaluaciones(data);
    } catch (error) {
      console.error("Error al obtener el resumen de evaluaciones:", error);
    }
  };

  const getMejorPeorDesempeno = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/mejorPeorDesempeno/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMejorPeorDesempeno(data);
    } catch (error) {
      console.error("Error al obtener el mejor y peor desempeño:", error);
    }
  };

  // Gráfico de Resumen de Evaluaciones (Bar Chart con múltiples datasets)
  const resumenEvaluacionesData = {
    labels: resumenEvaluaciones.map(r => r.evaluacion),
    datasets: [
      {
        label: 'Promedio',
        data: resumenEvaluaciones.map(r => r.calificacionPromedio),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Máxima',
        data: resumenEvaluaciones.map(r => r.calificacionMaxima),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: 'Mínima',
        data: resumenEvaluaciones.map(r => r.calificacionMinima),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }
    ]
  };

  const resumenEvaluacionesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Resumen de Evaluaciones por Tipo',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: { stepSize: 2 }
      }
    }
  };

  // Gráfico de Progreso de Completitud (Doughnut)
  const completitudData = {
    labels: resumenEvaluaciones.map(r => r.evaluacion),
    datasets: [
      {
        label: 'Completados',
        data: resumenEvaluaciones.map(r => r.completados),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(20, 184, 166, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const completitudOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { font: { size: 11 } }
      },
      title: {
        display: true,
        text: 'Evaluaciones Completadas por Tipo',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    }
  };

  // Gráfico de Barras Horizontal - Desempeño de Estudiantes
  const desempenoData = {
    labels: mejorPeorDesempeno.map(m => `${m.nombre} ${m.apellidos.split(' ')[0]}`),
    datasets: [
      {
        label: 'Calificación Promedio',
        data: mejorPeorDesempeno.map(m => m.calificacionPromedio),
        backgroundColor: mejorPeorDesempeno.map((_, idx) => {
          if (idx === 0) return 'rgba(34, 197, 94, 0.8)'; // Verde para el mejor
          if (idx === mejorPeorDesempeno.length - 1 && mejorPeorDesempeno.length > 1) return 'rgba(239, 68, 68, 0.8)'; // Rojo para el último
          return 'rgba(59, 130, 246, 0.8)'; // Azul para los demás
        }),
        borderColor: mejorPeorDesempeno.map((_, idx) => {
          if (idx === 0) return 'rgba(34, 197, 94, 1)';
          if (idx === mejorPeorDesempeno.length - 1 && mejorPeorDesempeno.length > 1) return 'rgba(239, 68, 68, 1)';
          return 'rgba(59, 130, 246, 1)';
        }),
        borderWidth: 2
      }
    ]
  };

  const desempenoOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Ranking de Calificaciones por Estudiante',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 20,
        ticks: { stepSize: 2 }
      }
    }
  };

  // Calcular estadísticas generales
  const totalEstudiantes = mejorPeorDesempeno.length;
  const promedioGeneral = mejorPeorDesempeno.length > 0
    ? (mejorPeorDesempeno.reduce((sum, est) => sum + est.calificacionPromedio, 0) / mejorPeorDesempeno.length).toFixed(1)
    : '0';
  const totalEvaluacionesCompletadas = resumenEvaluaciones.reduce((sum, ev) => sum + ev.completados, 0);
  const totalEntrevistasCompletadas = topEntrevistas.reduce((sum, ent) => sum + ent.sesionesCompletadas, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del mentor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard de Resultados - Mentor</h1>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Estudiantes</p>
                <p className="text-3xl font-bold text-blue-600">{totalEstudiantes}</p>
                <p className="text-sm text-gray-600 mt-1">Bajo tu mentoría</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-green-600">{promedioGeneral}</p>
                <p className="text-sm text-gray-600 mt-1">De tus estudiantes</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Evaluaciones</p>
                <p className="text-3xl font-bold text-purple-600">{totalEvaluacionesCompletadas}</p>
                <p className="text-sm text-gray-600 mt-1">Completadas</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Entrevistas</p>
                <p className="text-3xl font-bold text-orange-600">{totalEntrevistasCompletadas}</p>
                <p className="text-sm text-gray-600 mt-1">Realizadas</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Resumen de Evaluaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={resumenEvaluacionesData} options={resumenEvaluacionesOptions} />
            </div>
          </div>

          {/* Gráfico de Completitud */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Doughnut data={completitudData} options={completitudOptions} />
            </div>
          </div>
        </div>

        {/* Gráfico de Barras Horizontal de Desempeño */}
        {mejorPeorDesempeno.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div style={{ height: '400px' }}>
              <Bar data={desempenoData} options={desempenoOptions} />
            </div>
          </div>
        )}

        {/* Tabla de Top Entrevistas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Top Estudiantes - Entrevistas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sesiones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topEntrevistas.map((ent, index) => {
                  const progreso = ent.totalSesiones > 0 
                    ? ((ent.sesionesCompletadas / ent.totalSesiones) * 100).toFixed(0)
                    : '0';
                  return (
                    <tr key={ent.estudianteId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ent.nombre} {ent.apellidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {ent.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {ent.totalSesiones}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <span className="font-semibold text-green-600">{ent.sesionesCompletadas}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${progreso}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{progreso}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Resumen de Evaluaciones Detallado */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen Detallado de Evaluaciones</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evaluación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completados</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min - Max</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumenEvaluaciones.map((evaluacion, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {evaluacion.evaluacion}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {evaluacion.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {evaluacion.totalEstudiantesAsignados}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="font-semibold text-green-600">{evaluacion.completados}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span className="font-bold text-blue-600">{evaluacion.calificacionPromedio.toFixed(1)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <span className="text-red-600">{evaluacion.calificacionMinima}</span>
                      {' - '}
                      <span className="text-green-600">{evaluacion.calificacionMaxima}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla de Mejor y Peor Desempeño */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis de Desempeño Estudiantil</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posición</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eval. Realizadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mejorPeorDesempeno.map((est, index) => {
                  const esMejor = index === 0;
                  const esPeor = index === mejorPeorDesempeno.length - 1 && mejorPeorDesempeno.length > 1;
                  return (
                    <tr key={index} className={`hover:bg-gray-50 ${esMejor ? 'bg-green-50' : esPeor ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {esMejor && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            🏆 Mejor
                          </span>
                        )}
                        {esPeor && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠️ Necesita apoyo
                          </span>
                        )}
                        {!esMejor && !esPeor && (
                          <span className="text-gray-500">#{index + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {est.nombre} {est.apellidos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {est.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {est.evaluacionesRealizadas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className="font-semibold text-blue-600">{est.evaluacionesCompletadas}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`font-bold text-lg ${
                          est.calificacionPromedio >= 18 ? 'text-green-600' :
                          est.calificacionPromedio >= 14 ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {est.calificacionPromedio.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultadosMentor;