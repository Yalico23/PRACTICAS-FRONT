import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { JwTPayload } from "../../../estudiante/entrevistas/Types";
import type { PaginatedResponse, ListaEntrevistas } from "./Types";
import Spinner from "../../../../components/Spinner";

const EntrevistasMentorPendientes = () => {
  const navigate = useNavigate();
  const { idEntrevista } = useParams();

  const [loading, setLoading] = useState(true);
  const [entrevistas, setEntrevistas] = useState<ListaEntrevistas[]>([]);

  const [paginationInfo, setPaginationInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10,
    first: true,
    last: true,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const decoded = jwtDecode<JwTPayload>(token || "");

  useEffect(() => {
    listarEntrevistasPendientes();
  }, [currentPage, pageSize, filter]);

  const listarEntrevistasPendientes = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams([
        ["idEntrevista", idEntrevista ?? ""],
        ["page", currentPage.toString()],
        ["size", pageSize.toString()],
      ]);

      if (filter.trim()) {
        params.append("filter", filter.trim());
      }

      const response = await fetch(
        `${import.meta.env.VITE_HOST_BACKEND}/api/entrevistaEstudiante/entrevistasPendientes?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data: PaginatedResponse = await response.json();

      setEntrevistas(data.content);
      setPaginationInfo({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.number,
        pageSize: data.size,
        first: data.first,
        last: data.last,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching entrevistas pendientes:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter(searchTerm);
    setCurrentPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
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
    let endPage = Math.min(
      paginationInfo.totalPages - 1,
      startPage + maxVisiblePages - 1
    );

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleRevisarEntrevista = (idEntrevistaEstudiante: number) => {
    navigate(`/mentor/entrevista/calificar/${idEntrevistaEstudiante}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar entrevista..."
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
            Mostrando {paginationInfo.currentPage * paginationInfo.pageSize + 1}{" "}
            a{" "}
            {Math.min(
              (paginationInfo.currentPage + 1) * paginationInfo.pageSize,
              paginationInfo.totalElements
            )}{" "}
            de {paginationInfo.totalElements} entrevistas
            {filter && (
              <span className="ml-2 font-medium">- Filtrado por: "{filter}"</span>
            )}
          </div>
        </div>

        <div className="relative overflow-x-auto shadow-md">
          <table className="w-full text-sm text-left rtl:text-right text-[#1D1D1D]">
            <thead className="text-xs text-[#1D1D1D] uppercase bg-[#E9ECEF]">
              <tr>
                <th scope="col" className="px-6 py-3 text-center">
                  Id
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Estudiante
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#F8F9FA] border-b border-gray-200 ">
              {entrevistas.length > 0 ? (
                entrevistas.map((entrevista) => (
                  <tr key={entrevista.idEntrevistaEstudiante}>
                    <td className="px-6 py-4 text-center font-bold">
                      {entrevista.idEntrevistaEstudiante}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {entrevista.nombreEstudiante}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {entrevista.notaFinal === 0 ? (
                        <span className="p-2 rounded-md bg-[#FFC107] text-[#2D2D2D] font-bold">
                          Pendiente
                        </span>
                      ) : (
                        <span className="p-2 rounded-md bg-[#28A745] text-white font-bold">
                          Revisado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex gap-3 justify-center items-center">
                      {entrevista.notaFinal === 0 && (
                        <button
                          className="bg-green-500 text-white font-bold rounded-sm p-2 hover:bg-green-700 transition"
                          onClick={() =>
                            handleRevisarEntrevista(entrevista.idEntrevistaEstudiante)
                          }
                        >
                          Revisar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {filter
                      ? `No se encontraron entrevistas que contengan "${filter}"`
                      : "No hay entrevistas disponibles"}
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
              className={`px-3 py-1 rounded-sm ${
                paginationInfo.first
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2272FF] text-white hover:bg-[#203bd3]"
              }`}
            >
              Primera
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={paginationInfo.first}
              className={`px-3 py-1 rounded-sm ${
                paginationInfo.first
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2272FF] text-white hover:bg-[#203bd3]"
              }`}
            >
              Anterior
            </button>

            {generatePageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-sm ${
                  pageNum === currentPage
                    ? "bg-[#203bd3] text-white"
                    : "bg-[#2272FF] text-white hover:bg-[#203bd3]"
                }`}
              >
                {pageNum + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={paginationInfo.last}
              className={`px-3 py-1 rounded-sm ${
                paginationInfo.last
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2272FF] text-white hover:bg-[#203bd3]"
              }`}
            >
              Siguiente
            </button>

            <button
              onClick={() => handlePageChange(paginationInfo.totalPages - 1)}
              disabled={paginationInfo.last}
              className={`px-3 py-1 rounded-sm ${
                paginationInfo.last
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-[#2272FF] text-white hover:bg-[#203bd3]"
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

export default EntrevistasMentorPendientes;
