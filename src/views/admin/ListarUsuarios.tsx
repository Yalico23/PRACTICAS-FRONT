import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Roles {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  mentor: boolean;
  habilitado: boolean;
  roles: Roles[];
}

const ListarUsuarios = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    getAllUsuarios();
  }, []);

  const getAllUsuarios = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/listar`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllUsuarios2 = (idUsuario: number, prevEstado: boolean) => {
    const updatedUsuarios = usuarios.map((usuario) => {
      if (usuario.id === idUsuario) {
        return { ...usuario, habilitado: !prevEstado };
      }
      return usuario;
    }
    );
    setUsuarios(updatedUsuarios);
  }

  const cambiarEstado = async (id: number, estado: boolean) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cambiará el estado del usuario.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar estado",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) { 
        try {
          const response = await fetch(
            `${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/activar-desactivar/${id}/${estado}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            getAllUsuarios2(id, estado);
          }
        } catch (error) {
          console.log(error);
        }
      };
    });
  }
      return (
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-200">Lista de Usuarios</h2>

          <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Nombres</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Apellidos</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Roles</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {usuarios
                  .filter((u) => u.roles[0].nombre !== "ROLE_ADMIN")
                  .map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-700">{u.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.apellidos}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{u.roles[0].nombre}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${u.habilitado
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {u.habilitado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td className="px-6 py-4 flex gap-3">
                        <button
                          onClick={() => navigate(`/admin/usuarios/actualizar/${u.id}`)} 
                          className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition"
                        >
                          Actualizar
                        </button>

                        <button
                          onClick={() => cambiarEstado(u.id, u.habilitado)}
                          className="px-4 py-2 text-sm text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow transition"
                        >
                          Cambiar Estado
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    export default ListarUsuarios;
