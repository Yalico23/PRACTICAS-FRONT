import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Evaluaciones from './views/estudiante/evaluaciones/Evaluaciones'
import Entrevistas from './views/estudiante/entrevistas/Entrevistas'
import Resultados from './views/estudiante/resultados/Resultados'
import Progreso from './views/estudiante/progreso/Progreso'
import Evaluacion from './views/estudiante/evaluaciones/Evaluacion'
import Entrevista from './views/estudiante/entrevistas/Entrevista'
import MainLayoutEstudiante from './layouts/estudiante/MainLayoutEstudiante'
import MainLayoutMentor from './layouts/mentor/MainLayoutMentor'
import EvaluaionesMentor from './views/mentor/evaluaciones/EvaluaionesMentor'
import EvaluacionesMentorPendientes from './views/mentor/evaluaciones/EvaluacionesMentorPendientes'
import EntrevistasMentor from './views/mentor/entrevistas/EntrevistasMentor'
import EntrevistasMentorPendientes from './views/mentor/entrevistas/EntrevistasMentorPendientes'
import ResultadosMentor from './views/mentor/resultados/ResultadosMentor'
import Login from './views/inicio/Login'
import RecuperarPassword from './views/inicio/RecuperarPassword'
import Index from './views/inicio/Index'
import { ProtectedRoute, PublicRoute } from './auth/ProtectedRoute'
import RestablecerPassword from './views/inicio/RestablecerPassword'
import CrearEntrevista from './views/mentor/evaluaciones/CrearEvaluaciones'

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
                    <Route path='/estudiante/evaluacion/:evaluacionId' element={<Evaluacion />} />
                    <Route path='/estudiante/entrevistas' element={<Entrevistas />} />
                    <Route path='/estudiante/entrevista/:entrevistaId' element={<Entrevista />} />
                    <Route path='/estudiante/resultados' element={<Resultados />} />
                    <Route path='/estudiante/progreso' element={<Progreso />} />
                </Route>

                {/* Rutas protegidas para mentores */}
                <Route element={
                    <ProtectedRoute allowedRoles={['ROLE_MENTOR']}>
                        <MainLayoutMentor />
                    </ProtectedRoute>
                }>
                    <Route path='/mentor/evaluaciones' element={<EvaluaionesMentor />} />
                    <Route path='/mentor/evaluaciobes/crear' element={<CrearEntrevista />} />
                    <Route path='/mentor/evaluacicones/pendientes' element={<EvaluacionesMentorPendientes />} />
                    <Route path='/mentor/entrevistas' element={<EntrevistasMentor />} />
                    <Route path='/mentor/entrevistas/pendientes' element={<EntrevistasMentorPendientes />} />
                    <Route path='/mentor/resultados' element={<ResultadosMentor />} />
                </Route>

                {/* Ruta catch-all para 404 */}
                <Route path='*' element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}