import Button from "../../components/Button";
import Enlace from "../../components/Enlace";
import { IconPhStudentDuotone } from "../../components/icons/IconPhStudentDuotone ";


export default function SideBar() {
  return (
    <>
      <div className="w-64 h-screen border-r shadow-sm flex flex-col justify-between bg-[#1D1D1D]">
        <div>
          <div className="flex flex-col items-center py-6 border-b">
            <IconPhStudentDuotone className="size-14 text-white" />
            <p className="text-sm font-semibold text-center text-white">Oscar Yalico Espinoza</p>
            <p className="text-xs text-gray-100 text-center">osyalicoe@ucvirtual.edu.pe</p>
          </div>

          <div className="flex flex-col px-4 py-4 space-y-2">
            <Enlace enlace="/estudiante/evaluaciones">
              Evaluaciones
            </Enlace>
            <Enlace enlace="/estudiante/entrevistas">
              Entrevistas
            </Enlace>
            <Enlace enlace="/estudiante/resultados">
              Mis Resultados
            </Enlace>
            <Enlace enlace="/estudiante/progreso">
              Mi Progreso
            </Enlace>
          </div>
        </div>

        <div className="px-4 py-4">
          <Button>
            <span className="text-sm font-semibold">Cerrar Sesión</span>
          </Button>
        </div>
      </div>
    </>
  )
}
