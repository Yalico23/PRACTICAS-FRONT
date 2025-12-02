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
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface CompararMentores {
  evaluacionesConMentor: number;
  calificacionMaxima: number;
  calificacionMinima: number;
  calificacionPromedio: number;
  mentorNombre: string;
  mentorApellidos: string;
}

interface ComparacionPromedio {
  evaluacion: string;
  miCalificacion: number;
  calificacionPromedioGeneral: number;
  diferenciaConPromedio: number;
  posicionRelativa: string;
}

interface ProgresoMensual {
  mesAnio: string;
  calificacionPromedio: number;
  calificacionMaxima: number;
  calificacionMinima: number;
  evaluacionesRealizadas: number;
}

const Progreso = () => {
  const idMentor = localStorage.getItem('usuarioId') || '';
  const token = localStorage.getItem('token') || '';

  const [compararMentores, setCompararMentores] = useState<CompararMentores[]>([]);
  const [comparacionPromedio, setComparacionPromedio] = useState<ComparacionPromedio[]>([]);
  const [progresoMensual, setProgresoMensual] = useState<ProgresoMensual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompararMentores();
    getComparacionPromedio();
    getProgresoMensual();
  }, []);

  const getCompararMentores = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/comparacionMentores/${idMentor}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setCompararMentores(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getComparacionPromedio = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/ComparacionPromedioCalificaciones/${idMentor}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setComparacionPromedio(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProgresoMensual = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/ProgresoMensualEstdudiante/${idMentor}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setProgresoMensual(data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Calcular estadísticas generales
  const totalEvaluaciones = compararMentores.reduce((sum, m) => sum + m.evaluacionesConMentor, 0);
  const promedioGeneral = compararMentores.length > 0
    ? compararMentores.reduce((sum, m) => sum + m.calificacionPromedio, 0) / compararMentores.length
    : 0;
  const mejorMentor = compararMentores.length > 0
    ? compararMentores.reduce((prev, current) => 
        prev.calificacionPromedio > current.calificacionPromedio ? prev : current
      )
    : null;

  // Gráfico de barras: Promedio por mentor
  const mentoresPromedioData = {
    labels: compararMentores.map(m => `${m.mentorNombre} ${m.mentorApellidos}`),
    datasets: [
      {
        label: 'Calificación Promedio',
        data: compararMentores.map(m => m.calificacionPromedio),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }
    ]
  };

  const mentoresPromedioOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Promedio de Calificaciones por Mentor',
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
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  // Gráfico de dona: Distribución de evaluaciones por mentor
  const evaluacionesPorMentorData = {
    labels: compararMentores.map(m => `${m.mentorNombre} ${m.mentorApellidos}`),
    datasets: [
      {
        label: 'Evaluaciones',
        data: compararMentores.map(m => m.evaluacionesConMentor),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 2
      }
    ]
  };

  const evaluacionesPorMentorOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Distribución de Evaluaciones por Mentor',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    }
  };

  const rangoCalificacionesData = {
    labels: compararMentores.map(m => `${m.mentorNombre} ${m.mentorApellidos}`),
    datasets: [
      {
        label: 'Máxima',
        data: compararMentores.map(m => m.calificacionMaxima),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: 'Promedio',
        data: compararMentores.map(m => m.calificacionPromedio),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Mínima',
        data: compararMentores.map(m => m.calificacionMinima),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      }
    ]
  };

  const rangoCalificacionesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Rango de Calificaciones por Mentor',
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
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  // Configuración del gráfico de comparación (Bar Chart)
  const comparacionData = {
    labels: comparacionPromedio.map(c => c.evaluacion),
    datasets: [
      {
        label: 'Mi Calificación',
        data: comparacionPromedio.map(c => c.miCalificacion),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      },
      {
        label: 'Promedio General',
        data: comparacionPromedio.map(c => c.calificacionPromedioGeneral),
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 2
      }
    ]
  };

  const comparacionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Comparación de Calificaciones',
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
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  // Configuración del gráfico de progreso mensual (Line Chart)
  const progresoData = {
    labels: progresoMensual.map(p => p.mesAnio),
    datasets: [
      {
        label: 'Promedio',
        data: progresoMensual.map(p => p.calificacionPromedio),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Máxima',
        data: progresoMensual.map(p => p.calificacionMaxima),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        borderDash: [5, 5]
      },
      {
        label: 'Mínima',
        data: progresoMensual.map(p => p.calificacionMinima),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        borderDash: [5, 5]
      }
    ]
  };

  const progresoOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Progreso Mensual',
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
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard de Comparación de Mentores</h1>
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-blue-600">
                  {promedioGeneral.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Con todos los mentores
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Evaluaciones</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalEvaluaciones}
                </p>
                <p className="text-sm text-gray-600 mt-1">Completadas</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Mejor Mentor</p>
                <p className="text-xl font-bold text-purple-600">
                  {mejorMentor ? `${mejorMentor.mentorNombre}` : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Promedio: {mejorMentor?.calificacionPromedio.toFixed(1) || 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos principales - Comparación de mentores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de promedio por mentor */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={mentoresPromedioData} options={mentoresPromedioOptions} />
            </div>
          </div>

          {/* Gráfico de distribución de evaluaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Doughnut data={evaluacionesPorMentorData} options={evaluacionesPorMentorOptions} />
            </div>
          </div>
        </div>

        {/* Gráficos de análisis detallado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de rango de calificaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={rangoCalificacionesData} options={rangoCalificacionesOptions} />
            </div>
          </div>
        </div>

        {/* Gráficos adicionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de comparación con promedio general */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={comparacionData} options={comparacionOptions} />
            </div>
          </div>

          {/* Tabla de estadísticas por mentor */}
          <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Estadísticas por Mentor</h2>
            <div className="space-y-3">
              {compararMentores.map((mentor, index) => (
                <div key={index} className="border-b pb-3">
                  <p className="font-semibold text-gray-800 mb-2">
                    {mentor.mentorNombre} {mentor.mentorApellidos}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Evaluaciones:</span>
                      <span className="ml-2 font-medium">{mentor.evaluacionesConMentor}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Promedio:</span>
                      <span className="ml-2 font-medium text-blue-600">{mentor.calificacionPromedio.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Máxima:</span>
                      <span className="ml-2 font-medium text-green-600">{mentor.calificacionMaxima}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Mínima:</span>
                      <span className="ml-2 font-medium text-red-600">{mentor.calificacionMinima}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de progreso mensual - ancho completo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div style={{ height: '400px' }}>
            <Line data={progresoData} options={progresoOptions} />
          </div>
        </div>

        {/* Tabla de detalles por evaluación */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Detalle por Evaluación</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Evaluación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mi Nota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Promedio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Diferencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Posición
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparacionPromedio.map((comp, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {comp.evaluacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-blue-600">{comp.miCalificacion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {comp.calificacionPromedioGeneral}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-semibold ${comp.diferenciaConPromedio > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comp.diferenciaConPromedio > 0 ? '+' : ''}{comp.diferenciaConPromedio.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        comp.posicionRelativa === 'Superior' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comp.posicionRelativa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progreso;