import type { OpcionRespuesta } from "../../../../interfaces/interfaces";
import { motion, AnimatePresence } from 'framer-motion';


interface OpcionesRespuestaProps {
  opciones: OpcionRespuesta[];
  onChange: (opciones: OpcionRespuesta[]) => void;
}

const OpcionesRespuesta = ({ opciones, onChange }: OpcionesRespuestaProps) => {
  const addOpcion = () => {
    const nuevasOpciones = [...opciones, { opcionRespuesta: "", correcta: false }];
    onChange(nuevasOpciones);
  };

  const updateOpcion = (index: number, field: keyof OpcionRespuesta, value: string | boolean) => {
    const nuevasOpciones = opciones.map((opcion, i) =>
      i === index ? { ...opcion, [field]: value } : opcion
    );
    onChange(nuevasOpciones);
  };

  const removeOpcion = (index: number) => {
    const nuevasOpciones = opciones.filter((_, i) => i !== index);
    onChange(nuevasOpciones);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium">Opciones de Respuesta</label>
        <button
          onClick={addOpcion}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Agregar
        </button>
      </div>

      <div className="space-y-2">
        {opciones.map((opcion, index) => (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 100 }} // empieza desplazado a la derecha
              animate={{ opacity: 1, scale: 1, x: 0 }}     // se posiciona en su lugar
              exit={{ opacity: 0, scale: 0.9, x: 100 }}    // al salir vuelve a la derecha
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                <input
                  type="text"
                  value={opcion.opcionRespuesta}
                  onChange={(e) => updateOpcion(index, 'opcionRespuesta', e.target.value)}
                  className="flex-1 p-1 border border-gray-300 rounded"
                  placeholder="Opción de respuesta"
                />
                <label className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={opcion.correcta}
                    onChange={(e) => updateOpcion(index, 'correcta', e.target.checked)}
                  />
                  <span className="text-sm">Correcta</span>
                </label>
                <button
                  onClick={() => removeOpcion(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}

        {opciones.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No hay opciones agregadas. Haz clic en "Agregar" para crear una opción.
          </div>
        )}
      </div>
    </div>
  );
};

export default OpcionesRespuesta;