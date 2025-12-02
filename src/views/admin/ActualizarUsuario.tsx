import { useEffect, useState, type ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';

interface Usuario {
    id: number | null;
    nombre: string;
    apellidos: string;
    email: string;
    mentor  : boolean;
    habilitado: boolean;    
}

export const ActualizarUsuario = () => {
    const { usuarioId } = useParams();
    const token = localStorage.getItem('token') || '';

    const [formData, setFormData] = useState<Usuario>({
        id: null,
        nombre: '',
        apellidos: '',
        email: '',
        mentor: false,
        habilitado: false,
    });

    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ======================================================
    // 1. Cargar usuario
    // ======================================================
    useEffect(() => {
        if (usuarioId) listUsuario(Number(usuarioId));
    }, [usuarioId]);

    const listUsuario = async (id: number) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/listarUsuario/${id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                console.error('[ERROR] No se pudo obtener usuario.');
                return;
            }

            const data = await response.json();

            const esMentor = data.roles?.[0]?.nombre === 'ROLE_MENTOR';

            setFormData({
                id: data.id,
                nombre: data.nombre,
                apellidos: data.apellidos,
                email: data.email,
                mentor: esMentor,
                habilitado: data.habilitado,
            });

        } catch (error) {
            console.error('Error al obtener el usuario:', error);
        }
    };

    // ======================================================
    // 2. Manejador de cambios
    // ======================================================
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        if (errors.length > 0) setErrors([]);
    };

    // ======================================================
    // 3. Actualizar usuario (sin contraseña)
    // ======================================================
    const handleSubmit = async () => {
        setLoading(true);
        setErrors([]);
        setSuccess(false);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_HOST_BACKEND}/api/usuarios/update/${formData.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData), // 🔥 sin password
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                setErrors(errorData.details || [errorData.message]);
                return;
            }

            setSuccess(true);
            console.log('[INFO] Usuario actualizado exitosamente');
        } catch (error) {
            setErrors(['Error de conexión. Por favor, intenta de nuevo.']);
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // 4. Render
    // ======================================================
    return (
        <div className="bg-zinc-900 flex items-center justify-center p-4">
            <div className="w-full">
                <div className="bg-[#1D1D1D] rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Actualizar Usuario</h2>
                    <p className="text-gray-400 mb-8">
                        Modifica la información del usuario seleccionado.
                    </p>

                    {errors.length > 0 && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            {errors.map((error, index) => (
                                <p
                                    key={index}
                                    className="text-red-400 text-sm flex items-start gap-2"
                                >
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{error}</span>
                                </p>
                            ))}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <p className="text-green-400 text-sm">
                                ✓ Usuario actualizado correctamente
                            </p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Nombre */}
                        <div className="flex items-center">
                            <label className="w-[6rem] text-sm font-medium text-gray-300">
                                Nombre
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>

                        {/* Apellidos */}
                        <div className="flex items-center">
                            <label className="w-[6rem] text-sm font-medium text-gray-300">
                                Apellidos
                            </label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>

                        {/* Email */}
                        <div className="flex items-center">
                            <label className="w-[6rem] text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>

                        {/* Mentor */}
                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                name="mentor"
                                checked={formData.mentor}
                                onChange={handleChange}
                                className="w-5 h-5 cursor-pointer"
                            />
                            <label className="text-sm font-medium text-gray-300 cursor-pointer">
                                Registrar como mentor
                            </label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a 8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        ></path>
                                    </svg>
                                    Actualizando...
                                </>
                            ) : (
                                'Actualizar Usuario'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
