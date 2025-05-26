import {BrowserRouter, Routes, Route} from 'react-router-dom'
import CompartiPantalla from './views/compartiPantalla'
import MainLayout from './layouts/estudiante/MainLayout'
import Evaluaciones from './views/estudiante/evaluaciones/Evaluaciones'
import Entrevistas from './views/estudiante/Entrevistas'
import Resultados from './views/estudiante/Resultados'
import Progreso from './views/estudiante/Progreso'
import Evaluacion from './views/estudiante/evaluaciones/Evaluacion'

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path='/estudiante/evaluaciones'  element={<Evaluaciones />} index />
                    <Route path='/estudiante/evaluacion/:evaluacionId'  element={<Evaluacion />} />
                    <Route path='/estudiante/entrevistas' element={<Entrevistas />} />
                    <Route path='/estudiante/resultados' element={<Resultados />} />
                    <Route path='/estudiante/progreso' element={<Progreso />} />
                </Route>
                <Route path='/compartirPantalla' element={<CompartiPantalla/>} />
            </Routes>
        </BrowserRouter>
    )
}