import { useEffect, useState } from "react";
import type { JwTPayload, EvaluacionPendiente, UsuarioInfo } from "../../../../interfaces/interfaces";
import { cargarUsuario, listarEvaluacionesPendientes } from "./Helpers";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const EvaluacionesMentorPendientes = () => {

  const [evaluacionesPendientes, setEvaluacionesPendientes] = useState<EvaluacionPendiente[]>();

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decode = jwtDecode<JwTPayload>(token ?? "");


  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const dataUsuario: UsuarioInfo = await cargarUsuario(decode.email, token ?? "");
        const dataEvaluacionesPendientes = await listarEvaluacionesPendientes(dataUsuario.id, token ?? "");
        setEvaluacionesPendientes(dataEvaluacionesPendientes);
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      }
    }
    fetchUsuario();
  }
    , []);

  const EvaluacionesEstudiantes = (id: number, titulo: string) => {
    navigate(`/mentor/evaluacicones/pendientes/${id}/${titulo}`);
  }

  return (
    <>
      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {evaluacionesPendientes?.map((ep) => (
            <div key={ep.id} className="relative flex w-80 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">

              <div className="relative mx-4 -mt-6 h-40 overflow-hidden rounded-xl bg-clip-border shadow-lg">
                <img src={`/img/${ep.tags}.jpg`} alt="imagen" className="h-full" />
              </div>
              <div className="p-6">
                <h5 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                  {ep.titulo}
                </h5>
                <p className="block font-sans text-base font-light leading-relaxed text-inherit antialiased">
                  {ep.fechaCreacion}
                </p>
              </div>
              <div className="p-6 pt-0">
                <button data-ripple-light="true" type="button" className="select-none rounded-lg bg-blue-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                  onClick={() => EvaluacionesEstudiantes(ep.id, ep.titulo)}
                >
                  Ver evaluciones pendientes
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default EvaluacionesMentorPendientes;
