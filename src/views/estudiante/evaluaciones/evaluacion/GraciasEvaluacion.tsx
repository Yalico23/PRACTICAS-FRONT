import { CheckCircle, BookOpen, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GraciasEvaluacionProps {
  tituloEvaluacion?: string;
  nombreEstudiante?: string;
  totalPreguntas?: number;
  preguntasRespondidas?: number;
}

const GraciasEvaluacion = ({
  tituloEvaluacion = "Evaluación",
  nombreEstudiante = "Estudiante",
  totalPreguntas = 10,
  preguntasRespondidas = 10
} : GraciasEvaluacionProps) => {

  const Navigate = useNavigate();

  const porcentajeCompletado = Math.round((preguntasRespondidas / totalPreguntas) * 100);

  const onVolver = () => {
    Navigate('/estudiante/evaluaciones');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¡Evaluación Completada!
            </h1>
            <p className="text-blue-100 text-lg">
              Gracias por tu participación
            </p>
          </div>

          {/* Contenido principal */}
          <div className="px-8 py-10">
            {/* Mensaje personalizado */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-3">
                Estimado/a {nombreEstudiante}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                Has completado exitosamente la evaluación <strong>"{tituloEvaluacion}"</strong>. 
                Tus respuestas han sido registradas correctamente y serán revisadas por tu instructor.
              </p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex justify-center mb-3">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  {preguntasRespondidas}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  Preguntas Respondidas
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex justify-center mb-3">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {porcentajeCompletado}%
                </div>
                <div className="text-sm text-blue-600 font-medium">
                  Completado
                </div>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div className="flex justify-center mb-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-700 mb-1">
                  {totalPreguntas}
                </div>
                <div className="text-sm text-purple-600 font-medium">
                  Total de Preguntas
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progreso de la evaluación</span>
                <span className="text-sm font-bold text-indigo-600">{porcentajeCompletado}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${porcentajeCompletado}%` }}
                ></div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 mb-8 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                ¿Qué sucede ahora?
              </h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Tu instructor revisará tus respuestas
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Recibirás retroalimentación en los próximos días
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Los resultados serán registrados en tu expediente académico
                </li>
              </ul>
            </div>

            {/* Botón de acción */}
            <div className="text-center">
              <button
                onClick={onVolver}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            © 2025 Sistema de Evaluaciones Académicas ZonaTech Peru
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraciasEvaluacion;