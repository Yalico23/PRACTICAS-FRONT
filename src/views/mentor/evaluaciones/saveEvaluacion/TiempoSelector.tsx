import { useState, useEffect } from "react";

interface TiempoSelectorProps {
  tiempo: number; // tiempo en minutos
  onChange: (tiempo: number) => void;
}

const TiempoSelector = ({ tiempo, onChange }: TiempoSelectorProps) => {
  const [tiempoDisplay, setTiempoDisplay] = useState({
    horas: 0,
    minutos: 1
  });

  // Función para convertir minutos a formato amigable
  const minutosADisplay = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return { horas, minutos: mins };
  };

  // Función para convertir display a minutos
  const displayAMinutos = (horas: number, minutos: number) => {
    return (horas * 60) + minutos;
  };

  // Función para formatear tiempo para mostrar
  const formatearTiempo = (minutos: number) => {
    const { horas, minutos: mins } = minutosADisplay(minutos);
    if (horas > 0) {
      return `${horas}h ${mins}m`;
    }
    return `${mins}m`;
  };

  useEffect(() => {
    setTiempoDisplay(minutosADisplay(tiempo));
  }, [tiempo]);

  const handleTiempoChange = (tipo: 'horas' | 'minutos', valor: number) => {
    // Asegurar que el valor esté en el rango válido
    let valorValido = valor;
    if (tipo === 'horas' && valor < 0) valorValido = 0;
    if (tipo === 'horas' && valor > 23) valorValido = 23;
    if (tipo === 'minutos' && valor < 0) valorValido = 0;
    if (tipo === 'minutos' && valor > 59) valorValido = 59;

    const nuevoTiempo = { ...tiempoDisplay, [tipo]: valorValido };
    setTiempoDisplay(nuevoTiempo);
    
    // Actualizar el tiempo en minutos
    const tiempoEnMinutos = displayAMinutos(nuevoTiempo.horas, nuevoTiempo.minutos);
    onChange(tiempoEnMinutos);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Tiempo de pregunta</label>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Horas</label>
            <input
              type="number"
              value={tiempoDisplay.horas}
              onChange={(e) => handleTiempoChange('horas', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded text-center"
              min="0"
              max="23"
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Minutos</label>
            <input
              type="number"
              value={tiempoDisplay.minutos}
              onChange={(e) => handleTiempoChange('minutos', parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded text-center"
              min="0"
              max="59"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="text-sm text-gray-500 text-center">
          Total: {formatearTiempo(tiempo)}
        </div>
      </div>
    </div>
  );
};

export default TiempoSelector;