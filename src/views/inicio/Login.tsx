import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { jwtDecode } from "jwt-decode";
import type { FormData, JwTPayload } from "../../interfaces/interfaces";

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormdata] = useState<FormData>({
    email: "",
    password: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormdata(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError("")
    if (success) setSuccess("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (response.ok) {

        setSuccess(data.message)
        localStorage.setItem('token', data.token);
        redireccionarByRole(data.token)

      } else {
        setError(data.error || 'Error de autenticación')
      }
    } catch (err) {
      console.error('Error en la petición:', err)
      setError('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setLoading(false)
    }
  }

  const redireccionarByRole = (token: string) => {
    try {
      const decoded = jwtDecode<JwTPayload>(token)
      const roles = JSON.parse(decoded.authorities) as { authority: string }[];
      const role = roles[0]?.authority;
      switch (role) {
        case "ROLE_ESTUDIANTE":
          navigate("/estudiante/evaluaciones");
          break;
        case "ROLE_MENTOR":
          navigate("/mentor/evaluaciones");
          break;
        case "ROLE_ADMIN":
          navigate("/dashboard-admin");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      console.error("Error decodificando el token JWT:", err);
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] bg-[url(/img/wallpaper.jpg)] bg-cover bg-center">
        <div className="max-w-5xl w-ful rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 ">
          <div className="hidden md:block bg-[#322F2A] px-6 py-10">
            <img
              src="img/undraw_login_weas.svg"
              alt="Login visual"
              className="h-full w-full object-fill rounded-lg object-center"
            />
          </div>
          <div className="p-8 space-y-6 backdrop-blur-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-white">Bienvenido de nuevo</h2>
            <p className="text-sm text-gray-300">Ingresa tus credenciales para continuar</p>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={loading}
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                  placeholder="tucorreo@ejemplo.com"
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F2937]"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">

                <Link to={"/olvide-password"} className="text-sm text-gray-300 hover:underline">¿Olvidaste tu contraseña?</Link>

              </div>
              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                className="w-full py-2 px-4 bg-[#322F2A] text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
            <Link to={"/"} className="py-2 px-4 bg-[#b8bb0e] text-white rounded-lg hover:bg-[#939610] transition-colors text-center">Regresar</Link>
          </div>
        </div>
      </div>

    </>
  )
}

export default Login