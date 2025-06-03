import { Link } from "react-router-dom";

const EvaluaionesMentor = () => {
  return (
    <>
      <Link
        to={"/mentor/evaluaciobes/crear"}
        className="mt-6 inline-block bg-[#2272FF] text-white p-2 rounded-xl hover:bg-[#203bd3] transition"
      >
        Crear Evaluación
      </Link>
    </>
  );
};

export default EvaluaionesMentor;
