import { useState, useEffect } from "react";

import TiempoSelector from "./TiempoSelector";
import OpcionesRespuesta from "./OpcionesRespuesta";
import type { OpcionRespuesta, Pregunta } from "../../../../interfaces/interfaces";
import Swal from "sweetalert2";

interface PreguntaModalProps {
  pregunta?: Pregunta;
  isEditing: boolean;
  onSave: (pregunta: Pregunta) => void;
  onClose: () => void;
}

const PreguntaModal = ({ pregunta, isEditing, onSave, onClose }: PreguntaModalProps) => {
  const [currentPregunta, setCurrentPregunta] = useState<Pregunta>({
    pregunta: "",
    tipoPregunta: "texto",
    tiempo: 60,
    valor: 1,
    opcionRespuestas: []
  });

  useEffect(() => {
    if (pregunta) {
      setCurrentPregunta({ ...pregunta });
    }
  }, [pregunta]);

  const handlePreguntaChange = (field: keyof Pregunta, value: string | number) => {
    setCurrentPregunta(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'tipoPregunta' && value === 'texto' ? { opcionRespuestas: [] } : {})
    }));
  };

  const handleTiempoChange = (tiempo: number) => {
    setCurrentPregunta(prev => ({ ...prev, tiempo }));
  };

  const handleOpcionesChange = (opciones: OpcionRespuesta[]) => {
    setCurrentPregunta(prev => ({ ...prev, opcionRespuestas: opciones }));
  };

  const showMessageModasl = (message: string, tipo: 'success' | 'error' | 'warning' | 'info' | 'question') => {
      Swal.fire({
        title: tipo === 'success' ? 'Éxito' : 'Error',
        text: message,
        icon: tipo,
        confirmButtonText: 'Aceptar'
      });
    }

  const savePregunta = () => {
    if (!currentPregunta.pregunta.trim()) {
      showMessageModasl("El campo 'Problema de ítem' es obligatorio.", 'warning');
      return;
    }

    const preguntaToSave = { ...currentPregunta };
    if (preguntaToSave.tipoPregunta === 'texto') {
      delete preguntaToSave.opcionRespuestas;
    }

    onSave(preguntaToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Editar Pregunta' : 'Crear Ítem de pregunta'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Problema de ítem</label>
            <input
              type="text"
              value={currentPregunta.pregunta}
              onChange={(e) => handlePreguntaChange('pregunta', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Ingrese la pregunta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo de ítem</label>
            <select
              value={currentPregunta.tipoPregunta}
              onChange={(e) => handlePreguntaChange('tipoPregunta', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="texto">Texto</option>
              <option value="opcion">Opción múltiple</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Número de Puntos</label>
            <input
              type="number"
              value={currentPregunta.valor}
              onChange={(e) => handlePreguntaChange('valor', parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>

          <TiempoSelector 
            tiempo={currentPregunta.tiempo}
            onChange={handleTiempoChange}
          />

          {currentPregunta.tipoPregunta === 'opcion' && (
            <OpcionesRespuesta
              opciones={currentPregunta.opcionRespuestas || []}
              onChange={handleOpcionesChange}
            />
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={savePregunta}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isEditing ? 'Actualizar' : 'Agregar'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreguntaModal;