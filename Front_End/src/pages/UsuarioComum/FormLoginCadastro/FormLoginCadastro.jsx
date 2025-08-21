import './FormLoginCadastro.css';
import "../../../components/CSSGeral/CSSGeral.css";
import React, { useEffect, useState } from 'react';
import Footer from '../../../components/Footer/Footer';
import Navbar from '../../../components/Navbar/Navbar';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';

function FormLoginCadastro() {
    const [tipos, setTipos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [filtro, setFiltro] = useState("");

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipoUsuarioId, setTipoUsuarioId] = useState('');
    const [cursoId, setCursoId] = useState(0);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const [mostrarCadastro, setMostrarCadastro] = useState(true);

    const [carregandoTipos, setCarregandoTipos] = useState(true);
    const [carregandoCursos, setCarregandoCursos] = useState(false);

    const [aceitouTermos, setAceitouTermos] = useState(false);

    useEffect(() => {
        setCarregandoTipos(true);
        fetch('https://mobiliza-gersite-back-end.onrender.com/api/TipoUsuario/TodosTipos')
            .then(response => response.json())
            .then(data => {
                setTipos(data);
            })
            .catch(error => {
                setModalMensagem('Erro ao carregar categorias. Tente recarregar a página.');
                setModalTipo('erro');
                setMostrarModal(true);
            })
            .finally(() => {
                setCarregandoTipos(false);
            });
    }, []);

    useEffect(() => {
        if (parseInt(tipoUsuarioId) === 1) {
            setCarregandoCursos(true);
            fetch('https://mobiliza-gersite-back-end.onrender.com/api/Curso/TodosCurso')
                .then(response => response.json())
                .then(data => setCursos(data))
                .finally(() => setCarregandoCursos(false));
        } else {
            setCursos([]);
            setCursoId(0);
        }
    }, [tipoUsuarioId]);

    const handleCadastroSubmit = async (e) => {
        e.preventDefault();

        if (!tipoUsuarioId || tipoUsuarioId === '') {
            setModalMensagem('Por favor, selecione sua categoria.');
            setModalTipo('erro');
            setMostrarModal(true);
            return;
        }

        if (parseInt(tipoUsuarioId) === 1 && !cursoId) {
            setModalMensagem('Por favor, selecione seu curso.');
            setModalTipo('erro');
            setMostrarModal(true);
            return;
        }

        const novoUsuario = {
            id: 0,
            nome,
            email,
            senha,
            tipo_usuario_id: parseInt(tipoUsuarioId),
            curso_id: parseInt(tipoUsuarioId) === 1 ? cursoId : null
        };

        try {
            // Cadastra o usuário
            let response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/CadastroUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoUsuario)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar');

            await response.json();

            // Se cadastro OK, faz login automático
            response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/LoginUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            if (!response.ok) throw new Error('Erro ao logar automaticamente');

            const data = await response.json();

            localStorage.setItem('User', JSON.stringify(data.cliente));

            setModalMensagem('Conta criada com sucesso! Você foi logado automaticamente.');
            setModalTipo('sucesso');
            setMostrarModal(true);

            setNome('');
            setEmail('');
            setSenha('');
            setTipoUsuarioId('');
            setCursoId(0);

            // Após 1s, redireciona
            setTimeout(() => {
                window.location.href = '/home';
            }, 1000);

        } catch (error) {
            setModalMensagem('Erro ao cadastrar ou logar. Verifique os dados e tente novamente.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };


    const handleLoginSubmit = (e) => {
        e.preventDefault();

        const usuarioLogado = {
            email,
            senha
        };

        fetch('https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/LoginUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioLogado)
        })
            .then(response => {
                if (!response.ok) throw new Error('Erro ao logar');
                return response.json();
            })
            .then(data => {
                setModalMensagem('Login sucedido!');
                setModalTipo('sucesso');
                setMostrarModal(true);

                localStorage.setItem('User', JSON.stringify(data.cliente));

                setEmail('');
                setSenha('');

                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            })
            .catch(error => {
                setModalMensagem('Erro ao fazer login do usuário. Verifique os dados preenchidos.');
                setModalTipo('erro');
                setMostrarModal(true);
            });
    };

    const cursosFiltrados = cursos.filter(curso =>
        curso.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <>
            <div className='app-container'>
                <Navbar />
                <main>
                    {mostrarCadastro && (
                        <div className='container-form'>
                            <form onSubmit={handleCadastroSubmit}>
                                <p className='descricao'>Insira algumas informações para continuar!</p>

                                <label>Selecione sua categoria.</label>
                                {carregandoTipos ? (
                                    <div className="loader-container">
                                        <p>Carregando categorias...</p>
                                        <div className="loader" />
                                    </div>
                                ) : tipos.length > 0 ? (
                                    <select
                                        value={tipoUsuarioId}
                                        onChange={e => setTipoUsuarioId(e.target.value)}
                                        required
                                        className='tipo'
                                        style={{ fontSize: '20px' }}
                                    >
                                        <option value="">Selecione</option>
                                        {tipos.map(tipo => (
                                            <option key={tipo.id} value={tipo.id}>{tipo.tipo}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p style={{ color: 'red', fontFamily: 'Arial' }}>Erro ao carregar categorias. Tente recarregar a página.</p>
                                )}

                                <>
                                    <label>Insira seu nome completo.</label>
                                    <input
                                        type='text'
                                        value={nome}
                                        placeholder='Nome completo'
                                        onChange={e => setNome(e.target.value)}
                                        required
                                    />

                                    <label>Insira seu e-mail.</label>
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
                                        placeholder='Senha'
                                        onChange={e => setSenha(e.target.value)}
                                        required
                                    />

                                    {parseInt(tipoUsuarioId) === 1 && (
                                        <>
                                            <label>Selecione seu curso:</label>
                                            {carregandoCursos ? (
                                                <div className="loader-container">
                                                    <p>Carregando cursos...</p>
                                                    <div className="loader" />
                                                </div>
                                            ) : cursos.length > 0 ? (
                                                <div>
                                                    <input
                                                        type="text"
                                                        placeholder="Filtrar curso..."
                                                        value={filtro}
                                                        onChange={(e) => setFiltro(e.target.value)}
                                                        style={{
                                                            fontSize: "18px",
                                                            padding: "6px",
                                                            marginBottom: "10px",
                                                            width: "100%"
                                                        }}
                                                    />

                                                    <select
                                                        value={cursoId || ""}
                                                        onChange={(e) => setCursoId(parseInt(e.target.value))}
                                                        required
                                                        className="tipo"
                                                        style={{ fontSize: "20px", width: "100%", padding: "8px" }}
                                                    >
                                                        <option value="" disabled>Selecione um curso</option>
                                                        {cursosFiltrados.map((curso) => (
                                                            <option key={curso.id} value={curso.id}>
                                                                {curso.nome}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <p style={{ color: 'red', fontFamily: 'Arial' }}>
                                                    Erro ao carregar cursos. Tente recarregar a página.
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <hr />
                                    {/* Checkbox de aceitar os termos */}
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                                        <input
                                            type="checkbox"
                                            className="vermelho-checkbox"
                                            checked={aceitouTermos}
                                            onChange={() => setAceitouTermos(!aceitouTermos)}
                                        />
                                        <span style={{ position: 'absolute', margin: '30px', marginBottom: '60px' }}>
                                            Aceito os <a href="/termos" rel="noopener noreferrer">Termos de Uso</a>
                                        </span>
                                    </label>

                                    <button
                                        type='submit'
                                        className='criar'
                                        disabled={
                                            !aceitouTermos ||
                                            carregandoTipos ||
                                            (parseInt(tipoUsuarioId) === 1 && carregandoCursos)
                                        }
                                        style={{
                                            backgroundColor: !aceitouTermos ? '#ccc' : '#d42424',
                                            color: !aceitouTermos ? '#666' : 'white',
                                            cursor: !aceitouTermos ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        CRIAR
                                    </button>
                                </>

                                <label className='mudar-container'>
                                    Tem uma conta?{' '}
                                    <a
                                        onClick={() => setMostrarCadastro(false)}
                                        style={{ cursor: 'pointer', color: '#2488d4' }}
                                    >
                                        Clique aqui!
                                    </a>
                                </label>
                            </form>
                        </div>
                    )}

                    {!mostrarCadastro && (
                        <div className='container-form'>
                            <form onSubmit={handleLoginSubmit}>
                                <p className='descricao'>Entre na sua conta!</p>

                                <label>Email:</label>
                                <input
                                    type='email'
                                    value={email}
                                    placeholder='Ex: exemplo@email.com'
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                />

                                <label>Senha:</label>
                                <input
                                    type='password'
                                    value={senha}
                                    placeholder='Sua senha'
                                    onChange={e => setSenha(e.target.value)}
                                    required
                                />

                                <button type='submit' className='criar' onClick={() => setMostrarModal(true)}>ENTRAR</button>

                                <label className='mudar-container'>
                                    Não tem uma conta?{' '}
                                    <a
                                        onClick={() => setMostrarCadastro(true)}
                                        style={{ cursor: 'pointer', color: '#2488d4' }}
                                    >
                                        Clique aqui!
                                    </a>
                                </label>
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

export default FormLoginCadastro;