import React, { useEffect, useState, useRef } from 'react';
import '../../../components/CSSGeral/CSSGeral.css';
import './paginaGrafico.css';
import Navbar from '../../../components/Navbar/Navbar.jsx';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar.jsx';
import Footer from '../../../components/Footer/Footer';
import Tabela from '../../../components/Tabela/Tabela.jsx';
import { useNavigate } from 'react-router-dom';

// Cores constantes para os gráficos (tons de vermelho)
const CORES_GRAFICOS = ['#651515ff', '#e60000ff', '#ed5050ff', '#ef9e9eff'];
const data = new Date();
const agora = data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' + String(data.getDate()).padStart(2, '0');

function PaginaGrafico() {
    const [usuario, setUsuario] = useState(null);

    // Estados do componente
    const [dados, setDados] = useState([]);
    const [dataInicio, setDataInicio] = useState(agora);
    const [dataFim, setDataFim] = useState(agora);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Refs para os canvases
    const usuariosCanvasRef = useRef(null);
    const veiculosCanvasRef = useRef(null);
    const entradasCanvasRef = useRef(null);

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
    };

    // Configurações da tabela
    const columns = [
        { header: 'Data de Validade', field: 'validade' },
        { header: 'Motorista', field: 'nome' }
    ];

    // Efeitos
    useEffect(() => {
        fetchDadosCNH();
        desenharGraficos();
    }, []);

    // Funções de busca de dados
    const fetchDadosCNH = async () => {
        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Cnh/ValidadeUsuario');
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);

            const data = await response.json();
            const dadosModificados = data.map(item => ({
                ...item,
                validade: item.validade ? item.validade.split('T')[0] : 'N/A'
            }));

            setDados(dadosModificados);
        } catch (error) {
            setModalMensagem('Erro ao buscar dados de CNH, tente reiniciar a página.');
            setModalTipo('erro');
            setMostrarModal(true);
            setError(error.message);
        }
    };

    // Funções de manipulação de gráficos
    const desenharGraficos = async (dataInicioParam = '', dataFimParam = '') => {
        try {
            setLoading(true);

            const [dadosUsuarios, dadosVeiculos, dadosEntradas] = await buscarDadosGraficos(dataInicioParam, dataFimParam);

            desenharGraficoUsuarios(dadosUsuarios);
            // Alterado: veículos agora em gráfico de colunas
            desenharGraficoColuna(dadosVeiculos, '', veiculosCanvasRef);
            // Entradas continua em pizza
            desenharGraficoPizza(dadosEntradas, '', entradasCanvasRef);

        } catch (error) {
            setModalMensagem('Erro ao desenhar gráficos, tente reiniciar a página.');
            setModalTipo('erro');
            setMostrarModal(true);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const buscarDadosGraficos = async (dataInicio, dataFim) => {
        const [usuariosResponse, veiculosResponse, entradasResponse] = await Promise.all([
            fetch('https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/qtdUser'),
            fetch('https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/qtdVeiculos'),
            fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Entrada/EntradaPorTipo?${new URLSearchParams({
                ...(dataInicio && { dataInicio }),
                ...(dataFim && { dataFim })
            })}`)
        ]);

        if (!usuariosResponse.ok || !veiculosResponse.ok || !entradasResponse.ok) {
            throw new Error('Erro em uma ou mais requisições');
        }

        return Promise.all([
            usuariosResponse.json(),
            veiculosResponse.json(),
            entradasResponse.json()
        ]);
    };

    // Função para o gráfico de usuários (barras)
    const desenharGraficoUsuarios = (dados) => {
        const canvas = usuariosCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const labels = Object.keys(dados);
        const valores = Object.values(dados);
        const maxValor = Math.max(...valores, 1);

        const margin = 40;
        const barWidth = 75;
        const gap = 73;
        const chartHeight = height - margin * 2;
        const startX = margin;
        const baseY = height - margin;

        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, baseY);
        ctx.lineTo(width - margin, baseY);
        ctx.strokeStyle = '#ffffffff';
        ctx.stroke();

        labels.forEach((label, index) => {
            const x = startX + (index * (barWidth + gap));
            const barHeight = (valores[index] / maxValor) * chartHeight;

            ctx.fillStyle = CORES_GRAFICOS[index % CORES_GRAFICOS.length];
            ctx.fillRect(x, baseY - barHeight, barWidth, barHeight);

            ctx.fillStyle = '#000000ff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(valores[index], x + barWidth / 2, baseY - barHeight - 10);
            ctx.fillText(label, x + barWidth / 2, baseY + 20);
        });
    };

    // NOVA função: gráfico de colunas para veículos
    const desenharGraficoColuna = (dados, titulo, canvasRef) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const labels = Object.keys(dados);
        const valores = Object.values(dados);
        const maxValor = Math.max(...valores, 1);

        const margin = 40;
        const barWidth = 55;
        const gap = 60;
        const chartHeight = height - margin * 2;
        const startX = margin;
        const baseY = height - margin;

        // Título
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(titulo, width / 2, 25);

        // Eixos
        ctx.beginPath();
        ctx.moveTo(margin, margin);
        ctx.lineTo(margin, baseY);
        ctx.lineTo(width - margin, baseY);
        ctx.strokeStyle = '#ffffffff';
        ctx.stroke();

        // Barras
        labels.forEach((label, index) => {
            const x = startX + (index * (barWidth + gap));
            const barHeight = (valores[index] / maxValor) * chartHeight;

            ctx.fillStyle = CORES_GRAFICOS[index % CORES_GRAFICOS.length];
            ctx.fillRect(x, baseY - barHeight, barWidth, barHeight);

            ctx.fillStyle = '#000000ff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(valores[index], x + barWidth / 2, baseY - barHeight - 10);
            ctx.fillText(label, x + barWidth / 2, baseY + 20);
        });
    };

    // Função para pizza (entradas)
    const desenharGraficoPizza = (dados, titulo, canvasRef) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const labels = Object.keys(dados);
        const valores = Object.values(dados);
        const total = valores.reduce((acc, val) => acc + val, 0) || 1;

        let startAngle = 0;
        const centroX = canvas.width / 2;
        const centroY = canvas.height / 2;
        const raio = Math.min(canvas.width, canvas.height) / 3;

        valores.forEach((valor, index) => {
            const sliceAngle = (valor / total) * (2 * Math.PI);
            const meioAngulo = startAngle + sliceAngle / 2;

            ctx.fillStyle = CORES_GRAFICOS[index % CORES_GRAFICOS.length];
            ctx.beginPath();
            ctx.moveTo(centroX, centroY);
            ctx.arc(centroX, centroY, raio, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            if (valor > 0) {
                const labelX = centroX + Math.cos(meioAngulo) * (raio * 0.7);
                const labelY = centroY + Math.sin(meioAngulo) * (raio * 0.7);
                ctx.fillStyle = 'black';
                ctx.font = '14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(valor, labelX, labelY);
            }

            startAngle += sliceAngle;
        });

        ctx.font = '14px Arial';
        ctx.textAlign = 'start';
        labels.forEach((label, index) => {
            const legendaY = 30 + index * 25;
            ctx.fillStyle = CORES_GRAFICOS[index % CORES_GRAFICOS.length];
            ctx.fillRect(20, legendaY, 15, 15);
            ctx.fillStyle = 'black';
            ctx.fillText(`${label}: ${valores[index]}`, 40, legendaY + 12);
        });

        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(titulo, canvas.width / 2, 20);
    };

    const handleFiltrar = () => {
        desenharGraficos(dataInicio, dataFim);
    };

    return (
        <div className="pagina-grafico-wrapper">
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
            <main className='main-grafico'>
                <h1 className='titulo-adm-grafico'>Dashboard.</h1>
                <hr className='linha-adm-grafico' />

                {loading && <div className="loading">Carregando...</div>}
                {error && <div className="error">{error}</div>}

                <div className="container-graficos">
                    <div className="grafico">
                        <h5>Quantidade de entradas mapeado por tipo de usuários</h5>
                        <div className="filtro-container">
                            <label>Início</label>
                            <input
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                            />
                            <label>Fim</label>
                            <input
                                type="date"
                                value={dataFim}
                                onChange={(e) => setDataFim(e.target.value)}
                                min={dataInicio}
                            />
                            <button onClick={handleFiltrar}>Filtrar</button>
                        </div>
                        <canvas ref={entradasCanvasRef} id="graficoEntradasUsuarios" width="500" height="400"></canvas>
                    </div>

                    <div className="grafico">
                        <h5>Quantidade de usuários cadastrados mapeado por tipos</h5>
                        <canvas ref={usuariosCanvasRef} id="graficoUsuarios" width="600" height="500" style={{ marginTop: '120px' }}></canvas>
                    </div>

                    <div className="grafico">
                        <h5>Quantidade de veículos cadastrados mapeado por tipos</h5>
                        <canvas ref={veiculosCanvasRef} id="graficoVeiculos" width="500" height="400"></canvas>
                    </div>
                </div>

                <div className="tabela-container-vermelha">
                    <h5>Data de validade das CNHs e seus motoristas</h5>
                    <Tabela
                        columns={columns}
                        dados={dados}
                        className="tabela-vermelha"
                    />
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

export default PaginaGrafico;