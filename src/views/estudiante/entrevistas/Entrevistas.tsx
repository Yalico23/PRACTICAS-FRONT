import Swal from "sweetalert2";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";

const Entrevistas = () => {

  const navigate = useNavigate();

  const entrevistas = [
    {
      id: 1,
      titulo: "Entrevista Técnica de PHP",
      mentor: "Marcus Castilla Flores",
      estado: "Disponible",
      tiempo: "1h 4min",
      descripcion: "Esta entrevista técnica está diseñada para evaluar tus conocimientos en PHP, incluyendo conceptos de POO, manejo de bases de datos y buenas prácticas de programación.",
      tecnologias: "PHP"
    },
    {
      id: 2,
      titulo: "C# POO",
      mentor: "Marcus Castilla Flores",
      estado: "Completado",
      tiempo: "1h 4min",
      descripcion: "Esta entrevista técnica está diseñada para evaluar tus conocimientos en C# y Programación Orientada a Objetos.",
      tecnologias: "C#"
    }
  ]

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
      title: "Iniciar Entrevista",
      text: "¿Estás seguro de que deseas iniciar esta entrevista? Recuerda que debes estar preparado y contar con el tiempo necesario para completarla.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, iniciar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/estudiante/entrevista/${id}`);
      }
    })
  }

  return (
    <>
      <main className="container mx-auto p-5">
        <div>
          <h1 className="text-3xl font-['Quicksand'] font-bold text-center mt-10">
            Entrevistas
          </h1>
          <p className="text-sm font-['Quicksand'] text-center mt-2">
            Aquí podrás ver todas tus entrevistas.
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
                placeholder="Buscar entrevista..."
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
              <th className="p-2">Estado</th>
              <th className="p-2">Tiempo</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entrevistas.map(entrevistas => (
              <tr key={entrevistas.id}>
                <td className="text-center">{entrevistas.titulo}</td>
                <td className="text-center">{entrevistas.mentor}</td>
                <td className="text-center">
                  <span className={`p-0.5 px-2 rounded-full font-bold border text-[14px] ${entrevistas.estado === "Completado"
                    ? "bg-[#fcd34d46] border-[#d1ab30] text-[#d1ab30]"
                    : "bg-[#189b4448] border-[#189b44] text-[#189b44]"
                    }`}>
                    {entrevistas.estado}
                  </span>
                </td>
                <td className="text-center">
                  <span>{entrevistas.tiempo}</span>
                </td>
                <td className="text-center flex justify-center gap-2">
                  <Button variant="start" onClick={() =>
                    openModal(
                      entrevistas.titulo,
                      entrevistas.tiempo,
                      entrevistas.descripcion,
                      entrevistas.tecnologias
                    )
                  }>
                    <span
                      className="text-sm font-semibold"
                    >
                      Ver
                    </span>
                  </Button>
                  <Button onClick={() => startEvaluacion(entrevistas.id)}>
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
}

export default Entrevistas