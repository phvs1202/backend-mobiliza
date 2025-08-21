import './TermosECondicoes.css'
import "../../../components/CSSGeral/CSSGeral.css";
import Navbar from '../../../components/Navbar/Navbar';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

function TermosECondicoes() {
    const navigate = useNavigate();

    return (
        <>
            <div className='app-container'>
                <Navbar>
                    <ul className='nav-list'>
                        <li>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(-1);
                                }}
                            >
                                Voltar
                            </a>
                        </li>
                    </ul>
                </Navbar>
                <main className='main-termos'>
                    <div className='texto-termos'>
                        <h1>Termos e Condições de Uso – MOBILIZA (SENAI Lençóis Paulista)</h1>
                        <hr/>
                        <h3>1. Aceitação dos Termos</h3>
                        <p>Ao utilizar o site MOBILIZA, você concorda com os presentes Termos e Condições de Uso. Caso não concorde, pedimos que não utilize este sistema.</p>

                        <h3>2. Objetivo do Site</h3>
                        <p>O MOBILIZA é um sistema voltado para o gerenciamento de entradas e saídas de veículos no estacionamento do SENAI de Lençóis Paulista. O objetivo principal é garantir a segurança e controle de acesso, permitindo o registro de usuários habilitados (com CNH válida) e de seus respectivos veículos.</p>

                        <h3>3. Cadastro e Responsabilidades</h3>
                        <p>Para utilizar o sistema, o usuário deverá realizar um cadastro fornecendo os seguintes dados:</p>
                        <ul>
                            <li>Nome completo;</li>
                            <li>Endereço de e-mail válido;</li>
                            <li>Número da CNH, categorias e data de validade;</li>
                            <li>Tipo e placa do veículo;</li>
                            <li>Curso realizado (caso seja aluno);</li>
                            <li>Foto do veículo (opcional).</li>
                        </ul>
                        <p>O usuário declara que todas as informações fornecidas são verdadeiras e atualizadas. Informações falsas poderão acarretar a exclusão da conta e responsabilização conforme a legislação aplicável.</p>

                        <h3>4. Acesso ao Sistema</h3>
                        <p>O acesso é permitido para usuários que possuam uma CNH válida e que estejam vinculados ao SENAI Lençóis Paulista, seja como aluno, funcionário ou visitante autorizado.</p>

                        <h3>5. Uso do Sistema</h3>
                        <p>Os dados coletados têm como finalidade:</p>
                        <ul>
                            <li>Controlar o acesso ao estacionamento;</li>
                            <li>Identificar os responsáveis em caso de incidentes;</li>
                            <li>Garantir a segurança dos usuários e seus veículos.</li>
                        </ul>

                        <h3>6. Privacidade e Proteção de Dados</h3>
                        <p>As informações fornecidas são protegidas conforme a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018). Detalhes completos estão descritos na nossa <a href="/politica-de-privacidade">Política de Privacidade</a>.</p>

                        <h3>7. Alterações dos Termos</h3>
                        <p>Os termos aqui descritos poderão ser atualizados a qualquer momento, com ou sem aviso prévio. É responsabilidade do usuário verificar periodicamente esta página.</p>

                        <h3>8. Aceitação</h3>
                        <p>Ao se cadastrar no site, o usuário declara que leu e concorda com estes Termos e Condições, sendo este aceite registrado digitalmente no ato do cadastro.</p>

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
        </>
    );
}

export default TermosECondicoes