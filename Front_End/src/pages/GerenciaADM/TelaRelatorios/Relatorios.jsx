import React, { useEffect, useState } from 'react';
import './Relatorios.css';
import Navbar from '../../../components/Navbar/Navbar.jsx';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar.jsx';
import Footer from '../../../components/Footer/Footer.jsx';
import TabelaReaproveitavel from '../../../components/Tabela/Tabela.jsx';
import '../../../components/CSSGeral/CSSGeral.css';
import { useNavigate } from 'react-router-dom';

function Relatorios() {
  const [usuario, setUsuario] = useState(null);

  const [tiposUsuarios, setTiposUsuarios] = useState([]);
  const [dados, setDados] = useState([]);

  // Filtros
  const [searchPlaca, setSearchPlaca] = useState('');
  const [selectedTipoUsuario, setSelectedTipoUsuario] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalMensagem, setModalMensagem] = useState('');
  const [modalTipo, setModalTipo] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const carregarUsuario = () => {
      const usuarioStorage = localStorage.getItem('usuario');
      if (usuarioStorage) {
        const usuarioObj = JSON.parse(usuarioStorage);
        setUsuario(usuarioObj);
      } else {
        navigate('/login-gerencia');
      }
    };
    carregarUsuario();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login-gerencia');
  }

  useEffect(() => {
    async function fetchDados() {
      try {
        // Busca tipos de usuário
        const tiposResponse = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/TipoUsuario/TodosTipos');
        if (!tiposResponse.ok) throw new Error('Erro ao buscar tipos de usuário');
        const tipos = await tiposResponse.json();
        setTiposUsuarios(tipos);

        // Busca todos os dados necessários em paralelo
        const [
          resVeiculos,
          resTipoVeiculos,
          resTiposUsuarios,
          resEntradas,
          resUsuarios
        ] = await Promise.all([
          fetch('https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/TodosVeiculos'),
          fetch('https://mobiliza-gersite-back-end.onrender.com/api/TipoVeiculo/TodosTipos'),
          fetch('https://mobiliza-gersite-back-end.onrender.com/api/TipoUsuario/TodosTipos'),
          fetch('https://mobiliza-gersite-back-end.onrender.com/api/Entrada/TodasEntradas'),
          fetch('https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/TodosUser')
        ]);

        if (
          !resVeiculos.ok ||
          !resTipoVeiculos.ok ||
          !resTiposUsuarios.ok ||
          !resEntradas.ok ||
          !resUsuarios.ok
        ) {
          throw new Error('Erro ao buscar dados');
        }

        const [
          dadosVeiculos,
          dadosTiposVeiculos,
          dadosTiposUsuarios,
          dadosEntradas,
          dadosUsuarios
        ] = await Promise.all([
          resVeiculos.json(),
          resTipoVeiculos.json(),
          resTiposUsuarios.json(),
          resEntradas.json(),
          resUsuarios.json()
        ]);

        // Processa os dados
        const dadosProcessados = dadosEntradas.map(entrada => {
          const veiculo = dadosVeiculos.find(v => v.id === entrada.veiculo_id) || {};
          const tipoVeic = dadosTiposVeiculos.find(tv => tv.id === veiculo.tipo_veiculo_id) || {};
          const usuario = dadosUsuarios.find(u => u.id === entrada.usuarios_id) || {};
          const tipoUsu = dadosTiposUsuarios.find(tu => tu.id === usuario.tipo_usuario_id) || {};

          return {
            placa: veiculo.placa || 'N/A',
            tipo: tipoVeic.tipo || 'N/A',
            publico: tipoUsu.tipo || 'N/A',
            motorista: usuario.nome || 'N/A',
            motivo_entrada: entrada.motivo_entrada || 'N/A',
            tipoUsuarioId: tipoUsu.id || null,
            horarioEntrada: entrada.hora ? entrada.hora.replace('T', ' ') : 'N/A',
            horarioISO: entrada.hora || null, // <-- mantemos o ISO original para comparar datas
            EntrouSaiu: entrada.status_id === 1 ? 'Entrou' : 'Saiu'
          };
        });

        setDados(dadosProcessados);
      } catch (error) {
        setModalMensagem('Erro ao buscar dados, tente reiniciar a página.');
        setModalTipo('erro');
        setMostrarModal(true);
      }
    }

    fetchDados();
  }, []);

  const columns = [
    { header: 'Placa', field: 'placa' },
    { header: 'Tipo', field: 'tipo' },
    { header: 'Público', field: 'publico' },
    { header: 'Nome do motorista', field: 'motorista' },
    { header: 'Motivo da entrada', field: 'motivo_entrada' },
    { header: 'Horário da entrada', field: 'horarioEntrada' },
    { header: 'Entrou ou saiu', field: 'EntrouSaiu' }
  ];

  // Função auxiliar para comparar ano/mês/dia
  const isSameYMD = (dateA, dateB) =>
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate();

  // Data de hoje e ontem (baseado no relógio do cliente)
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  // Aplica filtros comuns (pesquisa por placa e tipo de usuário)
  const baseFiltrado = dados
    .filter(item => item.placa && item.placa.toLowerCase().includes(searchPlaca.toLowerCase()))
    .filter(item =>
      selectedTipoUsuario
        ? item.tipoUsuarioId === Number(selectedTipoUsuario)
        : true
    );

  // Filtra somente os que têm horarioISO válido e correspondem a hoje/ontem
  const dadosHoje = baseFiltrado.filter(item => {
    if (!item.horarioISO) return false;
    const d = new Date(item.horarioISO);
    if (isNaN(d)) return false;
    return isSameYMD(d, hoje);
  });

  const dadosOntem = baseFiltrado.filter(item => {
    if (!item.horarioISO) return false;
    const d = new Date(item.horarioISO);
    if (isNaN(d)) return false;
    return isSameYMD(d, ontem);
  });

  return (
    <div className="app-container">
      <Navbar>
        <LinkNavbar link="/veiculos" linkName="Veículos" />
        <LinkNavbar link="/grafico-gerencia" linkName="Gráficos" />
        <LinkNavbar link="/cadastrar-gerencia" linkName="Cadastrar Administradores" />
        <LinkNavbar link="/gerenciar-cursos" linkName="Gerenciar Cursos" />
      </Navbar>
      <button onClick={handleLogout} className='logout-button'>
        <img src="/icons/logout.png" alt="Sair" className="user-adm-icon" />
        Sair da Conta
      </button>
      <main className="relatorios-main">
        <h1 className='titulo-relatorio'>Relatórios.</h1>
        <hr className='linha-titulo-relatorio' />
        <div className="container">

          <div className="campo-pesquisa">
            <input
              type="text"
              placeholder="Pesquisar placas..."
              value={searchPlaca}
              onChange={e => setSearchPlaca(e.target.value)}
            />
            <select
              className="campoFiltro"
              value={selectedTipoUsuario}
              onChange={e => setSelectedTipoUsuario(e.target.value)}
              style={{ fontSize: '20px' }}
            >
              <option value="">Selecione um tipo de usuário</option>
              {tiposUsuarios.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </select>
          </div>
          <h5 style={{ fontSize: '30px', marginTop: '30px' }}>Veículos no estacionamento</h5>
          <hr style={{ width: '70%', margin: '0 auto' }} />
          <h6 style={{ fontSize: '30px', marginTop: '30px', marginRight: '128vh' }}>Entradas de Hoje</h6>
          <TabelaReaproveitavel columns={columns} dados={dadosHoje} />
          <h6 style={{ fontSize: '30px', marginTop: '30px', marginRight: '125vh' }}>Entradas de Ontem</h6>
          <TabelaReaproveitavel columns={columns} dados={dadosOntem} />
        </div>
        {mostrarModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '40px 30px',
              borderRadius: '5px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              minWidth: '320px',
              textAlign: 'center',
              maxWidth: '600px',
            }}>
              <p style={{
                fontSize: '30px',
                color: modalTipo === 'erro' ? '#d42424ff' : '#1ca21c',
                marginBottom: '30px'
              }}>
                {modalMensagem}
              </p>
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setModalMensagem('');
                  setModalTipo('');
                }}
                style={{
                  backgroundColor: '#d42424ff',
                  height: '50px',
                  borderRadius: '5px',
                  border: 'none',
                  color: '#fff',
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                  width: '100%',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                FECHAR
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer>
        <ul className='nav-list'>
          <LinkNavbar link='/termos' linkName='Termos e Condições' />
          <LinkNavbar link='/contatos' linkName='Ajuda' />
          <LinkNavbar link='/politica-de-privacidade' linkName='Política de Privacidade' />
        </ul>
      </Footer>
    </div>
  );
}

export default Relatorios;
