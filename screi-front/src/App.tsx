import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout, { Inicio, SoPerfil } from './components/Layout'
import { AuthProvider, AvisoProvider } from './contexto'
import CadastroDetalhe from './pages/CadastroDetalhe'
import CadastroFormulario from './pages/CadastroFormulario'
import Entrar from './pages/Entrar'
import Exportacao from './pages/Exportacao'
import MeusCadastros from './pages/MeusCadastros'
import TodosCadastros from './pages/TodosCadastros'
import TriagemFila from './pages/TriagemFila'

export default function App() {
  return (
    <AuthProvider>
      <AvisoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/entrar" element={<Entrar />} />
            <Route path="/criar-conta" element={<Entrar />} />

            <Route element={<Layout />}>
              <Route index element={<Inicio />} />

              {/* Telas do responsável (CadastroController) */}
              <Route element={<SoPerfil perfil="RESPONSAVEL" />}>
                <Route path="cadastros" element={<MeusCadastros />} />
                <Route path="cadastros/novo" element={<CadastroFormulario />} />
                <Route path="cadastros/:id/editar" element={<CadastroFormulario />} />
                <Route path="cadastros/:id" element={<CadastroDetalhe modo="responsavel" />} />
              </Route>

              {/* Telas do funcionário (TriagemController e ExportacaoController) */}
              <Route element={<SoPerfil perfil="FUNCIONARIO" />}>
                <Route path="triagem" element={<TriagemFila />} />
                <Route path="triagem/:id" element={<CadastroDetalhe modo="triagem" />} />
                <Route path="todos" element={<TodosCadastros />} />
                <Route path="exportacao" element={<Exportacao />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AvisoProvider>
    </AuthProvider>
  )
}
