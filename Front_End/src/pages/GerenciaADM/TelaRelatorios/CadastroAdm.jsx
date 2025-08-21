import React, { useEffect, useState } from 'react';
import '../../../components/CSSGeral/CSSGeral.css';
import './CadastroAdm.css';
import Navbar from '../../../components/Navbar/Navbar.jsx';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar.jsx';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

function CadastroAdm() {
    const [usuario, setUsuario] = useState(null);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const [mostrarCadastro, setMostrarCadastro] = useState(true);

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
    }, [navigate])

    const handleCadastroSubmit = (e) => {
        e.preventDefault();

        const novoUsuario = {
            id: 0,
            nome,
            email,
            senha,
        };

        fetch('https://mobiliza-gersite-back-end.onrender.com/api/Gerenciadores/CadastroUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao cadastrar');
                return response.json();
            })
            .then(() => {
                setModalMensagem('Conta criada com sucesso!');
                setModalTipo('sucesso');
                setMostrarModal(true);
                setNome('');
                setEmail('');
                setSenha('');
            })
            .catch(error => {
                setModalMensagem('Erro ao cadastrar usuário. Verifique os dados preenchidos.');
                setModalTipo('erro');
                setMostrarModal(true);
            });
    };

    return (
        <>
            <div className='app-container'>
                <Navbar>
                    <LinkNavbar link="/veiculos" linkName="Veículos" />
                    <LinkNavbar link="/grafico-gerencia" linkName="Gráficos" />
                    <LinkNavbar link="/cadastrar-gerencia" linkName="Cadastrar Administradores" />
                    <LinkNavbar link="/gerenciar-cursos" linkName="Gerenciar Cursos" />
                </Navbar>
                <main>
                    {mostrarCadastro && (
                        <div className='container-form'>
                            <form onSubmit={handleCadastroSubmit}>
                                <p className='descricao'>Insira informações para cadastrar administrador</p>

                                <>
                                    <label>Insira o nome completo.</label>
                                    <input
                                        type='text'
                                        value={nome}
                                        placeholder='Nome completo'
                                        onChange={e => setNome(e.target.value)}
                                        required
                                    />

                                    <label>Insira o e-mail.</label>
                                    <input
                                        type='email'
                                        value={email}
                                        placeholder='Ex: exemplo@email.com'
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />

                                    <label>Crie uma senha.</label>
                                    <input
                                        type='password'
                                        value={senha}
                                        placeholder='Senha da conta'
                                        onChange={e => setSenha(e.target.value)}
                                        required
                                    />

                                    <button
                                        type='submit'
                                        className='criar'
                                    >
                                        CRIAR
                                    </button>
                                </>
                            </form>
                        </div>
                    )}

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

export default CadastroAdm;