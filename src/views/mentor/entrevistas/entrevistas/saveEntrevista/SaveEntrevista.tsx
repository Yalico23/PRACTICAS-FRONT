import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EntrevistaForm from "./EntrevistaForm";
import type { EntrevistaData, Pregunta } from "./types";
import PreguntasList from "./PreguntasList";
import type { JwTPayload, UsuarioInfo } from "../../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import PreguntaModal from "./PreguntaModal";
import { actualizarEntrevista, cargarEntrevista, cargarUsuario, crearEntrevista } from "./Helpers";

const SaveEntrevista = () => {
  const navigate = useNavigate();
  const { entrevistaId } = useParams<{ entrevistaId?: string }>();

  const [Usuario, setUsuario] = useState<UsuarioInfo>();

  const [entrevista, setEntrevista] = useState<EntrevistaData>({
    id: entrevistaId ? parseInt(entrevistaId) : 0,
    titulo: "",
    descripcion: "",
    mentor: { id: 0 },
    preguntas: []
  });

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const token = localStorage.getItem('token') || "";
  const decoded = jwtDecode<JwTPayload>(token || "");

  useEffect(() => {
    const fetchUsuario = async () => {
      const data = await cargarUsuario(decoded.email, token);
      setUsuario(data);
      setEntrevista(prev => ({ ...prev, mentor: { id: data.id } }));
      if(entrevistaId){
        const entrevistaCargada = await cargarEntrevista(parseInt(entrevistaId), token);
        setEntrevista(prev => ({ ...prev, ...entrevistaCargada }));
        if (!entrevistaCargada) {
          console.error("Error al cargar la entrevista");
          navigate('/mentor/entrevistas');
          return;
        }
      }
    }
    fetchUsuario();
  },[])

  const handleInputChange = (field: keyof EntrevistaData, value: string) => {
    setEntrevista(prev => ({ ...prev, [field]: value }));
  };

  const openModal = (index?: number) => {
    setEditingIndex(index ?? null);
    setShowModal(true);
  }

  const closeModal = () => {
    setShowModal(false);
    setEditingIndex(null);
  };

  const removePregunta = (index: number) => {
    setEntrevista(prev => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!entrevista.titulo.trim() || !entrevista.descripcion.trim() || entrevista.preguntas.length === 0) {
      showMessageModasl("Por favor, completa todos los campos y agrega al menos una pregunta.", 'warning');
      return;
    }

    if (entrevista.preguntas.length === 0) {
      showMessageModasl("Debes agregar al menos una pregunta a la entrevista.", 'warning');
      return;
    }

    const totalPuntos = calcularTotalPuntos();
    if (totalPuntos !== 20) {
      showMessageModasl("La suma total de puntos debe ser exactamente 20.", 'warning');
      return;
    }

    try {
      if (entrevistaId !== undefined) {
        await actualizarEntrevista(entrevista, token);
        showMessageModasl("Entrevista actualizada correctamente", 'success');
        navigate(-1);
      } else {
        console.log("Entrevista a crear:", entrevista);
        await crearEntrevista(entrevista, token);
        showMessageModasl("Entrevista creada correctamente", 'success');
        navigate(-1);
      }
    } catch (error) {
      console.error("Error al guardar la entrevista:", error);
      showMessageModasl("Error al guardar la entrevista. Por favor, inténtalo de nuevo.", 'error');
    } finally {
      limpiarFormulario();
    }
  }

  const limpiarFormulario = () => {
    setEntrevista({
      id: 0,
      titulo: "",
      descripcion: "",
      mentor: { id: 0 },
      preguntas: []
    });
  };

  const showMessageModasl = (message: string, tipo: 'success' | 'error' | 'warning' | 'info' | 'question') => {
    Swal.fire({
      title: tipo === 'success' ? 'Éxito' : 'Error',
      text: message,
      icon: tipo,
      confirmButtonText: 'Aceptar'
    });
  }

  const handleSavePregunta = (pregunta: Pregunta) => {
    const totalActual = calcularTotalPuntos();
    const valorPreguntaOriginal = editingIndex !== null ? entrevista.preguntas[editingIndex].valor : 0;
    const nuevoTotal = totalActual - valorPreguntaOriginal + pregunta.valor;

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
      setEntrevista(prev => ({
        ...prev,
        preguntas: prev.preguntas.map((p, i) => i === editingIndex ? pregunta : p)
      }));
    } else {
      setEntrevista(prev => ({
        ...prev,
        preguntas: [...prev.preguntas, pregunta]
      }));
    }
    closeModal();
  }


  const calcularTotalPuntos = () => {
    return entrevista.preguntas.reduce((total, pregunta) => total + (pregunta.valor || 0), 0);
  }

  const calcularPuntosDisponibles = () => {
    return 20 - calcularTotalPuntos();
  }

  const totalPuntos = calcularTotalPuntos();
  const puntosDisponibles = calcularPuntosDisponibles();

  return (
    <>
      <div className="mx-auto mt-4 p-6 bg-[#383b3f]">
        <h1 className="text-2xl font-bold mb-6 text-[#F8F9FA]">Crear Entrevista</h1>
        <EntrevistaForm
          entrevista={entrevista}
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
        {/* Preguntas List */}
        <PreguntasList
          preguntas={entrevista.preguntas}
          onAddPregunta={() => openModal()}
          onEditPregunta={openModal}
          onRemovePregunta={removePregunta}
        />

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-500 text-white rounded hiver:bg-gray-600"
          >
            Regresar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {entrevistaId ? "Actualizar Entrevista" : "Crear Entrevista"}
          </button>
        </div>

        {showModal && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <PreguntaModal
                pregunta={editingIndex !== null ? entrevista.preguntas[editingIndex] : undefined}
                isEditing={editingIndex !== null}
                onSave={handleSavePregunta}
                onClose={closeModal}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </>
  );
};

export default SaveEntrevista;
