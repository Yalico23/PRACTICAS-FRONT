import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JwTPayload, listEvalaciones, UsuarioInfo } from "../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";

const EvaluaionesMentor = () => {

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
    try {
      const URL: string = `http://localhost:8080/api/evaluaciones/cambiarEstado?idEvaluacion=${id}&estadoPrevio=${preEstado}`;
      console.log(URL);
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
      const data =  await response.json();
      console.log(data);
      await cargarEvaluaciones();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <>
      <Link
        to={"/mentor/evaluaciones/crear"}
        className="mt-6 inline-block bg-[#2272FF] text-white p-2 rounded-xl hover:bg-[#203bd3] transition"
      >
        Crear Evaluación
      </Link>

      <main className="mt-5">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">Id</th>
                <th scope="col" className="px-6 py-3 text-center">Nombre</th>
                <th scope="col" className="px-6 py-3 text-center">Descripcion</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
              {Evaluaciones?.map(evaluacion => (
                <tr key={evaluacion.id}>
                  <td className="px-6 py-4 text-center">{evaluacion.id}</td>
                  <td className="px-6 py-4 text-center">{evaluacion.titulo}</td>
                  <td className="px-6 py-4 text-center">{evaluacion.descripcion}</td>
                  <td className="px-6 py-4 text-center">{evaluacion.activo ? 'Activa' : 'Inactiva'}</td>
                  <td className="px-6 py-4 flex gap-3 justify-center">
                    <button className="bg-sky-600 text-gray-950 rounded-xl p-2">Editar</button>
                    <button className="bg-sky-600 text-gray-950 rounded-xl p-2">Eliminar</button>
                    <button className="bg-sky-600 text-gray-950 rounded-xl p-2" 
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
