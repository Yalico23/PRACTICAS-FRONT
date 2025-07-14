import { useState } from "react";
import EntrevistaForm from "./EntrevistaForm";
import { useNavigate } from "react-router-dom";
import type { UsuarioInfo } from "../../../../../interfaces/interfaces";

const SaveEntrevista = () => {
  const navigate = useNavigate();
  const [Usuario, setUsuario] = useState<UsuarioInfo>();

  return (
    <>
      <div className="mx-auto mt-4 p-6 bg-[#383b3f]">
        <h1 className="text-2xl font-bold mb-6 text-[#F8F9FA]">Crear Entrevista</h1>
      </div>
      <EntrevistaForm />
    </>
  );
};

export default SaveEntrevista;
