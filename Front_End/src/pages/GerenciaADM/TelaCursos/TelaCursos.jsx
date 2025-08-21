import './TelaCursos.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';
import TabelaReaproveitavel from '../../../components/Tabela/Tabela.jsx';
import '../../../components/CSSGeral/CSSGeral.css';

function TelaCursos() {
    const [usuario, setUsuario] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [novoCurso, setNovoCurso] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const navigate = useNavigate();

    // Carregar usuário logado
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

    // Buscar cursos da API
    const carregarCursos = async () => {
        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Curso/TodosCurso');
            if (response.ok) {
                const data = await response.json();
                setCursos(data);
            }
        } catch (error) {
            console.error("Erro ao carregar cursos:", error);
        }
    };

    useEffect(() => {
        carregarCursos();
    }, []);

    // Função para inativar curso
    const inativarCurso = async (id) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Curso/InativarCurso/${id}`, {
                method: 'PUT'
            });

            if (response.ok) {
                setModalMensagem("Curso inativado com sucesso!");
                setModalTipo("sucesso");
                setMostrarModal(true);
                carregarCursos();
            } else {
                setModalMensagem("Erro ao inativar curso.");
                setModalTipo("erro");
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem("Erro ao inativar curso.");
            setModalTipo("erro");
            setMostrarModal(true);
        }
    };

    const ativarCurso = async (id) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Curso/AtivarCurso/${id}`, {
                method: 'PUT'
            });

            if (response.ok) {
                setModalMensagem("Curso ativado com sucesso!");
                setModalTipo("sucesso");
                setMostrarModal(true);
                carregarCursos();
            } else {
                setModalMensagem("Erro ao ativar curso.");
                setModalTipo("erro");
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem("Erro ao ativar curso.");
            setModalTipo("erro");
            setMostrarModal(true);
        }
    };

    // Função para adicionar curso
    const adicionarCurso = async () => {
        if (!novoCurso.trim()) return;

        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Curso/AdicionarCurso', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 0,
                    nome: novoCurso,
                    status_id: 1
                })
            });

            if (response.ok) {
                setModalMensagem("Curso adicionado com sucesso!");
                setModalTipo("sucesso");
                setMostrarModal(true);
                setNovoCurso('');
                carregarCursos();
            } else {
                setModalMensagem("Erro ao adicionar curso.");
                setModalTipo("erro");
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem("Erro ao adicionar curso.");
            setModalTipo("erro");
            setMostrarModal(true);
        }
    };

    // Colunas da tabela
    const columns = [
        { header: 'Nome', field: 'nome' },
        { header: 'Status', field: 'status' },
        { header: 'Ações', field: 'acoes' }
    ];

    // Transformar cursos para o formato que a tabela entende
    const dadosFormatados = cursos
        .filter(curso => curso.nome.toLowerCase().includes(filtro.toLowerCase()))
        .map(curso => ({
            ...curso,
            status: curso.status_id === 1 ? "Ativo" : "Inativo",
            acoes: curso.status_id === 1 ? (
                <button
                    onClick={() => inativarCurso(curso.id)}
                    style={{
                        backgroundColor: "#d42424ff",
                        border: "none",
                        padding: "6px 12px",
                        color: "#fff",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Inativar
                </button>
            ) : <button
                onClick={() => ativarCurso(curso.id)}
                style={{
                    backgroundColor: "#2ad424ff",
                    border: "none",
                    padding: "6px 12px",
                    color: "#fff",
                    borderRadius: "5px",
                    cursor: "pointer"
                }}
            >
                Ativar
            </button>
        }));

    return (
        <>
            <div className='app-container'>
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
                <main className='main-cursos'>
                    <h1 className='titulo-cursos'>Cursos</h1>
                    <hr className='linha-titulo-cursos' />

                    {/* Campo de pesquisa */}
                    <div className="campo-pesquisa">
                        <input
                            type="text"
                            placeholder="Pesquisar curso..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />

                        {/* Campo e botão para adicionar curso */}
                        <div
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "10px",
                                width: "100%",
                                maxWidth: "500px",
                                padding: "15px",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                backgroundColor: "#f9f9f9",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                            }}
                        >
                            <input
                                type="text"
                                placeholder="Novo curso"
                                value={novoCurso}
                                onChange={(e) => setNovoCurso(e.target.value)}
                            />
                            <button
                                onClick={adicionarCurso}
                                style={{
                                    backgroundColor: "#28a745",
                                    border: "none",
                                    padding: "10px 18px",
                                    color: "#fff",
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    transition: "0.3s"
                                }}
                                onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
                                onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
                            >
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Tabela de cursos */}
                    <TabelaReaproveitavel columns={columns} dados={dadosFormatados} />

                    {/* Modal */}
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
        </>
    );
}

export default TelaCursos;