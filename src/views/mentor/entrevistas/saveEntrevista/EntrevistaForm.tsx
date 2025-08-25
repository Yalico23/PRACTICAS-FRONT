import type { EntrevistaData } from "./types"


interface EntrevistaFormProps {
  entrevista: EntrevistaData;
  onInputChange: (field: keyof EntrevistaData, value: string) => void;
}

const EntrevistaForm = ({entrevista, onInputChange}: EntrevistaFormProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm mb-1 text-[#E9ECEF]">
          Titulo de la entrevista
        </label>
        <input
          type="text"
          placeholder="Ingrese el título"
          className="w-full p-2 border border-gray-300 rounded"
          value={entrevista.titulo}
          onChange={(e) => onInputChange("titulo", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1 text-[#E9ECEF]">Descripción</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Ingrese la descripción"
          value={entrevista.descripcion}
          onChange={(e) => onInputChange("descripcion", e.target.value)}
        />
      </div>
    </div>
  )
}

export default EntrevistaForm