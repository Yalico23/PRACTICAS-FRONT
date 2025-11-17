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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import type { ComparacionPromedio, ProgresoMensual, PromedioCalificacion } from "./type";

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
  ArcElement
);

const Progreso = () => {
  const idMentor = localStorage.getItem('usuarioId') || '';
  const token = localStorage.getItem('token') || '';

  const [promedioCalificacion, setPromedioCalificacion] = useState<PromedioCalificacion | null>(null);
  const [comparacionPromedio, setComparacionPromedio] = useState<ComparacionPromedio[]>([]);
  const [progresoMensual, setProgresoMensual] = useState<ProgresoMensual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromedioCalificacion();
    getComparacionPromedio();
    getProgresoMensual();
  }, []);

  const getPromedioCalificacion = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluacionEstudiante/promedioCalificaciones/${idMentor}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setPromedioCalificacion(data);
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

  // Configuración del gráfico de dona (Doughnut)
  const evaluacionesData = {
    labels: progresoMensual.map(p => p.mesAnio),
    datasets: [
      {
        label: 'Evaluaciones Realizadas',
        data: progresoMensual.map(p => p.evaluacionesRealizadas),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(168, 85, 247, 1)',
        ],
        borderWidth: 2
      }
    ]
  };

  const evaluacionesOptions = {
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
        text: 'Distribución de Evaluaciones',
        font: {
          size: 16,
          weight: 'bold' as const
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard de Progreso Académico</h1>
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-blue-600">
                  {promedioCalificacion?.promedioRango.toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {promedioCalificacion?.rangoCalificacion}
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
                  {promedioCalificacion?.cantidad}
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
                <p className="text-gray-500 text-sm mb-1">Tendencia</p>
                <p className="text-3xl font-bold text-purple-600">
                  +{((progresoMensual[progresoMensual.length - 1]?.calificacionPromedio || 0) - 
                     (progresoMensual[0]?.calificacionPromedio || 0)).toFixed(1)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Mejora continua</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de comparación */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Bar data={comparacionData} options={comparacionOptions} />
            </div>
          </div>

          {/* Gráfico de evaluaciones */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div style={{ height: '350px' }}>
              <Doughnut data={evaluacionesData} options={evaluacionesOptions} />
            </div>
          </div>
        </div>

        {/* Gráfico de progreso mensual - ancho completo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div style={{ height: '400px' }}>
            <Line data={progresoData} options={progresoOptions} />
          </div>
        </div>

        {/* Tabla de detalles */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
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