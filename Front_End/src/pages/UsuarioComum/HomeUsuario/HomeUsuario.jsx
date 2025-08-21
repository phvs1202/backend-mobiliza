import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeUsuario.css';
import '../../../components/CSSGeral/CSSGeral.css';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';

function HomeUsuario() {
    const [usuario, setUsuario] = useState(null);
    const [tiposVeiculos, setTiposVeiculos] = useState([]);
    const [veiculosCadastro, setVeiculosCadastro] = useState([
        { tipo_veiculo_id: '', placa: '' }
    ]);
    const [veiculosExistentes, setVeiculosExistentes] = useState([]);

    const [cnhCadastrada, setCnhCadastrada] = useState(false);
    const [cnhNumero, setCnhNumero] = useState('');
    const [cnhCategoria, setCnhCategoria] = useState([]);
    const [cnhValidade, setCnhValidade] = useState('');
    const [cnhDados, setCnhDados] = useState(null);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalMensagem, setModalMensagem] = useState('');
    const [modalTipo, setModalTipo] = useState('');

    const [mostrarFormularioVeiculo, setMostrarFormularioVeiculo] = useState(false);
    const [tiposPermitidos, setTiposPermitidos] = useState([]);

    const inputFileRef = useRef(null);
    const [fotoCarro, setFotoCarro] = useState(null);
    const [fotosCarros, setFotosCarros] = useState({});

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    const navigate = useNavigate();

    const hoje = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const carregarUsuario = () => {
            const usuarioStorage = localStorage.getItem('User');
            if (usuarioStorage) {
                const usuarioObj = JSON.parse(usuarioStorage);
                setUsuario(usuarioObj);
            } else {
                navigate('/');
            }
        };

        const carregarTiposVeiculo = async () => {
            try {
                const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/TipoVeiculo/TodosTipos');
                const data = await response.json();
                setTiposVeiculos(data);
            } catch (error) {
                setModalMensagem('Erro ao carregar tipos de veículos. Tente reiniciar o site.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        };

        carregarUsuario();
        carregarTiposVeiculo();
    }, []);

    const carregarFotoVeiculo = async (veiculoId) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/RetornarFotoVeiculo/${veiculoId}`);

            if (response.ok) {
                const blob = await response.blob();
                const imageUrl = URL.createObjectURL(blob);
                return imageUrl;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    useEffect(() => {
        if (!usuario?.id) return;

        const carregarVeiculosUsuario = async (usuarioId) => {
            try {
                const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/VeiculoPorUsuario/${usuarioId}`);
                const data = await response.json();

                // Filtrar apenas os veículos com status_id === 1 (ativos)
                const veiculosAtivos = data.filter(v => v.status_id === 1);

                setVeiculosExistentes(veiculosAtivos);

                // Carregar as fotos apenas dos veículos ativos
                const fotos = {};
                for (const veiculo of veiculosAtivos) {
                    const urlFoto = await carregarFotoVeiculo(veiculo.id);
                    if (urlFoto) {
                        fotos[veiculo.id] = urlFoto;
                    }
                }
                setFotosCarros(fotos);

            } catch (error) {
                setModalMensagem('Erros ao carregar veículos do usuário. Tente reiniciar o site.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        };


        const verificarCNHCadastrada = async (usuarioId) => {
            try {
                const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Cnh/CnhUsuarioEspecifico/${usuarioId}`);

                if (response.ok) {
                    const data = await response.json();

                    localStorage.setItem('CNH-user', JSON.stringify(data));

                    setCnhCadastrada(!!data && Object.keys(data).length > 0);
                } else if (response.status === 404) {
                    setCnhCadastrada(false);
                } else {
                    setCnhCadastrada(false);
                }
            } catch (error) {
                setModalMensagem('Erro ao verificar CNH cadastrada. Tente reiniciar o site.');
                setModalTipo('erro');
                setMostrarModal(true);
                setCnhCadastrada(false);
            }
        };

        carregarVeiculosUsuario(usuario.id);
        verificarCNHCadastrada(usuario.id);
    }, [usuario]);


    const handleLogout = () => {
        localStorage.removeItem('User');
        localStorage.removeItem('CNH-user');
        navigate('/');
    };

    const handleVerPerfil = () => {
        navigate('/user-profile');
    };

    //funções para o formulário CNH
    const handleSubmitCNH = async (e) => {
        e.preventDefault();

        if (!cnhNumero || cnhCategoria.length === 0 || !cnhValidade) {
            setModalMensagem('Por favor, preencha todos os campos da CNH.');
            setModalTipo('erro');
            setMostrarModal(true);
            return;
        }

        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Cnh/CadastrarCnh/${usuario?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: 0,
                    data_validade: cnhValidade,
                    numero_cnh: cnhNumero,
                    categoria: cnhCategoria.join(' | '),
                    usuario_id: usuario?.id || 0,
                    status_id: 1
                })
            });

            let cnhData = null;

            if (response.ok) {
                const text = await response.text(); // pega como texto cru

                if (text) {
                    try {
                        cnhData = JSON.parse(text); // tenta parsear
                        localStorage.setItem('CNH-user', JSON.stringify(cnhData));
                    } catch (parseError) {
                    }
                }

                setModalMensagem('CNH cadastrada com sucesso!');
                setModalTipo('sucesso');
                setMostrarModal(true);
                setCnhCadastrada(true);
                setMostrarFormularioVeiculo(true);

                window.location.reload(false);
            } else {
                throw new Error('Erro ao cadastrar CNH');
            }

        } catch (error) {
            setModalMensagem('Erro ao cadastrar CNH.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    //funções do formulário veículos mantidas
    const handleChangeVeiculo = (index, campo, valor) => {
        const novosVeiculos = [...veiculosCadastro];
        novosVeiculos[index][campo] = valor;
        setVeiculosCadastro(novosVeiculos);
    };

    const deletarVeiculo = async (veiculoId) => {
        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/InativarVeiculos/${veiculoId}`, {
                method: 'PUT'
            });

            if (response.ok) {

                window.location.reload(false);
                carregarVeiculosUsuario(usuario.id);
            } else {
                setModalMensagem('Erro ao inativar veículo.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem('Veículo inativado!');
            setModalTipo('sucesso');
            setMostrarModal(true);
        }
    };

    const handleSubmitVeiculo = async (e) => {
        e.preventDefault();
        if (!usuario) return;

        const dadosParaEnviar = veiculosCadastro.map(v => ({
            tipo_veiculo_id: parseInt(v.tipo_veiculo_id),
            placa: v.placa,
            usuario_id: usuario.id
        }));

        try {
            const response = await fetch('https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/CadastroVeiculo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (response.ok) {
                setVeiculosCadastro([{ tipo_veiculo_id: '', placa: '', mostrarPlaca: false }]);
                setMostrarFormularioVeiculo(false);

                window.location.reload(false);
                await carregarVeiculosUsuario(usuario.id);
            } else {
                setModalMensagem('Erro ao cadastrar o veículo.');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        } catch (error) {
            setModalMensagem('Veículo cadastrado com sucesso!.');
            setModalTipo('sucesso');
            setMostrarModal(true);
        }
    };

    useEffect(() => {
        const cnhStr = localStorage.getItem('CNH-user');
        if (cnhStr) {
            setCnhDados(JSON.parse(cnhStr));
        }
    }, [cnhCadastrada]);

    useEffect(() => {
        if (!cnhDados) return;

        let categoriasArray = [];
        if (typeof cnhDados.categoria === 'string') {
            categoriasArray = cnhDados.categoria.split(' | ').map(cat => cat.trim());
        } else if (Array.isArray(cnhDados.categoria)) {
            categoriasArray = cnhDados.categoria;
        }

        const categoriasParaTipos = {
            'A': ['Moto'],
            'B': ['Carro'],
            'C': ['Caminhão'],
            'D': ['Ônibus'],
            'E': ['Caminhão com reboque']
        };

        const tiposFiltrados = tiposVeiculos.filter(tipo =>
            categoriasArray.some(cat =>
                categoriasParaTipos[cat]?.some(v => v.toLowerCase() === tipo.tipo.toLowerCase())
            )
        );

        setTiposPermitidos(tiposFiltrados);

    }, [tiposVeiculos, cnhDados]);


    const handleFotoUpload = async (e, veiculoId) => {
        const file = e.target.files[0];
        if (!file || !veiculoId) return;

        const formData = new FormData();
        formData.append('arquivo', file); // nome esperado pelo backend

        try {
            const response = await fetch(`https://mobiliza-gersite-back-end.onrender.com/api/Veiculos/UploadFoto/${veiculoId}`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                const nomeFoto = result.arquivo;

                const url = `https://mobiliza-gersite-back-end.onrender.com/ImagensVeiculos/${nomeFoto}?t=${Date.now()}`;
                setFotoCarro(url); // ou adicione no array se for um por veículo

                window.location.reload(false);
            } else {
                setModalMensagem('Erro ao cadastrar foto do Veículo. Apenas fotos com extensão .jpg são aceitas!');
                setModalTipo('erro');
                setMostrarModal(true);
            }
        } catch (err) {
            setModalMensagem('Erro ao enviar foto. Tente novamente mais tarde.');
            setModalTipo('erro');
            setMostrarModal(true);
        }
    };

    return (
        <div className="app-container">
            <Navbar />
            <main className="main-home">
                <div className="presentation-home">
                    <h1>Bem-vindo, {usuario?.nome || '...'}!</h1>
                    <div className="botoes-container">
                        {cnhCadastrada ? (
                            <button onClick={handleVerPerfil}>
                                <img src="/icons/user-icon.png" alt="Ícone de usuário" className="user-home-icon" />
                                Ver Perfil
                            </button>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    disabled
                                    style={{
                                        opacity: 0.5,
                                        cursor: 'not-allowed',
                                        backgroundColor: '#ccc',
                                        color: '#666',
                                        display: 'flex',
                                        alignItems: 'center',
                                        border: 'none',
                                        fontSize: '16px',
                                    }}
                                >
                                    <img src="/icons/user-icon.png" alt="Ícone de usuário" className="user-home-icon" />
                                    Ver Perfil
                                </button>
                            </div>
                        )}
                        <button onClick={handleLogout}>
                            <img src="/icons/logout.png" alt="Ícone de sair" className="logout-home-icon" />
                            Sair
                        </button>
                    </div>
                </div>

                {/* se CNH não cadastrada, mostra o form CNH */}
                {!cnhCadastrada && (
                    <>
                        <h1 className='titulo-home'>Antes de continuar, precisamos que cadastre sua CNH.</h1>
                        <hr className='linha-titulo-home' />

                        <form className='form-cnh-home' onSubmit={handleSubmitCNH}>
                            <label>
                                Número da CNH:
                                <input
                                    style={{ fontSize: '20px', textAlign: 'center' }}
                                    type="text"
                                    value={cnhNumero}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        setCnhNumero(value);
                                    }}
                                    required
                                    pattern="^\d{11}$"
                                    title="O número da CNH deve ter exatamente 11 dígitos (ex: 12345678901)"
                                />
                            </label>

                            <label>Categoria:</label>
                            <div className='form-cnh-radio-home'>
                                {['A', 'B', 'C', 'D', 'E'].map((categoria) => (
                                    <label key={categoria} className='radio-cnh-label'>
                                        <input
                                            className='checkbox-home'
                                            type="checkbox"
                                            value={categoria}
                                            checked={cnhCategoria.includes(categoria)}
                                            onChange={(e) => {
                                                const valor = e.target.value;
                                                setCnhCategoria(prev =>
                                                    e.target.checked
                                                        ? [...prev, valor]
                                                        : prev.filter(c => c !== valor)
                                                );
                                            }}
                                        />
                                        {categoria} ({{
                                            A: 'Moto',
                                            B: 'Carro',
                                            C: 'Caminhão',
                                            D: 'Ônibus',
                                            E: 'Caminhão com reboque'
                                        }[categoria]})
                                    </label>
                                ))}
                            </div>

                            <label>
                                Data de Validade:
                                <input
                                    type="date"
                                    value={cnhValidade}
                                    onChange={(e) => setCnhValidade(e.target.value)}
                                    required
                                    min={hoje}
                                    style={{ fontSize: '20px', textAlign: 'center' }}
                                />

                            </label>

                            <button className='button-cadastrar-home' type="submit">
                                <img src="/icons/check.png" alt="Check" className="check-home-icon" />
                                REGISTRAR CNH
                            </button>
                        </form>

                    </>
                )}

                {/* se CNH cadastrada, mostra o formulário veículos e lista veículos */}
                {cnhCadastrada && (
                    <>
                        <h1 className='titulo-home'>Gerenciamento do(s) Veículos(s)</h1>
                        <hr className='linha-titulo-home' />

                        {veiculosExistentes.length > 0 && (
                            <div className="tabela-veiculos-container">
                                <h2>Seus veículos cadastrados:</h2>
                                <table className="tabela-veiculos">
                                    <thead>
                                        <tr>
                                            <th style={{ fontSize: '20px', textAlign: 'center', backgroundColor: '#a21c1c', color: '#fff' }}>Veículo(s)</th>
                                            <th style={{ fontSize: '20px', textAlign: 'center', backgroundColor: '#a21c1c', color: '#fff' }}>Placa(s) do Veículo(s)</th>
                                            <th style={{ fontSize: '20px', textAlign: 'center', backgroundColor: '#a21c1c', color: '#fff' }}>Ações</th>
                                            <th style={{ fontSize: '20px', textAlign: 'center', backgroundColor: '#a21c1c', color: '#fff' }}>Foto(s) do(s) Veículo(s)
                                                <button type="button" className="btn" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="Só serão aceitas fotos com extensão .jpg!">
                                                    <img src="/icons/alert.png" alt="Alerta" style={{ margin: '0 auto' }} />
                                                </button>
                                            </th>
                                        </tr>
                                    </thead>
                                    <thead>
                                        {veiculosExistentes.map((veiculo) => (
                                            <tr key={veiculo.id}>
                                                <td style={{ fontSize: '50px', textAlign: 'center' }}>
                                                    <i>
                                                        {veiculo.tipo_veiculo_id === 1 && 'Carro'}
                                                        {veiculo.tipo_veiculo_id === 2 && 'Moto'}
                                                        {veiculo.tipo_veiculo_id === 3 && 'Caminhão'}
                                                        {veiculo.tipo_veiculo_id === 4 && 'Van'}
                                                        {[1, 2, 3, 4].includes(veiculo.tipo_veiculo_id) === false &&
                                                            `Tipo ID ${veiculo.tipo_veiculo_id}`}
                                                    </i>
                                                </td>
                                                <td style={{ fontSize: '50px', textAlign: 'center', fontWeight: 'bold' }}>
                                                    <p>
                                                        {veiculo.placa && veiculo.placa.trim() !== ''
                                                            ? veiculo.placa
                                                            : 'A Placa não foi informada pelo Usuário'}
                                                    </p>
                                                </td>
                                                <td>
                                                    <button
                                                        className="button-remover-home"
                                                        onClick={() => deletarVeiculo(veiculo.id)}
                                                    >
                                                        <img src="/icons/remove.png" alt="Remover" className="remove-home-icon" />
                                                        INATIVAR VEÍCULO
                                                    </button>
                                                    <button
                                                        className="button-cadastrar-home"
                                                        style={{ width: '100%' }}
                                                        onClick={() => document.getElementById(`file-${veiculo.id}`).click()}
                                                    >
                                                        <img src="/icons/add.png" alt="Adicionar Veículo" className="adicionar-home-icon" />
                                                        ADICIONAR, OU MUDAR, FOTO DO VEÍCULO
                                                    </button>
                                                    <input
                                                        type="file"
                                                        id={`file-${veiculo.id}`}
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={(e) => handleFotoUpload(e, veiculo.id)}
                                                    />
                                                </td>

                                                <td style={{ width: '120vh', maxWidth: '350px', padding: 0, textAlign: 'center', verticalAlign: 'middle' }}>
                                                    <img
                                                        className='foto-veiculo-home'
                                                        src={fotosCarros[veiculo.id] || '/icons/car-not-found.png'}
                                                        alt="Foto do veículo"
                                                        style={{
                                                            width: '100%',
                                                            maxWidth: '350px',
                                                            maxHeight: '120px',
                                                            objectFit: 'contain',
                                                            display: 'block',
                                                            margin: '0 auto'
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </thead>
                                </table>

                                <button className="button-adicionar-home" onClick={() => {
                                    setMostrarFormularioVeiculo(true);
                                }}
                                >
                                    <img src="/icons/add.png" alt="Adicionar" className="add-home-icon" />
                                    ADICIONAR NOVO VEÍCULO
                                </button>
                            </div>
                        )}

                        {(mostrarFormularioVeiculo || veiculosExistentes.length === 0) && (
                            <form className='form-home' onSubmit={handleSubmitVeiculo}>
                                <div className='veiculos-container-home'>
                                    {veiculosCadastro.map((veiculo, index) => (
                                        <div key={index} className="veiculo-bloco">
                                            <h2>Cadastrar novo veículo.</h2>
                                            <label>
                                                Tipo de Veículo:
                                                <select
                                                    value={veiculosCadastro[index].tipo_veiculo_id || ''}
                                                    onChange={(e) => handleChangeVeiculo(index, 'tipo_veiculo_id', e.target.value)}
                                                >
                                                    <option value="">Selecione o tipo de veículo</option>
                                                    {tiposPermitidos.map(tipo => (
                                                        <option key={tipo.id} value={tipo.id}>
                                                            {tipo.tipo}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <p style={{ fontSize: '16px' }}>
                                                <b style={{ color: 'red', fontSize: '18px' }}>Importante:</b><br />
                                                Coletamos a placa do veículo apenas para fins de identificação e segurança. Os dados são tratados conforme a LGPD.
                                            </p>

                                            <label>
                                                Placa do veículo:
                                                <input
                                                    type="text"
                                                    value={veiculo.placa}
                                                    onChange={(e) => handleChangeVeiculo(index, 'placa', e.target.value.toUpperCase())}
                                                    title="(ex: BRA1B23)"
                                                    required
                                                />
                                            </label>

                                            {veiculosExistentes.length >= 1 && (
                                                <button
                                                    type="button"
                                                    className="button-cancelar-home"
                                                    onClick={() => setMostrarFormularioVeiculo(false)}
                                                >
                                                    <img src="/icons/remove.png" alt="Remover" className="remove-home-icon" />
                                                    CANCELAR
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button className='button-cadastrar-home' type="submit">
                                    <img src="/icons/check.png" alt="Check" className="check-home-icon" />
                                    CADASTRAR VEÍCULO
                                </button>
                            </form>
                        )}
                    </>
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
    );
}

export default HomeUsuario;