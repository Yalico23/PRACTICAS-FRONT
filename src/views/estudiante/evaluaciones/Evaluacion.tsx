import { Opcion } from "../../../components/Opcion";
import { useState, useEffect } from 'react';

const PreguntaEjemplo = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number>(100);

  const opciones = [
    { id: 'a', texto: 'Ejecuta una consulta SQL' },
    { id: 'b', texto: 'Envía una petición HTTP y devuelve una promesa' },
    { id: 'c', texto: 'Ejecuta una consulta SQL' },
    { id: 'd', texto: 'Ejecuta una consulta SQL' }
  ];

  // Efecto de cuenta regresiva
  useEffect(() => {
    if (tiempoRestante <= 0) return;

    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [tiempoRestante]);

  // Formateo de segundos a mm:ss
  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="my-4 mt-14 flex gap-5 p-4 max-w-2xl mx-auto items-center justify-between">
        <h2 className="text-3xl font-bold">JavaScript Ajax - Fecth</h2>
        <p>⏰ {formatearTiempo(tiempoRestante)}</p>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium">¿Qué hace el método fetch en JavaScript?</p>
          <span className="px-2 py-1 border border-slate-900 rounded-lg">0/20</span>
        </div>
        <div>
          {opciones.map((opcion) => (
            <Opcion
              key={opcion.id}
              isSelected={opcionSeleccionada === opcion.id}
              onClick={() => setOpcionSeleccionada(opcion.id)}
            >
              <span className="font-black">{opcion.id}&#41;</span> {opcion.texto}
            </Opcion>
          ))}
        </div>

        {opcionSeleccionada && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800">
              Opción seleccionada: <strong>{opcionSeleccionada.toUpperCase()}</strong>
            </p>
          </div>
        )}

        <div className="mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            onClick={() => alert('Respuesta enviada')}
          >
            Enviar respuesta
          </button>
        </div>
      </div>
    </>
  );
};

export default PreguntaEjemplo;