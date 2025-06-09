import Swal from "sweetalert2";
import Button from "../../../../components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { EvaluacionEstudiante } from "../../../../interfaces/interfaces";

const Evaluaciones = () => {

  const navigate = useNavigate();

  const [evaluaciones, setEvaluaciones] = useState<EvaluacionEstudiante[]>([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    cargarUsuario();
  }, [])

  const cargarUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/evaluaciones/listarEvaluacionesEstudiante`, {
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

  const openModal = (
    titulo: string,
    tiempo: string,
    descripcion: string,
    tecnologias: string
  ) => {
    Swal.fire({
      title: titulo,
      html: `
      <p><strong>Tiempo:</strong> ${tiempo}</p>
      <p><strong>Descripción:</strong> ${descripcion}</p>
      <p><strong>Tecnologías:</strong> ${tecnologias}</p>
    `,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "animate__animated animate__fadeInUp",
      },
    });
  };

  const startEvaluacion = (id: number) => {
    Swal.fire({
      title: "Iniciar Evaluación",
      text: "¿Estás seguro de que quieres iniciar esta evaluación? Esta evaluación restringirá el acceso a otras funcionalidades hasta que la completes, en caso de realizar actividades sospechosas, se te penalizará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, iniciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/estudiante/evaluacion/${id}`);
      }
    })
  }

  return (
    <>
      <main className="container mx-auto p-5">
        <div>
          <h1 className="text-3xl font-['Quicksand'] font-bold text-center mt-10">
            Evaluaciones
          </h1>
          <p className="text-sm font-['Quicksand'] text-center mt-2">
            Aquí podrás ver todas tus evaluaciones.
          </p>
        </div>

        {/* Buscador y size */}
        <div className="pt-5">
          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2">
              <label htmlFor="search" className="text-sm font-semibold">Buscar:</label>
              <input
                type="text"
                id="search"
                placeholder="Buscar evaluación..."
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="size" className="text-sm font-semibold">Tamaño:</label>
              <select
                id="size"
                className="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
        {/*Tabla de evaluaciones*/}
        <table className="min-w-full mt-10 bg-white border border-gray-300">
          <thead>
            <tr className="">
              <th className="p-2">Nombre</th>
              <th className="p-2">Mentor</th>
              <th className="p-2">Tecnologia</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Tiempo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {evaluaciones.map(evaluaciones => (
              <tr key={evaluaciones.id}>
                <td className="text-center">{evaluaciones.titulo}</td>
                <td className="text-center">Marcus Castilla Flores</td>
                <td className="text-center">
                  <span className="p-0.5 px-2 bg-[#2273ff7a] rounded-full font-bold border border-[#2272FF] text-[14px] text-[#174ba5]">
                    {evaluaciones.tecnologia}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`p-0.5 px-2 rounded-full font-bold border text-[14px] ${evaluaciones.estado === "Completado"
                    ? "bg-[#fcd34d46] border-[#d1ab30] text-[#d1ab30]"
                    : "bg-[#189b4448] border-[#189b44] text-[#189b44]"
                    }`}>
                    {evaluaciones.estado}
                  </span>
                </td>
                <td className="text-center">
                  <span>{evaluaciones.tiempo}</span>
                </td>
                <td className="text-center flex justify-center gap-2">
                  <Button variant="start" onClick={() =>
                    openModal(
                      evaluaciones.titulo,
                      evaluaciones.tiempo,
                      evaluaciones.descripcion,
                      evaluaciones.tecnologia
                    )
                  }>
                    <span
                      className="text-sm font-semibold"
                    >
                      Ver
                    </span>
                  </Button>
                  <Button onClick={() => startEvaluacion(evaluaciones.id)}>
                    <span className="text-sm font-semibold">Iniciar</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default Evaluaciones;
