import Swal from "sweetalert2";
import Button from "../../components/Button";
import Enlace from "../../components/Enlace";
import { IconPhStudentDuotone } from "../../components/icons/IconPhStudentDuotone ";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JwTPayload, UsuarioInfo } from "../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";


export default function SideBar() {

  const navigate = useNavigate();

  const [Usuario, setUsuario] = useState<UsuarioInfo>({
    id: 0,
    nombre: "",
    apellidos: "",
    email: ""
  });

  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return; // no avanza si es null
  }

  const decoded = jwtDecode<JwTPayload>(token);

  useEffect(() => {
    cargarUsuario()
  }, [])

  const cargarUsuario = async () => {
    const response = await fetch(`http://localhost:8080/api/usuarios/usuarioByEmail?email=${decoded.email}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error("Error al obtener el usuario:", response);
      return;
    }

    const data = await response.json();
    setUsuario(data);
  }

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
            <IconPhStudentDuotone className="size-14 text-white" />
            <p className="text-sm font-semibold text-center text-white">{Usuario.nombre + " " + Usuario.apellidos}</p>
            <p className="text-xs text-gray-100 text-center">{Usuario.email}</p>
          </div>

          <div className="flex flex-col px-4 py-4 space-y-2">
            <Enlace enlace="/estudiante/evaluaciones">
              Evaluaciones
            </Enlace>
            <Enlace enlace="/estudiante/entrevistas">
              Entrevistas
            </Enlace>
            <Enlace enlace="/estudiante/resultados">
              Mis Resultados
            </Enlace>
            <Enlace enlace="/estudiante/progreso">
              Mi Progreso
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
