import './PoliticaDePrivacidade.css'
import "../../../components/CSSGeral/CSSGeral.css";
import Navbar from '../../../components/Navbar/Navbar';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

function PoliticaDePrivacidade() {
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
                <main className='main-politica'>
                    <div className='texto-termos'>
                        <h1>Política de Privacidade – MOBILIZA (SENAI Lençóis Paulista)</h1>
                        <hr />

                        <h3>1. Consentimento para tratamento de dados</h3>
                        <p>Ao aceitar a presente Política de Privacidade no momento do cadastro, o usuário (Titular dos dados) consente que o SENAI-SP, na qualidade de Controlador, realize o tratamento de seus dados pessoais conforme previsto na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

                        <h3>2. Dados coletados</h3>
                        <p>Durante o uso do sistema MOBILIZA, poderão ser coletados os seguintes dados pessoais:</p>
                        <ul>
                            <li>Nome completo;</li>
                            <li>Nome social (quando aplicável);</li>
                            <li>Número da CNH (número, categorias e validade);</li>
                            <li>E-mail;</li>
                            <li>Tipo de veículo e placa;</li>
                            <li>Curso (quando aplicável);</li>
                            <li>Fotografia do veículo (opcional);</li>
                            <li>Comunicação mantida com o SENAI;</li>
                        </ul>

                        <h3>3. Finalidade do tratamento</h3>
                        <p>Os dados coletados poderão ser utilizados para:</p>
                        <ul>
                            <li>Gerenciar o acesso e uso do estacionamento;</li>
                            <li>Permitir que o SENAI identifique e entre em contato com o usuário;</li>
                            <li>Cumprir obrigações legais e regulatórias perante órgãos públicos;</li>
                            <li>Garantir a segurança da comunidade escolar e do patrimônio;</li>
                            <li>Gerar relatórios administrativos e educacionais;</li>
                            <li>Atender a contratos com empresas parceiras em programas de aprendizagem ou estágios.</li>
                        </ul>

                        <h3>4. Compartilhamento de dados</h3>
                        <p>O usuário autoriza o compartilhamento de seus dados pessoais com terceiros, observados os princípios da LGPD, nas seguintes situações:</p>
                        <ul>
                            <li>Entre unidades do SENAI-SP e entidades relacionadas (SESI-SP, FIESP e SENAI Departamento Nacional);</li>
                            <li>Com parceiros comerciais vinculados às atividades educacionais e ao sistema MOBILIZA;</li>
                            <li>Com provedores de plataformas digitais utilizadas pelo SENAI-SP para eventos e comunicações;</li>
                            <li>Com empresas empregadoras em cursos vinculados a aprendizagem, estágio ou benefícios concedidos;</li>
                            <li>Com prefeituras e empresas de transporte para concessão ou validação de benefícios;</li>
                            <li>Com a Associação de Pais e Mestres (APM), quando o aluno optar por participar;</li>
                            <li>Com órgãos públicos e autoridades competentes, quando houver obrigação legal.</li>
                        </ul>

                        <h3>5. Prazo de retenção</h3>
                        <p>Os dados pessoais serão mantidos durante todo o período necessário para as finalidades descritas nesta Política. Após o término da relação, poderão ser armazenados pelo tempo exigido por obrigações legais e regulatórias.</p>

                        <h3>6. Revogação do consentimento</h3>
                        <p>O usuário poderá revogar seu consentimento a qualquer momento, mediante solicitação. A revogação poderá implicar na impossibilidade de uso do sistema MOBILIZA ou de cumprimento de obrigações vinculadas.</p>

                        <h3>7. Direitos do usuário</h3>
                        <p>O usuário, como Titular dos dados, poderá solicitar:</p>
                        <ul>
                            <li>Confirmação da existência de tratamento;</li>
                            <li>Acesso aos seus dados;</li>
                            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                            <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                            <li>Portabilidade dos dados, quando aplicável;</li>
                            <li>Eliminação dos dados tratados com consentimento, salvo obrigações legais;</li>
                            <li>Informação sobre entidades com as quais seus dados foram compartilhados;</li>
                            <li>Revogação do consentimento.</li>
                        </ul>

                        <h3>8. Segurança dos dados</h3>
                        <p>O SENAI-SP adota medidas técnicas e administrativas adequadas para proteger os dados contra acessos não autorizados, perdas, alterações ou vazamentos. O acesso é restrito a colaboradores autorizados.</p>

                        <h3>9. Alterações nesta Política</h3>
                        <p>Esta Política poderá ser modificada a qualquer momento. A versão mais atual estará sempre disponível no site MOBILIZA. Em caso de alterações relevantes, o usuário será informado no momento do login ou cadastro.</p>

                        <h3>10. Contato</h3>
                        <p>Para exercer seus direitos ou em caso de dúvidas sobre esta Política de Privacidade, entre em contato pelos canais oficiais:</p>
                        <ul>
                            <li>Telefone: (11) 3322-0050 – Capital, Grande São Paulo e Outros Estados;</li>
                            <li>Telefone: 0800-055-1000 – Interior de SP;</li>
                            <li>E-mail: faleconosco@sesisenaisp.org.br;</li>
                            <li>Atendimento: segunda a sexta (08h às 20h) e sábado (08h às 14h);</li>
                            <li>Ou diretamente na administração do SENAI Lençóis Paulista.</li>
                        </ul>
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

export default PoliticaDePrivacidade