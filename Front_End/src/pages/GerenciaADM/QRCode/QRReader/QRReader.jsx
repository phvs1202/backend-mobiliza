import './QRReader.css';
import '../../../../components/CSSGeral/CSSGeral.css';
import Navbar from '../../../../components/Navbar/Navbar';
import LinkNavbar from '../../../../components/LinkNavbar/LinkNavbar';
import Footer from '../../../../components/Footer/Footer';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';

function QRReader() {
    const [usuario, setUsuario] = useState(null);
    const webcamRef = useRef(null);
    const [qrResult, setQrResult] = useState('Nenhum QR Code lido, ou perto da câmera do dispositivo.');
    const [scanning, setScanning] = useState(true);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');
    const [tempoRestante, setTempoRestante] = useState(0);

    // NOVOS estados e refs para contagem regressiva automática do botão ESCANEAR NOVAMENTE
    const [autoScanCountdown, setAutoScanCountdown] = useState(60);
    const autoScanTimeoutRef = useRef(null);
    const autoScanIntervalRef = useRef(null);
    const [modalFechado, setModalFechado] = useState(true);

    const intervalRef = useRef(null);
    const hideTimeoutRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const carregarUsuario = () => {
            const usuarioSalvo = localStorage.getItem('usuarioQRCode');
            if (usuarioSalvo) {
                const usuarioObj = JSON.parse(usuarioSalvo);
                setUsuario(usuarioObj);
            } else {
                navigate('/qrcode');
            }
        };
        carregarUsuario();
    }, [navigate]);

    useEffect(() => {
        if (mostrarModal) {
            setTempoRestante(10);

            if (intervalRef.current) clearInterval(intervalRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

            intervalRef.current = setInterval(() => {
                setTempoRestante(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            hideTimeoutRef.current = setTimeout(() => {
                setMostrarModal(false);
                handleRestart();
            }, 10000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            setTempoRestante(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };
    }, [mostrarModal]);

    useEffect(() => {
        if (mostrarModal) {
            setModalFechado(false);
            setTempoRestante(10);

            if (intervalRef.current) clearInterval(intervalRef.current);
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

            intervalRef.current = setInterval(() => {
                setTempoRestante(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            hideTimeoutRef.current = setTimeout(() => {
                setMostrarModal(false);
                setModalFechado(true);  // sinaliza que o modal foi fechado
                // NÃO chama handleRestart aqui — vamos chamar depois de 60s
            }, 10000);

        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
            setTempoRestante(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }
        };
    }, [mostrarModal]);

    // Efeito para o botão ESCANEAR NOVAMENTE após o modal fechar
    useEffect(() => {
        if (!scanning && modalFechado) {
            setAutoScanCountdown(60);

            autoScanIntervalRef.current = setInterval(() => {
                setAutoScanCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(autoScanIntervalRef.current);
                        autoScanIntervalRef.current = null;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            autoScanTimeoutRef.current = setTimeout(() => {
                handleRestart();
            }, 60000);

        } else {
            if (autoScanTimeoutRef.current) {
                clearTimeout(autoScanTimeoutRef.current);
                autoScanTimeoutRef.current = null;
            }
            if (autoScanIntervalRef.current) {
                clearInterval(autoScanIntervalRef.current);
                autoScanIntervalRef.current = null;
            }
            setAutoScanCountdown(60);
        }

        return () => {
            if (autoScanTimeoutRef.current) {
                clearTimeout(autoScanTimeoutRef.current);
                autoScanTimeoutRef.current = null;
            }
            if (autoScanIntervalRef.current) {
                clearInterval(autoScanIntervalRef.current);
                autoScanIntervalRef.current = null;
            }
        };
    }, [scanning, modalFechado]);

    const enviarEntrada = async (dados) => {
        const entrada = {
            id: 0,
            hora: new Date().toISOString(),
            usuarios_id: dados.IdUsuario,
            motivo_entrada: dados.MotivoEntrada,
            veiculo_id: dados.idVeiculo,
            status_id: 1
        };

        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Entrada/AdicionarEntrada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entrada)
            });

            if (!response.ok) throw new Error("Falha ao cadastrar entrada");
        } catch (error) {
            setModalMensagem('Erro ao enviar entrada.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    const verificarEntradaExistente = async (dados) => {
        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Entrada/TodasEntradas');
            if (!response.ok) throw new Error("Erro ao verificar entradas");

            const entradas = await response.json();

            const entradaAtiva = entradas.find(e =>
                e.veiculo_id === dados.idVeiculo &&
                e.usuarios_id === dados.IdUsuario &&
                e.status_id === 1
            );

            if (entradaAtiva) {
                await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Entrada/InativarEntrada/${entradaAtiva.id}`, {
                    method: 'PUT'
                });

                setModalMensagem('Saída do usuário registrada com sucesso.');
                setModalTipo('sucesso');
                setMostrarModal(true);
            } else {
                await enviarEntrada(dados);

                setModalMensagem('Entrada do usuário registrada com sucesso.');
                setModalTipo('sucesso');
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem('Erro ao verificar/inativar entrada');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    const captureAndScan = useCallback(() => {
        if (
            webcamRef.current &&
            webcamRef.current.video &&
            webcamRef.current.video.readyState === 4 &&
            scanning
        ) {
            const video = webcamRef.current.video;
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                try {
                    const dadosLidos = JSON.parse(code.data);
                    setQrResult(dadosLidos);
                    setScanning(false);
                    verificarEntradaExistente(dadosLidos);
                } catch (err) {
                    setQrResult("QR Code inválido");

                    setModalMensagem('QR Code inválido');
                    setModalTipo('erro');
                    setMostrarModal(true);
                }
            }
        }
    }, [scanning]);

    useEffect(() => {
        if (!scanning) return;

        const interval = setInterval(() => {
            captureAndScan();
        }, 500);

        return () => clearInterval(interval);
    }, [captureAndScan, scanning]);

    const handleRestart = () => {
        setQrResult('Nenhum QR Code lido');
        setScanning(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('usuarioQRCode');
        navigate('/qrcode');
    };

    return (
        <>
            <div className='app-container'>
                <Navbar />
                <main className='main-qrcode-reader'>
                    <div className='container-titulo'>
                        <h1 className='titulo-qr'>Leitor Crachá Digital</h1>
                        <hr className='linha-titulo-qr' />
                        <button className='botao-logout' onClick={handleLogout}>
                            <img src="/icons/logout.png" alt="Ícone de sair" className="logout-home-icon" />
                            Sair
                        </button>
                    </div>

                    <div className='container' style={{ textAlign: 'center' }}>
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat='image/jpeg'
                            videoConstraints={{ facingMode: "environment" }}
                            style={{ width: '80vh', height: '80vh', margin: '0 auto', marginTop: '-60px' }}
                            className='webcam-qr'
                        />

                        <div className='conteudo-camera'>
                            <label>Aproxime o QR Code do Crachá Digital na câmera do dispositivo.</label>
                        </div>

                        {typeof qrResult === 'object' ? (
                            <div className="dados-escaneados">
                                <div className="dados-texto">
                                    <p><strong>Nome Completo:</strong> {qrResult.Nome}</p>
                                    <p><strong>CNH da Pessoa:</strong> {qrResult.CNH}</p>
                                    <p><strong>Placa do Veíuclo:</strong> {qrResult.Placa}</p>
                                    <p><strong>Tipo do Veículo:</strong> {qrResult.TipoDoVeiculo}</p>
                                    <p><strong>Motivo da Entrada:</strong> {qrResult.MotivoEntrada}</p>
                                    <p><strong>Data da criação do QR Code:</strong> {qrResult.Data}</p>
                                </div>

                                <div className='dados-imagens'>
                                    <img
                                        src={`https://mobiliza-gersite-back-end.onrender.com/ImagensUsuarios/${qrResult.IdUsuario}.jpg`}
                                        alt="Foto do usuário"
                                        style={{ width: '18vh', borderRadius: '100px' }}
                                        onError={(e) => {
                                            e.target.onerror = null; // previne loop infinito
                                            e.target.src = '/images/user-photo.png'; // caminho da imagem padrão do usuário
                                        }}
                                    />

                                    <img
                                        src={`https://mobiliza-gersite-back-end.onrender.com/ImagensVeiculos/${qrResult.idVeiculo}.jpg`}
                                        alt="Foto do veículo do usuário"
                                        style={{ width: '25vh' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/icons/car-not-found.png'; // caminho da imagem padrão do veículo
                                        }}
                                    />
                                </div>

                            </div>

                        ) : (
                            <p style={{ marginTop: '20px', fontSize: '20px' }}><strong>Status:</strong> {qrResult}</p>
                        )}

                        {!scanning && (
                            <button onClick={handleRestart} className='scan-again'>
                                ESCANEAR NOVAMENTE ({autoScanCountdown}s)
                            </button>
                        )}
                    </div>

                    {/* TOAST no canto direito */}
                    <div
                        className={`toast-container ${modalTipo === 'erro' ? 'toast-erro' : 'toast-sucesso'} ${mostrarModal ? 'show' : ''}`}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="toast-body">
                            <div className="toast-message">{modalMensagem}</div>
                            <div className="toast-count">{tempoRestante}s</div>
                        </div>
                        <div className="toast-progress">
                            <div
                                className="toast-progress-bar"
                                style={{ width: `${(tempoRestante / 10) * 100}%` }}
                            />
                        </div>
                    </div>

                </main>
                <Footer>
                    <ul className='nav-list'>
                        <LinkNavbar link='/termos' linkName='Termos e Condições' />
                        <LinkNavbar link='/contatos' linkName='Ajuda' />
                        <LinkNavbar link='/politica-de-privacidade' linkName='Política de Privacidade' />
                    </ul>
                </Footer>
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
        </>
    );
}

export default QRReader;