import { useEffect, useState } from "react";
import type { EvaluacionData, UsuarioInfo, JwTPayload } from "../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";
import EvaluacionForm from "./EvaluacionForm";
import PreguntasList from "./PreguntasList";
import PreguntaModal from "./PreguntaModal";
import { actualizarEvaluacion, cargarEvaluacion, cargarUsuario, crearEvaluacion } from "./Helper";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SaveEvaluaciones = () => {

  const navigate = useNavigate();
  const { evaluacionId } = useParams<{ evaluacionId?: string }>();

  const [Usuario, setUsuario] = useState<UsuarioInfo>({
    id: 0,
    nombre: "",
    apellidos: "",
    email: ""
  });

  const [evaluacion, setEvaluacion] = useState<EvaluacionData>({
    id: evaluacionId ? parseInt(evaluacionId) : 0,
    titulo: "",
    descripcion: "",
    tags: "",
    mentorId: 0,
    preguntas: []
  });

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const token = localStorage.getItem('token');
  const decoded = jwtDecode<JwTPayload>(token || "");

  if (!token || !decoded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Acceso Denegado</h2>
          <p>No tienes autorización para acceder a esta página</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchUsuario = async () => {
      const data = await cargarUsuario(decoded.email, token);
      setUsuario(data);
      setEvaluacion(prev => ({ ...prev, mentorId: data.id }));
      if (evaluacionId) {
        const evaluacionCargada = await cargarEvaluacion(parseInt(evaluacionId), token)
        if(!evaluacionCargada){
          console.error("Error al cargar la evaluación");
          navigate('/mentor/evaluaciones');
          return;
        }
        setEvaluacion({
          id: evaluacionCargada.id,
          titulo: evaluacionCargada.titulo,
          descripcion: evaluacionCargada.descripcion,
          tags: evaluacionCargada.tags,
          mentorId: data.id,
          preguntas: evaluacionCargada.preguntas || []
        })
      }
    };
    fetchUsuario();
  }, []);

  // Función para calcular el total de puntos
  const calcularTotalPuntos = () => {
    return evaluacion.preguntas.reduce((total, pregunta) => total + (pregunta.valor || 0), 0);
  };

  // Función para calcular puntos disponibles
  const calcularPuntosDisponibles = () => {
    return 20 - calcularTotalPuntos();
  };

  const handleInputChange = (field: keyof EvaluacionData, value: string) => {
    setEvaluacion(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (index?: number) => {
    setEditingIndex(index ?? null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
  };

  const showMessageModasl = (message: string, tipo: 'success' | 'error' | 'warning' | 'info' | 'question') => {
    Swal.fire({
      title: tipo === 'success' ? 'Éxito' : 'Error',
      text: message,
      icon: tipo,
      confirmButtonText: 'Aceptar'
    });
  }

  const handleSavePregunta = (pregunta: any) => {
    const totalActual = calcularTotalPuntos();
    const valorPreguntaOriginal = editingIndex !== null ? evaluacion.preguntas[editingIndex].valor : 0;
    const nuevoTotal = totalActual - valorPreguntaOriginal + pregunta.valor;

    // Validar que no exceda los 20 puntos
    if (nuevoTotal > 20) {
      const puntosDisponibles = 20 - (totalActual - valorPreguntaOriginal);
      showMessageModasl(`No se puede agregar esta pregunta. Solo tienes ${puntosDisponibles} puntos disponibles. La suma total debe ser exactamente 20 puntos.`, 'warning');
      return;
    }

    if (nuevoTotal < 1) {
      const puntosDisponibles = 20 - (totalActual - valorPreguntaOriginal);
      showMessageModasl(`No se puede agregar esta pregunta. Debes asignar al menos 1 punto. Actualmente tienes ${puntosDisponibles} puntos disponibles.`, 'warning');
      return;
    }

    if (editingIndex !== null) {
      setEvaluacion(prev => ({
        ...prev,
        preguntas: prev.preguntas.map((p, i) => i === editingIndex ? pregunta : p)
      }));
    } else {
      setEvaluacion(prev => ({
        ...prev,
        preguntas: [...prev.preguntas, pregunta]
      }));
    }
    closeModal();
  };

  const removePregunta = (index: number) => {
    setEvaluacion(prev => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!evaluacion.titulo.trim() || !evaluacion.descripcion.trim() || !evaluacion.tags.trim()) {
      showMessageModasl("Por favor complete todos los campos requeridos", 'warning');
      return;
    }

    if (evaluacion.preguntas.length === 0) {
      showMessageModasl("Debe agregar al menos una pregunta a la evaluación", 'warning');
      return;
    }

    const totalPuntos = calcularTotalPuntos();
    if (totalPuntos !== 20) {
      showMessageModasl(`La suma total de puntos debe ser exactamente 20. Actualmente tiene ${totalPuntos} puntos.`, 'warning');
      return;
    }

    try {
      if (evaluacionId!== undefined) {
        await actualizarEvaluacion(evaluacion, token)
        showMessageModasl("Evaluación actualizada correctamente", 'success');
        navigate('/mentor/evaluaciones');
      } else {
        await crearEvaluacion(evaluacion, token)
        showMessageModasl("Evaluación creada correctamente", 'success');
        navigate('/mentor/evaluaciones');
      }
    } catch (error) {
      console.error("Error:", error);
      showMessageModasl("Ocurrió un error al guardar la evaluación. Por favor, inténtelo de nuevo más tarde.", 'error');
    } finally {
      limpiarFormulario();
    }
  };

  const limpiarFormulario = () => {
    setEvaluacion({
      titulo: "",
      descripcion: "",
      tags: "",
      mentorId: Usuario.id,
      preguntas: []
    });
  }

  const totalPuntos = calcularTotalPuntos();
  const puntosDisponibles = calcularPuntosDisponibles();

  return (
    <div className=" mx-auto mt-4 p-6 bg-[#383b3f]">
      <h1 className="text-2xl font-bold mb-6 text-[#F8F9FA]">Crear Evaluación</h1>

      <EvaluacionForm
        evaluacion={evaluacion}
        onInputChange={handleInputChange}
      />

      {/* Indicador de puntos */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold">Total de puntos: </span>
            <span className={`text-lg font-bold ${totalPuntos === 20 ? 'text-green-600' : totalPuntos > 20 ? 'text-red-600' : 'text-orange-600'}`}>
              {totalPuntos}/20
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Puntos disponibles: </span>
            <span className={`text-sm font-medium ${puntosDisponibles === 0 ? 'text-green-600' : 'text-blue-600'}`}>
              {puntosDisponibles}
            </span>
          </div>
        </div>
        {totalPuntos !== 20 && (
          <div className="mt-2 text-sm text-gray-600">
            {totalPuntos < 20 ?
              `Necesitas agregar ${20 - totalPuntos} puntos más para completar la evaluación.` :
              `Has excedido por ${totalPuntos - 20} puntos. Reduce el valor de algunas preguntas.`
            }
          </div>
        )}
      </div>

      <PreguntasList
        preguntas={evaluacion.preguntas}
        onAddPregunta={() => openModal()}
        onEditPregunta={openModal}
        onRemovePregunta={removePregunta}
      />

      <div className="flex gap-4">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Regresar
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {evaluacionId ? "Actualizar Evaluación" : "Crear Evaluación"}
        </button>
      </div>

      {showModal && (
        <PreguntaModal
          pregunta={editingIndex !== null ? evaluacion.preguntas[editingIndex] : undefined}
          isEditing={editingIndex !== null}
          onSave={handleSavePregunta}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SaveEvaluaciones;