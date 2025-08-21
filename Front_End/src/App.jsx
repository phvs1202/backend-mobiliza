import { BrowserRouter, Routes, Route } from "react-router-dom";
import Relatorios from "./pages/GerenciaADM/TelaRelatorios/Relatorios";
import HomeUsuario from "./pages/UsuarioComum/HomeUsuario/HomeUsuario";
import Login from "./pages/GerenciaADM/Login/Login";
import Grafico from "./pages/GerenciaADM/TelaRelatorios/paginaGrafico";
import LoginQRCode from "./pages/GerenciaADM/QRCode/LoginQRCode/LoginQRCode";
import QRReader from "./pages/GerenciaADM/QRCode/QRReader/QRReader";
import FormLoginCadastro from "./pages/UsuarioComum/FormLoginCadastro/FormLoginCadastro";
import TelaPerfil from "./pages/UsuarioComum/TelaPerfil/TelaPerfil";
import TermosECondicoes from "./pages/UsuarioComum/TermosECondicoes/TermosECondicoes";
import PoliticaDePrivacidade from "./pages/UsuarioComum/PoliticaDePrivacidade/PoliticaDePrivacidade";
import Contato from "./pages/UsuarioComum/Contato/Contato";
import CadastroAdm from "./pages/GerenciaADM/TelaRelatorios/CadastroAdm";
import TelaCursos from "./pages/GerenciaADM/TelaCursos/TelaCursos";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FormLoginCadastro />} />
        <Route path="/home" element={<HomeUsuario />} />
        <Route path="/user-profile" element={<TelaPerfil />} />
        <Route path="/login-gerencia" element={<Login />} />
        <Route path="/qrcode" element={<LoginQRCode />} />
        <Route path="/qrcode-reader" element={<QRReader />} />
        <Route path="/veiculos" element={<Relatorios />} />
        <Route path="/grafico-gerencia" element={<Grafico />} />
        <Route path="/termos" element={<TermosECondicoes />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidade />} />
        <Route path="/contatos" element={<Contato />} />
        <Route path="/cadastrar-gerencia" element={<CadastroAdm />} />
        <Route path="/gerenciar-cursos" element={<TelaCursos />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
