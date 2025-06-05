import { useState, useEffect } from "react";

interface TiempoSelectorProps {
  tiempo: number; // tiempo en segundos
  onChange: (tiempo: number) => void;
}

const TiempoSelector = ({ tiempo, onChange }: TiempoSelectorProps) => {
  const [tiempoDisplay, setTiempoDisplay] = useState({
    horas: 0,
    minutos: 1,
    segundos: 0
  });

  // Función para convertir segundos a formato amigable
  const segundosADisplay = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return { horas, minutos, segundos: segs };
  };

  // Función para convertir display a segundos
  const displayASegundos = (horas: number, minutos: number, segundos: number) => {
    return (horas * 3600) + (minutos * 60) + segundos;
  };

  // Función para formatear tiempo para mostrar
  const formatearTiempo = (segundos: number) => {
    const { horas, minutos, segundos: segs } = segundosADisplay(segundos);
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`;
    }
    if (minutos > 0) {
      return `${minutos}m ${segs}s`;
    }
    return `${segs}s`;
  };

  useEffect(() => {
    setTiempoDisplay(segundosADisplay(tiempo));
  }, [tiempo]);

  const handleTiempoChange = (tipo: 'horas' | 'minutos' | 'segundos', valor: number) => {
    // Asegurar que el valor esté en el rango válido
    let valorValido = valor;
    if (tipo === 'horas' && valor < 0) valorValido = 0;
    if (tipo === 'horas' && valor > 23) valorValido = 23;
    if ((tipo === 'minutos' || tipo === 'segundos') && valor < 0) valorValido = 0;
    if ((tipo === 'minutos' || tipo === 'segundos') && valor > 59) valorValido = 59;

    const nuevoTiempo = { ...tiempoDisplay, [tipo]: valorValido };
    setTiempoDisplay(nuevoTiempo);
    
    // Actualizar el tiempo en segundos
    const tiempoEnSegundos = displayASegundos(nuevoTiempo.horas, nuevoTiempo.minutos, nuevoTiempo.segundos);
    onChange(tiempoEnSegundos);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Tiempo de pregunta</label>
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
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
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Segundos</label>
            <input
              type="number"
              value={tiempoDisplay.segundos}
              onChange={(e) => handleTiempoChange('segundos', parseInt(e.target.value) || 0)}
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