import Button from "../../components/Button";
import Enlace from "../../components/Enlace";
import { IconPhChalkboardTeacherThin } from "../../components/icons/IconPhChalkboardTeacherThin";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function SideBarMentor() {

  const navigate = useNavigate();

  const cerrarSesion = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Cerrar sesión eliminará tu sesión actual!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cerrar sesión'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        navigate('/login');
        Swal.fire(
          '¡Sesión cerrada!',
          'Has cerrado sesión correctamente.',
          'success'
        )
      }
    })
  }

  return (
    <>
      <div className="w-64 h-screen border-r shadow-sm flex flex-col justify-between bg-[#1D1D1D]">
        <div>
          <div className="flex flex-col items-center py-6 border-b">
            <IconPhChalkboardTeacherThin className="size-14 text-white" />
            <p className="text-sm font-semibold text-center text-white">Manuel Davila</p>
            <p className="text-xs text-gray-100 text-center">mdavila@zonatech.org.pe</p>
          </div>

          <div className="flex flex-col px-4 py-4 space-y-2">
            <Enlace enlace="/mentor/evaluaciones">
              Evaluaciones
            </Enlace>
            <Enlace enlace="/mentor/evaluacicones/pendientes">
              Evaluaciones Pendientes
            </Enlace>
            <Enlace enlace="/mentor/entrevistas">
              Entrevistas
            </Enlace>
            <Enlace enlace="/mentor/entrevistas/pendientes">
              Entrevistas Pendientes
            </Enlace>
            <Enlace enlace="/mentor/resultados">
              Resultados
            </Enlace>
          </div>
        </div>

        <div className="px-4 py-4">
          <Button onClick={cerrarSesion}>
            <span className="text-sm font-semibold">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </>
  )
}
