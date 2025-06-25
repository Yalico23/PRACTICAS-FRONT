import type { EvaluacionData } from "../../../../interfaces/interfaces";
import { dataTecnologias } from "./Helper";

interface EvaluacionFormProps {
  evaluacion: EvaluacionData;
  onInputChange: (field: keyof EvaluacionData, value: string) => void;
}

const EvaluacionForm = ({ evaluacion, onInputChange }: EvaluacionFormProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm  mb-1 text-[#E9ECEF]">Título de evaluación</label>
        <input
          type="text"
          value={evaluacion.titulo}
          onChange={(e) => onInputChange('titulo', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese el título"
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-[#E9ECEF]">Descripción</label>
        <input
          type="text"
          value={evaluacion.descripcion}
          onChange={(e) => onInputChange('descripcion', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese la descripción"
        />
      </div>

      <div>
        <label className="text-[#E9ECEF] mb-1">Tecnología</label>
        <select
          value={evaluacion.tags}
          onChange={(e) => onInputChange('tags', e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="" disabled>-- Selecciona Una tecnologia ---</option>
          {dataTecnologias
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((tech) => (
            <option key={tech.value} value={tech.value}>
              {tech.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default EvaluacionForm;