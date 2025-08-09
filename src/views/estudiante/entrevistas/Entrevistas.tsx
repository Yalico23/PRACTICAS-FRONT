import Swal from "sweetalert2";
import Button from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JwTPayload, ListaEntrevistas, PaginatedResponse } from "./Types";
import { jwtDecode } from "jwt-decode";
import Spinner from "../../../components/Spinner";

const Entrevistas = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [entrevistas, setEntrevistas] = useState<ListaEntrevistas[]>([]);

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode<JwTPayload>(token || "");

  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    first: true,
    last: true
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    cargarEntrevistas();
  }, [currentPage, pageSize, filter]);

  const cargarEntrevistas = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        emailEstudiante: decodedToken.email,
        page: currentPage.toString(),
        size: pageSize.toString()
      })

      if (filter.trim()) {
        params.append("filter", filter.trim());
      }

      const response = await fetch(`http://localhost:8080/api/entrevistas/listarEntrevistaEstudiante?${params}`, {
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

      const data: PaginatedResponse = await response.json();
      setEntrevistas(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        pageSize: data.size,
        first: data.first,
        last: data.last
      })
      setLoading(false);
    } catch (error) {
      console.error("Error al cargar las entrevistas:", error);
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(searchTerm);
    setCurrentPage(0); // Resetear a la primera página al buscar
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Resetear a la primera página al cambiar el tamaño
  };

  const clearFilter = () => {
    setFilter("");
    setSearchTerm("");
    setCurrentPage(0);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(paginationInfo.totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return <Spinner />;
  }

  const openModal = (titulo: string, tiempo: string, mentor: string, estado: string, descripcion: string) => {
    Swal.fire({
      title: titulo,
      html: `
      <p><strong>Tiempo:</strong> ${tiempo}</p>
      <p><strong>Mentor:</strong> ${mentor}</p>
      <p><strong>Descripción:</strong> ${descripcion}</p>
      <p><strong>Estado:</strong> ${estado}</p>
    `,
      icon: "info",
      showConfirmButton: true,
      confirmButtonText: "Cerrar",
      customClass: {
        popup: "animate__animated animate__fadeInUp",
      },
    })
  }

  const startEntrevista = (id: number) => {
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
      <div className="container mx-auto p-5">
        <div>
          <h1 className="text-3xl font-['Quicksand'] font-bold text-center mt-10">
            Evaluaciones
          </h1>
          <p className="text-sm font-['Quicksand'] text-center mt-2">
            Aquí podrás ver todas tus evaluaciones.
          </p>
        </div>
        {/* Buscador */}
        <div className="mt-14 flex flex-row-reverse mx-5">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar evaluación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2272FF]"
            />
            <button
              type="submit"
              className="bg-[#28A745] text-white px-4 py-2 rounded-sm hover:bg-[#218838] transition"
            >Buscar
            </button>
            {filter && (
              <button
                type="button"
                onClick={clearFilter}
                className="bg-[#DC3545] text-white px-4 py-2 rounded-sm hover:bg-[#c82333] transition"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        <main className="mt-5">
          {/* Controles de paginación superior */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Mostrar:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2272FF]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="text-sm text-gray-300">por página</span>
            </div>
            <div className="text-sm text-gray-300">
              Mostrando {paginationInfo.currentPage * paginationInfo.pageSize + 1} a{' '}
              {Math.min((paginationInfo.currentPage + 1) * paginationInfo.pageSize, paginationInfo.totalElements)} de{' '}
              {paginationInfo.totalElements} evaluaciones
              {filter && <span className="ml-2 font-medium">- Filtrado por: "{filter}"</span>}
            </div>
          </div>

          <div className="relative overflow-x-auto shadow-md">
            <table className="w-full text-sm text-left rtl:text-right text-[#1D1D1D]">
              <thead className="text-xs text-[#1D1D1D] uppercase bg-[#E9ECEF]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center">Nombre</th>
                  <th scope="col" className="px-6 py-3 text-center">Mentor</th>
                  <th scope="col" className="px-6 py-3 text-center">Estado</th>
                  <th scope="col" className="px-6 py-3 text-center">Tiempo</th>
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-[#F8F9FA] border-b dark:border-gray-700 border-gray-200 ">
                {entrevistas.length > 0 ? (
                  entrevistas.map(entrevista => (
                    <tr key={entrevista.id}>
                      <td className="px-6 py-4 text-center">{entrevista.nombre}</td>
                      <td className="px-6 py-4 text-center">{entrevista.mentor}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`p-2 rounded-md text-white font-bold ${entrevista.estado === "Completado" ? 'bg-[#28A745]' : 'bg-[#FFC107] text-[#2D2D2D]'
                          }`}>{entrevista.estado}</span>
                      </td>
                      <td className="px-6 py-4 text-center">{entrevista.tiempo}</td>
                      <td className="text-center flex justify-center gap-2">
                        <Button variant="start" onClick={() =>
                          openModal(
                            entrevista.nombre,
                            entrevista.tiempo,
                            entrevista.mentor,
                            entrevista.estado,
                            entrevista.descripcion
                          )
                        }>
                          <span
                            className="text-sm font-semibold"
                          >
                            Ver
                          </span>
                        </Button>
                        {entrevista.estado === "Disponible" && (
                          <Button onClick={() => startEntrevista(entrevista.id)}>
                            <span className="text-sm font-semibold">
                              Iniciar
                            </span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {filter ? `No se encontraron evaluaciones que contengan "${filter}"` : 'No hay evaluaciones disponibles'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación inferior */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={paginationInfo.first}
                className={`px-3 py-1 rounded-sm ${paginationInfo.first
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2272FF] text-white hover:bg-[#203bd3]'
                  }`}
              >
                Primera
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={paginationInfo.first}
                className={`px-3 py-1 rounded-sm ${paginationInfo.first
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2272FF] text-white hover:bg-[#203bd3]'
                  }`}
              >
                Anterior
              </button>

              {generatePageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded-sm ${pageNum === currentPage
                    ? 'bg-[#203bd3] text-white'
                    : 'bg-[#2272FF] text-white hover:bg-[#203bd3]'
                    }`}
                >
                  {pageNum + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={paginationInfo.last}
                className={`px-3 py-1 rounded-sm ${paginationInfo.last
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2272FF] text-white hover:bg-[#203bd3]'
                  }`}
              >
                Siguiente
              </button>

              <button
                onClick={() => handlePageChange(paginationInfo.totalPages - 1)}
                disabled={paginationInfo.last}
                className={`px-3 py-1 rounded-sm ${paginationInfo.last
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2272FF] text-white hover:bg-[#203bd3]'
                  }`}
              >
                Última
              </button>
            </div>
          )}

          {/* Información de paginación */}
          <div className="text-center mt-2 text-sm text-gray-300">
            Página {currentPage + 1} de {paginationInfo.totalPages}
          </div>
        </main>
      </div>
    </>
  );
}

export default Entrevistas