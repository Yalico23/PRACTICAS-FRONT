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

  return (
    <>
      <Link
        to={"/mentor/evaluaciones/crear"}
        className="mt-6 inline-block bg-[#2272FF] text-white p-2 rounded-xl hover:bg-[#203bd3] transition"
      >
        Crear Evaluación
      </Link>

      <main>

        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {Evaluaciones?.map(evaluacion => (
              <tr key={evaluacion.id}>
                <td>{evaluacion.id}</td>
                <td>{evaluacion.titulo}</td>
                <td>{evaluacion.descripcion}</td>
                <td>{evaluacion.activo ? 'Activa' : 'Inactiva'}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </main>
    </>
  );
};

export default EvaluaionesMentor;
