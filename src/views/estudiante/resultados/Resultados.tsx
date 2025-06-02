import Button from "../../../components/Button";

const Resultados = () => {
  const resultadosEvaluaciones = [
    {
      id: 1,
      nombre: "JavaScript DOM",
      mentor: "Marcus Castilla Flores",
      tecnologia: "JavaScript",
      estado: "Revisado",
      tiempo: "1h 4min",
    },
    {
      id: 2,
      nombre: "React Hooks",
      mentor: "Ana Pérez",
      tecnologia: "React",
      estado: "Revisado",
      tiempo: "45min",
    },
    {
      id: 3,
      nombre: "Node.js Basics",
      mentor: "Luis Gómez",
      tecnologia: "Node.js",
      estado: "Pendiente",
      tiempo: "2h 30min",
    },
    {
      id: 4,
      nombre: "CSS Flexbox",
      mentor: "María López",
      tecnologia: "CSS",
      estado: "Revisado",
      tiempo: "1h 15min",
    },
  ];

  const verEvaluacon = (id: number) => {
    console.log("Se ve la evaluaion con id: ", id);
  };

  return (
    <>
      <main>
        <div className="container mx-auto p-5">
          <h1 className="text-3xl font-['Quicksand'] font-bold text-center mt-10">
            Resultados
          </h1>
          <p className="text-sm font-['Quicksand'] text-center mt-2">
            Aquí podrás ver todas tus evaluaciones.
          </p>
        </div>

        {/* Buscador y size */}
        <div className="pt-5">
          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2">
              <label htmlFor="search" className="text-sm font-semibold">
                Buscar:
              </label>
              <input
                type="text"
                id="search"
                placeholder="Buscar evaluación..."
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="size" className="text-sm font-semibold">
                Tamaño:
              </label>
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
            {resultadosEvaluaciones.map((evaluacion) => (
              <tr key={evaluacion.id}>
                <td className="text-center">{evaluacion.nombre}</td>
                <td className="text-center">{evaluacion.mentor}</td>
                <td className="text-center">
                  <span className="p-0.5 px-2 bg-[#2273ff7a] rounded-full font-bold border border-[#2272FF] text-[14px] text-[#174ba5]">
                    {evaluacion.tecnologia}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`p-0.5 px-2 rounded-full font-bold border text-[14px] ${evaluacion.estado === "Pendiente"
                      ? "bg-[#fcd34d46] border-[#d1ab30] text-[#d1ab30]"
                      : "bg-[#189b4448] border-[#189b44] text-[#189b44]"
                    }`}>
                    {evaluacion.estado}
                  </span>
                </td>
                <td className="text-center">
                  <span>{evaluacion.tiempo}</span>
                </td>
                <td className="text-center flex justify-center gap-2">
                  <Button onClick={() => verEvaluacon(evaluacion.id)}>
                    <span className="text-sm font-semibold">Ver</span>
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
export default Resultados;
