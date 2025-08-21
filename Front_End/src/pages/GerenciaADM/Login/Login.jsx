import './Login.css';
import '../../../components/CSSGeral/CSSGeral.css';
import Navbar from '../../../components/Navbar/Navbar';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';
import Footer from '../../../components/Footer/Footer';
import React, { useState } from 'react';

function Login() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        const usuarioLogado = {
            email,
            senha
        };

        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Gerenciadores/LoginUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioLogado)
            });
            if (!response.ok) throw new Error('Erro ao fazer login do usuário. Verifique os dados preenchidos.');
            const usuario = await response.json();
            localStorage.setItem('usuario', JSON.stringify(usuario));
            setModalMensagem('Login sucedido!');
            setModalTipo('sucesso');
            setMostrarModal(true);
            setEmail('');
            setSenha('');
            setTimeout(() => {
                window.location.href = '/Veiculos';
            }, 1000);
        } catch (error) {
            setModalMensagem(error.message);
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    return (
        <>
            <div className='app-container'>
                <Navbar />
                <main className='login-gerencia-main'>
                    <form className="container-form" onSubmit={handleLogin}>
                        <img src='/images/adm-login.png' style={{ width: '17vh', margin: '0 auto' }} />
                        <p className="descricao">Entre para continuar!</p>
                        <label className="label-login">Insira seu email</label>
                        <input
                            style={{ fontSize: '20px' }}
                            type="email"
                            className="input-login"
                            placeholder="Ex: exemplo@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <label className="label-login">Insira sua senha</label>
                        <input
                            style={{ fontSize: '20px' }}
                            type="password"
                            className="input-login"
                            placeholder="Senha"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            required
                        />
                        <button type='submit' className="criar">ENTRAR</button>
                    </form>
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
    )
}

export default Login;