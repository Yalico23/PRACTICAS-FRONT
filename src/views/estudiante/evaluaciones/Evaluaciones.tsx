import Swal from "sweetalert2";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

const Evaluaciones = () => {

  const navigate = useNavigate();

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
      text: "¿Estás seguro de que quieres iniciar esta evaluación?",
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
            <tr>
              <td className="text-center">JavaScript DOM</td>
              <td className="text-center">Marcus Castilla Flores</td>
              <td className="text-center">
                <span className="p-0.5 px-2 bg-[#2273ff7a] rounded-full font-bold border border-[#2272FF] text-[14px] text-[#174ba5]">
                  JavaScript
                </span>
              </td>
              <td className="text-center">
                <span className="p-0.5 px-2 bg-[#999b1846] rounded-full font-bold border border-[#999b18] text-[14px] text-[#999b18]">
                  Disponible
                </span>
              </td>
              <td className="text-center">
                <span>1h 4min</span>
              </td>
              <td className="text-center flex justify-center gap-2">
                <Button variant="start" onClick={() =>
                  openModal(
                    "JavaScript DOM",
                    "1h 4min",
                    "Esta evaluación tiene como objetivo medir el nivel de aprendizaje del estudiante en el consumo de APIs mediante JavaScript, evaluando su capacidad para integrar nuevas funcionalidades en aplicaciones web o móviles, así como para realizar operaciones de persistencia de datos (crear, leer, actualizar y eliminar información) a través de servicios externos.",
                    "JavaScript"
                  )
                }>
                  <span
                    className="text-sm font-semibold"

                  >
                    Ver
                  </span>
                </Button>
                {/** Estoy probando el enlace con un numero fijo*/}
                <Button onClick={() => startEvaluacion(1)}>
                  <span className="text-sm font-semibold">Iniciar</span>
                </Button>
              </td>
            </tr>
            {/* -------------------------- Ejemplo de otra fila ----------------------------- */}
            <tr>
              <td className="text-center">C# POO</td>
              <td className="text-center">Marcus Castilla Flores</td>
              <td className="text-center">
                <span className="p-0.5 px-2 bg-[#2273ff7a] rounded-full font-bold border border-[#2272FF] text-[14px] text-[#174ba5]">
                  C#
                </span>
              </td>
              <td className="text-center">
                <span className="p-0.5 px-2 bg-[#22ff9860] rounded-full font-bold border border-[#189b5e] text-[14px] text-[#189b5e]">
                  Completado
                </span>
              </td>
              <td className="text-center">
                <span>1h 4min</span>
              </td>
              <td className="text-center">
                <Button variant="start">
                  <span className="text-sm font-semibold">Ver</span>
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>
    </>
  );
};

export default Evaluaciones;
