import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { JwTPayload, listEvalaciones } from "../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";
import { alertasSweet } from "./Alertas";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../../components/Spinner";

// Interfaz para la respuesta paginada
interface PaginatedResponse {
  content: listEvalaciones[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

const EvaluaionesMentor = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [Evaluaciones, setEvaluaciones] = useState<listEvalaciones[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    first: true,
    last: true
  });

  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem('token');

  if (!token) {
    console.error("Error en obtener el token");
    return;
  }

  const decoded = jwtDecode<JwTPayload>(token);

  useEffect(() => {
    cargarEvaluaciones();
  }, [currentPage, pageSize, filter]);

  const cargarEvaluaciones = async () => {
    try {
      setLoading(true);

      // Construir URL con parámetros
      const params = new URLSearchParams({
        emailMentor: decoded.email,
        page: currentPage.toString(),
        size: pageSize.toString()
      });

      // Agregar filtro solo si existe
      if (filter.trim()) {
        params.append('filter', filter.trim());
      }

      const response = await fetch(`${import.meta.env.VITE_HOST_BACKEND}/api/evaluaciones/listPageableById?${params}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("Error al obtener las evaluaciones:", response);
        return;
      }

      const data: PaginatedResponse = await response.json();
      setEvaluaciones(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        pageSize: data.size,
        first: data.first,
        last: data.last
      });
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

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
          const URL: string = `${import.meta.env.VITE_HOST_BACKEND}/api/evaluaciones/cambiarEstado?idEvaluacion=${id}&estadoPrevio=${preEstado}`;
          const response = await fetch(URL, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json; charset=UTF-8',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!response.ok) {
            console.error("Error al cambiar el estado:", response);
            return;
          }
          await cargarEvaluaciones();
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });
  };

  const actualizarEvaluacion = (id: number) => {
    navigate(`/mentor/evaluaciones/editar/${id}`);
  };

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
          const URL: string = `${import.meta.env.VITE_HOST_BACKEND}/api/evaluaciones/eliminarEvaluacion?idEvaluacion=${id}`;
          const response = await fetch(URL, {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json; charset=UTF-8',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            let errorMessage = "Error al eliminar la evaluación";
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

          if (response.status === 204) {
            alertasSweet("Éxito", "Evaluación eliminada correctamente", "success");
            await cargarEvaluaciones();
            return;
          }

          alertasSweet("Éxito", "Evaluación eliminada correctamente", "success");
          const newData = Evaluaciones.filter(item => item.id !== id);
          setEvaluaciones(newData);

        } catch (error) {
          console.error("Error:", error);
          alertasSweet("Error", "Error de conexión al servidor", "error");
        }
      }
    });
  };

  // Generar números de página para la paginación
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

  return (
    <>
      <div className="flex justify-between items-center mt-10">
        <Link
          to={"/mentor/evaluaciones/crear"}
          className="inline-block bg-[#2272FF] text-white p-2 rounded-sm hover:bg-[#203bd3] transition"
        >
          Crear Evaluación
        </Link>

        {/* Buscador */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2272FF]"
            />
            <button
              type="submit"
              className="bg-[#28A745] text-white px-4 py-2 rounded-sm hover:bg-[#218838] transition"
            >
              Buscar
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
              <option value={50}>50</option>
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
                <th scope="col" className="px-6 py-3 text-center">Id</th>
                <th scope="col" className="px-6 py-3 text-center">Nombre</th>
                <th scope="col" className="px-6 py-3 text-center">Descripción</th>
                <th scope="col" className="px-6 py-3 text-center">Estado</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-[#F8F9FA] border-b dark:border-gray-700 border-gray-200 ">
              {Evaluaciones.length > 0 ? (
                Evaluaciones.map(evaluacion => (
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
                      <button
                        className="bg-[#FFC107] text-white font-bold rounded-sm p-2 hover:bg-[#e0a800] transition"
                        onClick={() => actualizarEvaluacion(evaluacion.id)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-[#DC3545] text-white font-bold rounded-sm p-2 hover:bg-[#c82333] transition"
                        onClick={() => eliminarEvaluacion(evaluacion.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="bg-sky-600 text-white font-bold rounded-sm p-2 hover:bg-sky-700 transition"
                        onClick={() => cambiaEstadoEvalucion(evaluacion.id, evaluacion.activo)}
                      >
                        {evaluacion.activo ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
    </>
  );
};

export default EvaluaionesMentor;