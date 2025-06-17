import type { EvaluacionData } from "../../../../interfaces/interfaces";


interface EvaluacionFormProps {
  evaluacion: EvaluacionData;
  onInputChange: (field: keyof EvaluacionData, value: string) => void;
}

const EvaluacionForm = ({ evaluacion, onInputChange }: EvaluacionFormProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Título de evaluación</label>
        <input
          type="text"
          value={evaluacion.titulo}
          onChange={(e) => onInputChange('titulo', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese el título"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <input
          type="text"
          value={evaluacion.descripcion}
          onChange={(e) => onInputChange('descripcion', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese la descripción"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tecnología</label>
        <input
          type="text"
          value={evaluacion.tags}
          onChange={(e) => onInputChange('tags', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese las tecnologías"
        />
      </div>
    </div>
  );
};

export default EvaluacionForm;