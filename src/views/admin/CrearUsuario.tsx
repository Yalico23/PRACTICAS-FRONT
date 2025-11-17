import { useState, type ChangeEvent } from 'react';

export const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    mentor: false
  });
  
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token') || '';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Aquí agregas tu endpoint
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData.details || [errorData.message]);
      } else {
        setSuccess(true);
        // Limpiar formulario después de éxito
        setFormData({
          nombre: '',
          apellidos: '',
          email: '',
          password: '',
          mentor: false
        });
      }
    } catch (error) {
      setErrors(['Error de conexión. Por favor, intenta de nuevo.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full">
        <div className="bg-[#1D1D1D] rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Crear Usuario</h2>
          <p className="text-gray-400 mb-8">Completa la información para registrar un nuevo usuario</p>

          {/* Mensajes de error */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              {errors.map((error, index) => (
                <p key={index} className="text-red-400 text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </p>
              ))}
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 text-sm">✓ Usuario creado exitosamente</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Nombre */}
            <div className='flex items-center'>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2 mr-2 w-[6rem]">
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Juan"
              />
            </div>

            {/* Apellidos */}
            <div className='flex items-center'>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-300 mb-2 mr-2 w-[6rem]">
                Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Pérez García"
              />
            </div>

            {/* Email */}
            <div className='flex items-center'>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 pr-2 mr-2 w-[6rem]">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="juan@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div className='flex items-center'>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 pr-2 mr-2 w-[6rem]">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {/* Mentor Checkbox */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="mentor"
                name="mentor"
                checked={formData.mentor}
                onChange={handleChange}
                className="w-5 h-5 bg-zinc-800 border-zinc-700 rounded focus:ring-2 focus:ring-blue-500 text-blue-500 cursor-pointer"
              />
              <label htmlFor="mentor" className="text-sm font-medium text-gray-300 cursor-pointer">
                Registrar como mentor
              </label>
            </div>

            {/* Botón Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando...
                </>
              ) : (
                'Crear Usuario'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};