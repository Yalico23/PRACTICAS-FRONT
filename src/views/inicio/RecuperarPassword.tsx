import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import { useState } from "react"

const RecuperarPassword = () => {
  const [email, setEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.fire({
        title: 'Error',
        icon: 'error',
        text: 'Por favor ingresa tu correo electrónico.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/restablecer-password-email?correoDestino=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Respuesta exitosa (200)
        Swal.fire({
          title: 'Revisa tu correo',
          icon: 'success',
          text: 'Te hemos enviado un enlace para restablecer tu contraseña.',
          confirmButtonText: 'Entendido'
        });
        setEmail(""); // Limpiar el campo
      } else {
        // Error del servidor (500 u otros)
        const errorMessage = data.details && data.details.length > 0
          ? data.details[0]
          : data.message || 'Ocurrió un error inesperado';

        Swal.fire({
          title: 'Error',
          icon: 'error',
          text: errorMessage,
          confirmButtonText: 'Intentar de nuevo'
        });
      }
    } catch (error) {
      // Error de conexión o red
      Swal.fire({
        title: 'Error de conexión',
        icon: 'error',
        text: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        confirmButtonText: 'Reintentar'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] bg-[url(/img/wallpaper.jpg)] bg-cover bg-center">
        <div className="max-w-5xl w-ful rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 ">
          <div className="hidden md:block bg-[#322F2A] px-6 py-10">
            <img
              src="img/undraw_forgot-password_odai.svg"
              alt="Login visual"
              className="h-full w-full object-fill rounded-lg object-center"
            />
          </div>
          <div className="p-8 space-y-6 backdrop-blur-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-300">Ingresa tu correo para restablecer la contraseña</p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                  placeholder="tucorreo@ejemplo.com"
                />
              </div>
              <div className="flex items-center justify-between">

                <Link to={"/login"} className="text-sm text-gray-300 hover:underline">Ingresar a la plataforma</Link>

              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-[#322F2A] text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Restablecer contraseña'
                )}
              </button>
            </form>
            <Link to={"/"} className="py-2 px-4 bg-[#b8bb0e] text-white rounded-lg hover:bg-[#939610] transition-colors text-center">Regresar</Link>
          </div>
        </div>
      </div>

    </>
  )
}

export default RecuperarPassword