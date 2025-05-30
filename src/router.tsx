import {BrowserRouter, Routes, Route} from 'react-router-dom'
import CompartiPantalla from './views/compartiPantalla'
import Evaluaciones from './views/estudiante/evaluaciones/Evaluaciones'
import Entrevistas from './views/estudiante/entrevistas/Entrevistas'
import Resultados from './views/estudiante/resultados/Resultados'
import Progreso from './views/estudiante/progreso/Progreso'
import Evaluacion from './views/estudiante/evaluaciones/Evaluacion'
import Entrevista from './views/estudiante/entrevistas/Entrevista'
import MainLayoutEstudiante from './layouts/estudiante/MainLayoutEstudiante'

export default function Router() {
    return(
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayoutEstudiante />}>
                    <Route path='/estudiante/evaluaciones'  element={<Evaluaciones />} index />
                    <Route path='/estudiante/evaluacion/:evaluacionId'  element={<Evaluacion />} />
                    <Route path='/estudiante/entrevistas' element={<Entrevistas />} />
                    <Route path='/estudiante/entrevista/:entrevistaId' element={<Entrevista />} />
                    <Route path='/estudiante/resultados' element={<Resultados />} />
                    <Route path='/estudiante/progreso' element={<Progreso />} />
                </Route>
                
                <Route path='/compartirPantalla' element={<CompartiPantalla/>} />
            </Routes>
        </BrowserRouter>
    )
}