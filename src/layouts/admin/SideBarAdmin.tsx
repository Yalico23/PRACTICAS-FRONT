import { jwtDecode } from "jwt-decode";
import Button from "../../components/Button";
import Enlace from "../../components/Enlace";
import { IconPhChalkboardTeacherThin } from "../../components/icons/IconPhChalkboardTeacherThin";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { type UsuarioInfo, type JwTPayload } from "../../interfaces/interfaces";
import { useEffect, useState } from "react";

const SideBarAdmin = () => {
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
        const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/usuarioByEmail?email=${decoded.email}`, {
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
        localStorage.setItem('usuarioId', data.id.toString());

    }

    const cerrarSesion = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡Cerrar sesión eliminará tu sesión actual!",
            icon: 'warning',
            background: '#E9ECEF',
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
            <div className="w-64 shadow-sm shadow-white flex flex-col justify-between bg-[#2D2D2D] rounded-2xl m-2">
                <div>
                    <div className="flex flex-col items-center py-6 border-b">
                        <IconPhChalkboardTeacherThin className="size-14 text-white" />
                        <p className="text-sm font-semibold text-center text-white">{Usuario.nombre + " " + Usuario.apellidos}</p>
                        <p className="text-xs text-gray-100 text-center">{Usuario.email}</p>
                    </div>

                    <div className="flex flex-col px-4 py-4 space-y-2">
                        <Enlace enlace="/admin/inicio">
                            Crear Usuarios
                        </Enlace>
                        <Enlace enlace="/admin/usuarios">
                            Gestionar Usuarios
                        </Enlace>
                    </div>
                </div>

                <div className="px-4 py-4">
                    <Button onClick={cerrarSesion} className="w-full bg-[#DC3545] hover:bg-[#C82333] text-white">
                        <span className="text-sm font-semibold">Cerrar Sesión</span>
                    </Button>
                </div>
            </div>
        </>
    )
}

export default SideBarAdmin