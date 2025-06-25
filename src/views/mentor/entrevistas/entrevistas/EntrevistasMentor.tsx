import { Link } from "react-router-dom"

const EntrevistasMentor = () => {
  return (
    <>
      <Link
        to={"/mentor/entrevista/crear"}
        className="mt-10 inline-block bg-[#2272FF] text-white p-2 rounded-sm hover:bg-[#203bd3] transition"
      >
        Crear Entrevista
      </Link>

      <main className="mt-5">
        <div className="relative overflow-x-auto shadow-md">
          <table className="w-full text-sm text-left rtl:text-right text-[#1D1D1D]">
            <thead className="text-xs text-[#1D1D1D] uppercase bg-[#E9ECEF] ">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">Id</th>
                <th scope="col" className="px-6 py-3 text-center">Nombre</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-[#F8F9FA] border-b dark:border-gray-700 border-gray-200">
              <tr>
                <td>
                  <div className="px-6 py-4 text-center font-bold">1</div>
                </td>
                <td>
                  <div className="px-6 py-4 text-center">Entrevista de Prueba</div>
                </td>
                <td>
                  <div className="px-6 py-4 text-center">
                    <span className="p-2 rounded-md bg-[#28A745] text-white font-bold">Activa</span>
                  </div>
                </td>
                <td className="px-6 py-4 flex gap-3 justify-center items-center">
                  <button className="bg-[#FFC107] text-white font-bold rounded-sm p-2">
                    Editar
                  </button>
                  <button className="bg-[#DC3545] text-white font-bold rounded-sm p-2">
                    Eliminar
                  </button>
                  <button className="bg-sky-600 text-white font-bold rounded-sm p-2">
                    Deshabilitar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}

export default EntrevistasMentor