import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Evaluaciones from './views/estudiante/evaluaciones/evaluaciones/Evaluaciones'
import Entrevistas from './views/estudiante/entrevistas/Entrevistas'
import Progreso from './views/estudiante/progreso/Progreso'
import MainLayoutEstudiante from './layouts/estudiante/MainLayoutEstudiante'
import MainLayoutMentor from './layouts/mentor/MainLayoutMentor'
import EvaluaionesMentor from './views/mentor/evaluaciones/listaEvaluaciones/EvaluaionesMentor'
import EvaluacionesMentorPendientes from './views/mentor/evaluaciones/evaluacionesPendientes/EvaluacionesMentorPendientes'
import EntrevistasMentor from './views/mentor/entrevistas/entrevistas/EntrevistasMentor'
import EntrevistasMentorPendientes from './views/mentor/entrevistas/entrevistasPendientes/EntrevistasMentorPendientes'
import ResultadosMentor from './views/mentor/resultados/ResultadosMentor'
import Login from './views/inicio/Login'
import RecuperarPassword from './views/inicio/RecuperarPassword'
import Index from './views/inicio/Index'
import { ProtectedRoute, PublicRoute } from './auth/ProtectedRoute'
import RestablecerPassword from './views/inicio/RestablecerPassword'
import DarEvaluacion from './views/estudiante/evaluaciones/evaluacion/DarEvaluacion'
import GraciasEvaluacion from './views/estudiante/evaluaciones/evaluacion/GraciasEvaluacion'
import SaveEvaluaciones from './views/mentor/evaluaciones/saveEvaluacion/SaveEvaluaciones'
import EvaluacionesEstudiantes from './views/mentor/evaluaciones/evaluacionesPendientes/EvaluacionesEstudiantes'
import EvaluarEstudiante from './views/mentor/evaluaciones/evaluacionesPendientes/EvaluarEstudiante.tsx/EvaluarEstudiante'
import SaveEntrevista from './views/mentor/entrevistas/entrevistas/saveEntrevista/SaveEntrevista'
import DarEntrevista from './views/estudiante/entrevistas/entrevista/DarEntrevista'
import EntrevistaPendiente from './views/mentor/entrevistas/entrevistasPendientes/EntrevistaPendiente'
import ResultadoEvaluacion from './views/estudiante/evaluaciones/resultado/ResultadoEvaluacion'
import ResultadoEntrevista from './views/estudiante/entrevistas/resultados/ResultadoEntrevista'
import MainLayoutAdmin from './layouts/admin/MainLayoutAdmin'
import { CrearUsuario } from './views/admin/CrearUsuario'
import ListarUsuarios from './views/admin/ListarUsuarios'
import { ActualizarUsuario } from './views/admin/ActualizarUsuario'

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas - solo para usuarios no autenticados */}
                <Route path='/' element={
                    <PublicRoute>
                        <Index />
                    </PublicRoute>
                } index />

                <Route path='/login' element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />

                <Route path='/olvide-password' element={
                    <PublicRoute>
                        <RecuperarPassword />
                    </PublicRoute>
                } />

                <Route path='/restablecer-password' element={
                    <PublicRoute>
                        <RestablecerPassword />
                    </PublicRoute>
                } />

                {/* Rutas protegidas para estudiantes */}

                <Route element={
                    <ProtectedRoute allowedRoles={['ROLE_ESTUDIANTE']}>
                        <MainLayoutEstudiante />
                    </ProtectedRoute>
                }>
                    <Route path='/estudiante/evaluaciones' element={<Evaluaciones />} />
                    <Route path='/estudiante/entrevistas' element={<Entrevistas />} />
                    <Route path='/estudiante/entrevista/:entrevistaId' element={<DarEntrevista />} />
                    <Route path='/estudiante/progreso' element={<Progreso />} />
                    <Route path='/estudiante/resultados/:idEstudiante/:idEvaluacion' element={<ResultadoEvaluacion />} />
                    <Route path='/estudiante/resultadosEntrevista/:idEstudiante/:idEntrevista' element={<ResultadoEntrevista />} />
                </Route>

                { /** Fuera del sideBar */}
                <Route path='/estudiante/evaluacion/:evaluacionId' element={
                    <ProtectedRoute allowedRoles={['ROLE_ESTUDIANTE']}>
                        <DarEvaluacion />
                    </ProtectedRoute>
                } />

                <Route path='/componentesPrueba' element={<GraciasEvaluacion />} />

                {/* Rutas protegidas para mentores */}
                <Route element={
                    <ProtectedRoute allowedRoles={['ROLE_MENTOR']}>
                        <MainLayoutMentor />
                    </ProtectedRoute>
                }>
                    <Route path='/mentor/evaluaciones' element={<EvaluaionesMentor />} />
                    <Route path='/mentor/evaluaciones/crear' element={<SaveEvaluaciones />} />
                    <Route path='/mentor/evaluaciones/editar/:evaluacionId' element={<SaveEvaluaciones />} />
                    <Route path='/mentor/evaluaciones/pendientes' element={<EvaluacionesMentorPendientes />} />
                    <Route path='/mentor/evaluacicones/pendientes/:idEvaluacion/:titulo'
                        element={<EvaluacionesEstudiantes />} />
                    <Route path='/mentor/evaluaciones/:idEvaluacion/:idEvaluacionEstudiante/evaluar'
                        element={<EvaluarEstudiante />} />

                    <Route path='/mentor/entrevistas' element={<EntrevistasMentor />} />
                    <Route path='/mentor/entrevista/crear' element={<SaveEntrevista />} />
                    <Route path='/mentor/entrevista/editar/:entrevistaId' element={<SaveEntrevista />} />
                    <Route path='/mentor/entrevista/revisar/:idEntrevista/:titulo' element={<EntrevistasMentorPendientes />} />
                    <Route path='/mentor/entrevista/calificar/:idEntrevista' element={<EntrevistaPendiente />} />
                    <Route path='/mentor/resultados' element={<ResultadosMentor />} />
                </Route>

                {/* Rutas protegidas para ADMIN */}
                <Route element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <MainLayoutAdmin />
                    </ProtectedRoute>
                }>
                    <Route path='/admin/inicio' element={<CrearUsuario />} />
                    <Route path='/admin/usuarios' element={<ListarUsuarios />} />
                    <Route path='/admin/usuarios/actualizar/:usuarioId' element={<ActualizarUsuario />} />
                </Route>

                {/* Ruta catch-all para 404 */}
                <Route path='*' element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}