import { useEffect, useState } from "react";
import type { EvaluacionData, UsuarioInfo } from "../../../../interfaces/interfaces";
import { decodeJWT } from "./decodeJWT";
import EvaluacionForm from "./EvaluacionForm";
import PreguntasList from "./PreguntasList";
import PreguntaModal from "./PreguntaModal";

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
  const decoded = token ? decodeJWT(token) : null;

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
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/usuarios/usuarioByEmail?email=${decoded.email}`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("Error al obtener el usuario:", response);
        return;
      }
      
      const data = await response.json();
      setUsuario(data);
      setEvaluacion(prev => ({ ...prev, mentorId: data.id }));
    } catch (error) {
      console.error("Error:", error);
    }
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

    try {
      const response = await fetch('http://localhost:8080/api/evaluaciones/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluacion)
      });

      console.log(evaluacion);

      if (response.ok) {
        const result = await response.json();
        alert("Evaluación creada exitosamente");
        console.log(result);
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Crear Evaluación</h1>
      
      <EvaluacionForm 
        evaluacion={evaluacion}
        onInputChange={handleInputChange}
      />

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