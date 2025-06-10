import {useState} from 'react'
import {useEffect, useRef, useCallback} from 'react';
import {Opcion} from '../../../../components/Opcion';

const PreguntaEjemplo = () => {
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<string | null>(null);
  const [tiempoRestante, setTiempoRestante] = useState<number>(100);
  const [intentosTrampa, setIntentosTrampa] = useState<number>(0);
  const [evaluacionBloqueada, setEvaluacionBloqueada] = useState<boolean>(false);
  const [alertasActividad, setAlertasActividad] = useState<string[]>([]);
  const [tiempoInicio] = useState<number>(Date.now());
  const [tiempoFueraVentana, setTiempoFueraVentana] = useState<number>(0);
  const [estaEnPantallaCompleta, setEstaEnPantallaCompleta] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tiempoSalidaRef = useRef<number | null>(null);

  const opciones = [
    { id: 'a', texto: 'Ejecuta una consulta SQL' },
    { id: 'b', texto: 'Envía una petición HTTP y devuelve una promesa' },
    { id: 'c', texto: 'Ejecuta una consulta SQL' },
    { id: 'd', texto: 'Ejecuta una consulta SQL' }
  ];

  const MAX_INTENTOS_TRAMPA = 5;
  const MAX_TIEMPO_FUERA = 3000000000; // segundos

  // Agregar alerta de actividad sospechosa
  const agregarAlerta = useCallback((mensaje: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAlertasActividad(prev => [...prev, `${timestamp}: ${mensaje}`]);
    setIntentosTrampa(prev => {
      const nuevosIntentos = prev + 1;
      if (nuevosIntentos >= MAX_INTENTOS_TRAMPA) {
        setEvaluacionBloqueada(true);
      }
      return nuevosIntentos;
    });
  }, []);

  // Detectar cambio de ventana/pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (evaluacionBloqueada) return;
      
      if (document.hidden) {
        tiempoSalidaRef.current = Date.now();
        agregarAlerta('Cambió de ventana o pestaña');
      } else if (tiempoSalidaRef.current) {
        const tiempoFuera = Math.floor((Date.now() - tiempoSalidaRef.current) / 1000);
        setTiempoFueraVentana(prev => prev + tiempoFuera);
        
        if (tiempoFuera > 5) {
          agregarAlerta(`Estuvo ${tiempoFuera}s fuera de la ventana`);
        }
        tiempoSalidaRef.current = null;
      }
    };

    const handleFocus = () => {
      if (!evaluacionBloqueada && tiempoSalidaRef.current) {
        const tiempoFuera = Math.floor((Date.now() - tiempoSalidaRef.current) / 1000);
        if (tiempoFuera > 3) {
          agregarAlerta('Regresó a la ventana después de estar ausente');
        }
      }
    };

    const handleBlur = () => {
      if (!evaluacionBloqueada) {
        tiempoSalidaRef.current = Date.now();
        agregarAlerta('Perdió el foco de la ventana');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [evaluacionBloqueada, agregarAlerta]);

  // Detectar teclas sospechosas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (evaluacionBloqueada) return;

      const teclasProhibidas = [
        'F12', // DevTools
        'F5',  // Refresh
        'Tab', // Cambio de ventana con Alt+Tab
      ];

      // Detectar combinaciones peligrosas
      if (
        (e.ctrlKey && (e.key === 'r' || e.key === 'R')) || // Ctrl+R (refresh)
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) || // Ctrl+U (view source)
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) || // Ctrl+Shift+I (DevTools)
        (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) || // Ctrl+Shift+J (Console)
        (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) || // Ctrl+Shift+C (Inspector)
        (e.altKey && e.key === 'Tab') || // Alt+Tab
        teclasProhibidas.includes(e.key)
      ) {
        e.preventDefault();
        agregarAlerta(`Tecla prohibida detectada: ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [evaluacionBloqueada, agregarAlerta]);

  // Detectar clic derecho
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      if (!evaluacionBloqueada) {
        e.preventDefault();
        agregarAlerta('Intentó abrir menú contextual (clic derecho)');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, [evaluacionBloqueada, agregarAlerta]);

  // Pantalla completa
  useEffect(() => {
    const solicitarPantallaCompleta = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setEstaEnPantallaCompleta(true);
      } catch (error) {
        agregarAlerta('No se pudo activar pantalla completa');
      }
    };

    const handleFullscreenChange = () => {
      const enPantallaCompleta = !!document.fullscreenElement;
      setEstaEnPantallaCompleta(enPantallaCompleta);
      
      if (!enPantallaCompleta && !evaluacionBloqueada) {
        agregarAlerta('Salió de pantalla completa');
      }
    };

    // Solicitar pantalla completa al iniciar
    solicitarPantallaCompleta();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [agregarAlerta, evaluacionBloqueada]);

  // Detectar herramientas de desarrollador
  useEffect(() => {
    let devtools = {open: false, orientation: null};
    const threshold = 160;

    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          agregarAlerta('Herramientas de desarrollador detectadas');
        }
      } else {
        devtools.open = false;
      }
    };

    const interval = setInterval(checkDevTools, 500);
    return () => clearInterval(interval);
  }, [agregarAlerta]);

  // Cuenta regresiva
  useEffect(() => {
    if (tiempoRestante <= 0 || evaluacionBloqueada) return;

    intervalRef.current = setInterval(() => {
      setTiempoRestante((prev) => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tiempoRestante, evaluacionBloqueada]);

  // Limpiar interval al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  const handleEnviarRespuesta = () => {
    const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);
    const reporte = {
      respuesta: opcionSeleccionada,
      tiempoTotal,
      tiempoFueraVentana,
      intentosTrampa,
      alertas: alertasActividad,
      bloqueada: evaluacionBloqueada
    };
    
    console.log('Reporte de evaluación:', reporte);
    alert(`Respuesta enviada. Intentos de trampa: ${intentosTrampa}`);
  };

  // Si está bloqueada, mostrar mensaje de error
  if (evaluacionBloqueada) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Evaluación Bloqueada</h2>
          <p className="text-gray-700 mb-4">
            Se detectaron demasiados intentos de trampa ({intentosTrampa}/{MAX_INTENTOS_TRAMPA}).
          </p>
          <p className="text-sm text-gray-500">
            Contacte al administrador para desbloquear la evaluación.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Advertencia de monitoreo */}
      <div className="bg-yellow-200 border-l-4 border-yellow-500 p-4 mb-4">
        <div className="flex items-center">
          <div className="text-yellow-800">
            <strong>⚠️ Evaluación Monitoreada:</strong> Esta sesión está siendo supervisada. 
            Cualquier intento de trampa será registrado.
          </div>
        </div>
      </div>

      {/* Header con tiempo y alertas */}
      <div className="my-4 mt-14 flex gap-5 p-4 max-w-2xl mx-auto items-center justify-between">
        <h2 className="text-3xl font-bold">JavaScript Ajax - Fetch</h2>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-lg ${intentosTrampa > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            Alertas: {intentosTrampa}/{MAX_INTENTOS_TRAMPA}
          </div>
          <p className="text-lg font-mono">⏰ {formatearTiempo(tiempoRestante)}</p>
        </div>
      </div>

      {/* Estado de seguridad */}
      <div className="p-4 max-w-2xl mx-auto mb-4">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className={`p-2 rounded ${estaEnPantallaCompleta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Pantalla: {estaEnPantallaCompleta ? '✅ Completa' : '❌ Normal'}
          </div>
          <div className={`p-2 rounded ${tiempoFueraVentana < MAX_TIEMPO_FUERA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Tiempo fuera: {tiempoFueraVentana}s
          </div>
          <div className={`p-2 rounded ${!document.hidden ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Ventana: {!document.hidden ? '👁️ Activa' : '👁️‍🗨️ Oculta'}
          </div>
        </div>
      </div>

      {/* Pregunta principal */}
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium">¿Qué hace el método fetch en JavaScript?</p>
          <span className="px-2 py-1 border border-slate-900 rounded-lg">1/20</span>
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
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            onClick={handleEnviarRespuesta}
            disabled={!opcionSeleccionada}
          >
            Enviar respuesta
          </button>
        </div>
      </div>

      {/* Log de actividad sospechosa */}
      {alertasActividad.length > 0 && (
        <div className="p-4 max-w-2xl mx-auto mt-4">
          <details className="bg-red-50 rounded-lg p-3">
            <summary className="font-medium text-red-800 cursor-pointer">
              Actividad Registrada ({alertasActividad.length})
            </summary>
            <div className="mt-2 space-y-1 text-xs text-red-700 max-h-32 overflow-y-auto">
              {alertasActividad.map((alerta, index) => (
                <div key={index} className="bg-red-100 p-1 rounded">{alerta}</div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default PreguntaEjemplo;