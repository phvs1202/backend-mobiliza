import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TelaPerfil.css';
import '../../../components/CSSGeral/CSSGeral.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';

function TelaPerfil() {
    const [usuario, setUsuario] = useState(null);
    const [fotoUser, setFotoUser] = useState(null);
    const [nomeCurso, setNomeCurso] = useState('');

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const [gerarQrCode, setGerarQrCode] = useState(false);
    const [qrcodeUrl, setQrcodeUrl] = useState(null);
    const [telaCheia, setTelaCheia] = useState(false);

    const [mostrarListaVeiculos, setMostrarListaVeiculos] = useState(false);
    const [veiculosUsuario, setVeiculosUsuario] = useState([]);

    const inputFileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioStorage = localStorage.getItem('User');

        if (!usuarioStorage) {
            navigate('/');
            return;
        }

        const usuarioObj = JSON.parse(usuarioStorage);
        setUsuario(usuarioObj);

        if (usuarioObj.foto_de_perfil) {
            const urlCompleta = `https://mobiliza-gersite-back-end.onrender.com/ImagensUsuarios/${usuarioObj.foto_de_perfil}`;
            setFotoUser(urlCompleta);
        }

        // Buscar veículos do usuário com status_id 1 (ativos)
        fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/VeiculoPorUsuario/${usuarioObj.id}`)
            .then(res => res.json())
            .then(data => {
                const ativos = data.filter(v => v.status_id === 1);
                setVeiculosUsuario(ativos);
            });

        // Buscar curso
        fetch('https://mobiliza-gersite-back-end.onrender.com/api/Curso/TodosCurso')
            .then(res => res.json())
            .then(cursosData => {
                const cursoUsuario = cursosData.find(curso => curso.id === usuarioObj.curso_id);
                setNomeCurso(cursoUsuario ? cursoUsuario.nome : 'Curso não encontrado');
            });
    }, []);


    const buscarVeiculosAtivos = async (usuarioId) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/VeiculoPorUsuario/${usuarioId}`);
            const data = await response.json();
            const ativos = data.filter(v => v.status_id === 1);
            setVeiculos(ativos);
        } catch (error) {
            setModalMensagem('Erro ao buscar veículos. Tente reiniciar o site.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    const gerarQRCodeParaVeiculo = async (veiculoId) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/CriacaoQRCode/${veiculoId}`, {
                method: 'POST'
            });

            if (response.ok) {
                const urlImagem = await response.text();
                setQrcodeUrl(urlImagem);
                setGerarQrCode(false);
                setMostrarListaVeiculos(false);
            } else {
                setModalMensagem('Erro ao gerar QR Code. Tente novamente mais tarde.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem('Erro ao gerar QR Code. Tente novamente mais tarde.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };


    useEffect(() => {
        if (gerarQrCode && usuario?.id) {
            buscarVeiculosAtivos(usuario.id);
        }
    }, [gerarQrCode, usuario]);


    const handleFotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !usuario) return;

        const formData = new FormData();
        formData.append('arquivo', file); // cheque nome do parâmetro esperado

        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Usuarios/UploadFoto/${usuario.id}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                const nomeFoto = result.arquivo;

                if (nomeFoto) {
                    const urlCompleta = `https://mobiliza-gersite-back-end.onrender.com/ImagensUsuarios/${nomeFoto}?t=${Date.now()}`;

                    setFotoUser(urlCompleta);

                    setUsuario(prev => ({ ...prev, foto_de_perfil: nomeFoto }));

                    const userStorage = JSON.parse(localStorage.getItem('User'));
                    if (userStorage) {
                        userStorage.foto_de_perfil = nomeFoto;
                        localStorage.setItem('User', JSON.stringify(userStorage));
                    }
                } else {
                    setModalMensagem('Upload enviado, mas não recebi o nome do arquivo.');
                    setModalTipo('sucesso');
                    setMostrarModal(true);
                }
            } else {
                setModalMensagem('Erro ao enviar foto. Tente novamente mais tarde.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem('Erro ao enviar foto. Tente novamente mais tarde.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    return (
        <div className="app-container">
            <Navbar>
                <ul className='nav-list'>
                    <LinkNavbar link='/home' linkName='Tela Inicial' />
                </ul>
            </Navbar>

            <main className='main-perfil'>
                <h1 className='titulo-perfil'>Dados do usuário</h1>
                <hr className='linha-titulo-perfil' />

                <div className='perfil-container'>
                    <div className='cracha-perfil'>
                        <p className='qr-code-aviso'>
                            Gere um QR Code e mostre na Entrada <br /> e Saída do estacionamento.
                        </p>

                        {!qrcodeUrl && (
                            <>
                                {veiculosUsuario.length > 0 ? (
                                    <button className='btn-criar' onClick={() => setMostrarListaVeiculos(true)}>
                                        GERAR QR CODE CRACHÁ DIGITAL
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className='btn-criar'
                                            disabled
                                            style={{
                                                opacity: 0.5,
                                                cursor: 'not-allowed',
                                                backgroundColor: '#ccc',
                                                color: '#666',
                                            }}
                                        >
                                            GERAR QR CODE CRACHÁ DIGITAL
                                        </button>
                                        <p style={{ color: 'red', fontWeight: 'bold', marginTop: '0.5rem', textAlign: 'center' }}>
                                            Registre pelo menos um veículo na página inicial.
                                        </p>
                                    </>
                                )}
                            </>
                        )}


                        {qrcodeUrl && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                                <div className='container-re1'>
                                    <img src='/images/senai.png' className='logo-senai' />
                                </div>
                                <img
                                    className='qr-code'
                                    src={qrcodeUrl}
                                    alt="QR Code"
                                    style={{ width: '450px', marginBottom: '1rem' }}
                                />
                                <button
                                    className='btn-criar'
                                    onClick={() => setMostrarListaVeiculos(true)}
                                >
                                    GERAR OUTRO QR CODE
                                </button>
                                <br></br>
                                <button
                                    className='btn-criar'
                                    onClick={() => setTelaCheia(true)}
                                >
                                    COLOCAR EM TELA CHEIA
                                </button>
                            </div>
                        )}

                        {telaCheia && (
                            <div
                                className='tela-cheia-container'
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column',
                                    zIndex: 9999
                                }}
                            >
                                <img
                                    className='tela-cheia'
                                    src={qrcodeUrl}
                                    alt="QR Code"
                                    style={{
                                        width: '600px',
                                        height: '600px',
                                        objectFit: 'contain',
                                        marginBottom: '20px'
                                    }}
                                />

                                <button
                                    className='btn-criar'
                                    onClick={() => setTelaCheia(false)}
                                >
                                    SAIR DA TELA CHEIA
                                </button>
                            </div>
                        )}

                        {mostrarListaVeiculos && veiculosUsuario.length > 0 && (
                            <div
                                className="selecao-veiculo"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    border: '2px solid gray',
                                    width: '50vh',
                                    margin: '0 auto',
                                    marginTop: '3rem',
                                    padding: '10px',
                                    borderRadius: '2vh',
                                    backgroundColor: '#bbbbbd',
                                    boxShadow: '0 0 40px rgba(0, 0, 0, 0.1)'

                                }}
                            >
                                <h3 style={{ marginBottom: '1rem' }}>Selecione o veículo:</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
                                    {veiculosUsuario.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => gerarQRCodeParaVeiculo(v.id)}
                                            style={{
                                                padding: '12px 20px',
                                                fontSize: '20px',
                                                cursor: 'pointer',
                                                borderRadius: '6px',
                                                border: '1px solid #007BFF',
                                                backgroundColor: 'white',
                                                color: '#007BFF',
                                                transition: 'all 0.3s ease',
                                                width: '300px',
                                                fontStyle: 'italic',
                                                fontWeight: 'bold',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.backgroundColor = '#007BFF';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.color = '#007BFF';
                                            }}
                                        >

                                            {/* Mostra tipo do veículo em texto */}
                                            {v.tipo_veiculo_id === 1 && 'Carro '}
                                            {v.tipo_veiculo_id === 2 && 'Moto '}
                                            {v.tipo_veiculo_id === 3 && 'Caminhão '}
                                            {v.tipo_veiculo_id === 4 && 'Van '}

                                            {/* Mostra a placa e tipo */}
                                            | Placa:­­­ ­
                                            {v.placa.toUpperCase()}
                                        </button>
                                    ))}

                                </div>
                            </div>
                        )}


                    </div>

                    <div className='informacoes-perfil'>
                        <div className='foto-user'>
                            <img
                                style={{ borderRadius: '100px', border: '3px solid red', boxShadow: '0px 0px 15px -5px rgba(255, 0, 0, 0.86)' }}
                                src={fotoUser || '/images/user-photo.png'}
                                alt="Foto do usuário"
                                className="user-perfil-photo"
                            />
                            <button className='mudar-button' onClick={() => inputFileRef.current.click()}>
                                MUDAR FOTO DE PERFIL
                            </button>
                            <input
                                ref={inputFileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFotoChange}
                            />
                        </div>
                        <label
                            style={{ fontWeight: 'bold', marginLeft: '12vh' }}
                            className='aviso-foto'
                        >A foto tem que ser 300px por 300px, e ser do formato .jpg!</label>
                        <hr />
                        {usuario ? (
                            <div>
                                <label style={{ fontSize: '25px' }}>
                                    <img src="/icons/username.png" alt="Ícone de usuário" className="user-perfil-icon" />
                                    <strong>Nome:</strong>
                                </label>
                                <p className='informacoes-texto'>{usuario.nome}</p>
                                <label style={{ fontSize: '25px' }}>
                                    <img src="/icons/email-user-icon.png" alt="Ícone de usuário" className="user-email-perfil-icon" />
                                    <strong>Email:</strong>
                                </label>
                                <p className='informacoes-texto'>{usuario.email}</p>
                                <label style={{ fontSize: '25px' }}>
                                    <img src="/icons/course-icon.png" alt="Ícone de usuário" className="user-course-perfil-icon" />
                                    <strong>Curso:</strong>
                                </label>
                                <p className='informacoes-texto'>{nomeCurso || 'Carregando...'}</p>
                            </div>
                        ) : (
                            <p>Carregando dados do usuário...</p>
                        )}
                    </div>
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

export default TelaPerfil;