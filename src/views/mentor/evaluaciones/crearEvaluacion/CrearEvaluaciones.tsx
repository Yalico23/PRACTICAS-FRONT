import { useEffect, useState } from "react";
import type { EvaluacionData, UsuarioInfo, JwTPayload } from "../../../../interfaces/interfaces";
import { jwtDecode } from "jwt-decode";
import EvaluacionForm from "./EvaluacionForm";
import PreguntasList from "./PreguntasList";
import PreguntaModal from "./PreguntaModal";
import { cargarUsuario } from "./Helper";

const CrearEvaluaciones = () => {
  const [Usuario, setUsuario] = useState<UsuarioInfo>({
    id: 0,
    nombre: "",
    apellidos: "",
    email: ""
  });

  const [evaluacion, setEvaluacion] = useState<EvaluacionData>({
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

  const handleSavePregunta = (pregunta: any) => {
    const totalActual = calcularTotalPuntos();
    const valorPreguntaOriginal = editingIndex !== null ? evaluacion.preguntas[editingIndex].valor : 0;
    const nuevoTotal = totalActual - valorPreguntaOriginal + pregunta.valor;

    // Validar que no exceda los 20 puntos
    if (nuevoTotal > 20) {
      const puntosDisponibles = 20 - (totalActual - valorPreguntaOriginal);
      alert(`No se puede agregar esta pregunta. Solo tienes ${puntosDisponibles} puntos disponibles. La suma total debe ser exactamente 20 puntos.`);
      return;
    }

    if (nuevoTotal < 1) {
      const puntosDisponibles = 20 - (totalActual - valorPreguntaOriginal);
      alert(`No se puede agregar esta pregunta. Debes asignar al menos 1 punto. Actualmente tienes ${puntosDisponibles} puntos disponibles.`);
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
      alert("Por favor complete todos los campos requeridos");
      return;
    }

    if (evaluacion.preguntas.length === 0) {
      alert("Debe agregar al menos una pregunta");
      return;
    }

    const totalPuntos = calcularTotalPuntos();
    if (totalPuntos !== 20) {
      alert(`La suma total de puntos debe ser exactamente 20. Actualmente tiene ${totalPuntos} puntos.`);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/evaluaciones/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluacion)
      });

      if (response.ok) {
        alert("Evaluación creada exitosamente");
        setEvaluacion({
          titulo: "",
          descripcion: "",
          tags: "",
          mentorId: Usuario.id,
          preguntas: []
        });
      } else {
        alert("Error al crear la evaluación");
        console.error(response)
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    }
  };

  const totalPuntos = calcularTotalPuntos();
  const puntosDisponibles = calcularPuntosDisponibles();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Crear Evaluación</h1>

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
          Crear Evaluación
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

export default CrearEvaluaciones;