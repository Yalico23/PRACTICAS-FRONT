import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JwTPayload, listEvalaciones, UsuarioInfo } from "../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";
import { alertasSweet } from "./Alertas";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EvaluaionesMentor = () => {

  const navigate = useNavigate();

  const [Usuario, setUsuario] = useState<UsuarioInfo>({
    id: 0,
    nombre: '',
    apellidos: '',
    email: ''
  });

  const [Evaluaciones, setEvaluaciones] = useState<listEvalaciones[]>();

  const token = localStorage.getItem('token');

  if (!token) {
    console.error("Error en obtener el token");
    return;
  }

  const decoded = jwtDecode<JwTPayload>(token);

  useEffect(() => {
    cargarUsuario();
  }, []);

  useEffect(() => {
    if (Usuario.id !== 0) {
      cargarEvaluaciones();
    }
  }, [Usuario.id]);

  const cargarUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/usuarioByEmail?email=${decoded.email}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Error al obtener el usuario:", response);
        return;
      }

      const data = await response.json();
      setUsuario(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const cargarEvaluaciones = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/evaluaciones/listarById?idMentor=${Usuario.id}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Error al obtener el usuario:", response);
        return;
      }

      const data = await response.json();
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const cambiaEstadoEvalucion = async (id: number, preEstado: boolean) => {

    Swal.fire({
      title: 'Cambiar Estado',
      text: `¿Estás seguro de que deseas ${preEstado ? 'deshabilitar' : 'habilitar'} esta evaluación?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const URL: string = `http://localhost:8080/api/evaluaciones/cambiarEstado?idEvaluacion=${id}&estadoPrevio=${preEstado}`;
          const response = await fetch(URL, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json; charset=UTF-8',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            console.error("Error al obtener el usuario:", response);
            return;
          }
          await cargarEvaluaciones();
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  }

  const actualizarEvaluacion = (id: number) => {
    navigate(`/mentor/evaluaciones/editar/${id}`);
  }

  const eliminarEvaluacion = async (id: number) => {
    Swal.fire({
      title: 'Eliminar Evaluación',
      text: "¿Estás seguro de que deseas eliminar esta evaluación?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const URL: string = `http://localhost:8080/api/evaluaciones/eliminarEvaluacion?idEvaluacion=${id}`;
          const response = await fetch(URL, {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json; charset=UTF-8',
              'Authorization': `Bearer ${token}`
            }
          });

          // Manejar respuesta de error
          if (!response.ok) {
            let errorMessage = "Error al eliminar la evaluación";

            // Solo intentar parsear JSON si no es 204 y tiene content-type JSON
            if (response.status !== 204) {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                try {
                  const data = await response.json();
                  errorMessage = data.details?.[0] || data.message || errorMessage;
                } catch (parseError) {
                  console.error("Error parsing error response:", parseError);
                }
              }
            }

            alertasSweet("Error", errorMessage, "error");
            return;
          }

          // Status 204 (No Content) = eliminación exitosa, no hay JSON que parsear
          if (response.status === 204) {
            alertasSweet("Éxito", "Evaluación eliminada correctamente", "success");
            await cargarEvaluaciones();
            return;
          }

          alertasSweet("Éxito", "Evaluación eliminada correctamente", "success");
          await cargarEvaluaciones();

        } catch (error) {
          console.error("Error:", error);
          alertasSweet("Error", "Error de conexión al servidor", "error");
        }
      }
    });
  }

  return (
    <>
      <Link
        to={"/mentor/evaluaciones/crear"}
        className="mt-10 inline-block bg-[#2272FF] text-white p-2 rounded-sm hover:bg-[#203bd3] transition"
      >
        Crear Evaluación
      </Link>

      <main className="mt-5">
        <div className="relative overflow-x-auto shadow-md">
          <table className="w-full text-sm text-left rtl:text-right text-[#1D1D1D]">
            <thead className="text-xs text-[#1D1D1D] uppercase bg-[#E9ECEF] ">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">Id</th>
                <th scope="col" className="px-6 py-3 text-center">Nombre</th>
                <th scope="col" className="px-6 py-3 text-center">Descripcion</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-[#F8F9FA] border-b dark:border-gray-700 border-gray-200">
              {Evaluaciones?.map(evaluacion => (
                <tr key={evaluacion.id}>
                  <td className="px-6 py-4 text-center font-bold">{evaluacion.id}</td>
                  <td className="px-6 py-4 text-center">{evaluacion.titulo}</td>
                  <td className="px-6 py-4 text-center">{evaluacion.descripcion}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`p-2 rounded-md text-white font-bold ${evaluacion.activo ? 'bg-[#28A745]' : 'bg-[#FFC107] text-[#2D2D2D]'
                        }`}
                    >
                      {evaluacion.activo ? 'Activa' : 'Inactiva'}
                    </span>

                  </td>
                  <td className="px-6 py-4 flex gap-3 justify-center items-center">
                    <button className="bg-[#FFC107] text-white font-bold rounded-sm p-2"
                      onClick={() => actualizarEvaluacion(evaluacion.id)}>Editar</button>
                    <button className="bg-[#DC3545] text-white font-bold rounded-sm p-2"
                      onClick={() => eliminarEvaluacion(evaluacion.id)}>Eliminar</button>
                    <button className="bg-sky-600 text-white font-bold rounded-sm p-2"
                      onClick={() => cambiaEstadoEvalucion(evaluacion.id, evaluacion.activo)}>
                      {evaluacion.activo ? 'Deshabilitar' : 'Habilitar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default EvaluaionesMentor;
