import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ApiError {
  code: string;
  message: string;
  details: string[];
  timestamp: string;
}

interface ApiSuccess {
  mensaje: string;
}

const RestablecerPassword: React.FC = () => {
  const [codigo, setCodigo] = useState<string>('');
  const [nuevaPassword, setNuevaPassword] = useState<string>('');
  const [confirmarPassword, setConfirmarPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, ''); // Solo números
    if (valor.length <= 6) {
      setCodigo(valor);
    }
  };

  const validarFormulario = (): boolean => {
    setError('');
    
    if (codigo.length !== 6) {
      setError('El código debe tener exactamente 6 dígitos');
      return false;
    }

    if (nuevaPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (nuevaPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const url = `http://localhost:8080/api/usuarios/restablecer-password?token=${codigo}&nuevoPassword=${nuevaPassword}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const successData = data as ApiSuccess;
        setMensaje(successData.mensaje);
        // Limpiar formulario
        setCodigo('');
        setNuevaPassword('');
        setConfirmarPassword('');
      } else {
        const errorData = data as ApiError;
        setError(errorData.details.join(', ') || errorData.message);
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    setCodigo('');
    setNuevaPassword('');
    setConfirmarPassword('');
    setError('');
    setMensaje('');
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Restablecer Contraseña
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo de código */}
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
            Código de 6 dígitos
          </label>
          <input
            type="text"
            id="codigo"
            value={codigo}
            onChange={handleCodigoChange}
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {codigo.length}/6 dígitos
          </p>
        </div>

        {/* Campo nueva contraseña */}
        <div>
          <label htmlFor="nuevaPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <input
            type="password"
            id="nuevaPassword"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            placeholder="Ingrese su nueva contraseña"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={6}
            required
          />
        </div>

        {/* Campo confirmar contraseña */}
        <div>
          <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmarPassword"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="Confirme su nueva contraseña"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            minLength={6}
            required
          />
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {mensaje}
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Restablecer Contraseña'}
          </button>
          
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <div className="mt-6 text-center">
        <Link to={"/login"} className="py-2 px-4 bg-[#b8bb0e] text-white rounded-lg hover:bg-[#939610] transition-colors text-center">Ingresar a la plataforma</Link>
      </div>
    </div>
  );
};

export default RestablecerPassword;