import type { Pregunta } from "../../../../interfaces/interfaces";


interface PreguntasListProps {
  preguntas: Pregunta[];
  onAddPregunta: () => void;
  onEditPregunta: (index: number) => void;
  onRemovePregunta: (index: number) => void;
}

const PreguntasList = ({ preguntas, onAddPregunta, onEditPregunta, onRemovePregunta }: PreguntasListProps) => {
  // Función para formatear tiempo para mostrar
  const formatearTiempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  return (
    <div className="border border-gray-300 rounded p-4 mb-6">
      <div className="flex items-center mb-4">
        <button
          onClick={onAddPregunta}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <span className="text-xl">+</span>
          Crear Ítem de pregunta
        </button>
      </div>

      <div className="space-y-2">
        {preguntas.map((pregunta, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
            <div className="flex-1">
              <span className="font-medium">{pregunta.pregunta}</span>
              <span className="ml-2 text-sm text-[#E9ECEF]">
                ({pregunta.tipoPregunta} - {formatearTiempo(pregunta.tiempo)} - {pregunta.valor} pts)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEditPregunta(index)}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Editar
              </button>
              <button
                onClick={() => onRemovePregunta(index)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreguntasList;