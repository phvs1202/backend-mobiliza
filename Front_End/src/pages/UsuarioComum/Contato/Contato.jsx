import './Contato.css'
import "../../../components/CSSGeral/CSSGeral.css";
import Navbar from '../../../components/Navbar/Navbar';
import LinkNavbar from '../../../components/LinkNavbar/LinkNavbar';
import Footer from '../../../components/Footer/Footer';
import { useNavigate } from 'react-router-dom';

function Contato() {
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
                <main className='main-contato'>
                    <div className='texto-contato'>
                        <h1>Contatos</h1>
                        <hr/>
                        
                        <div className='texto-contato-interno'>
                            <p style={{ fontWeight: 'bold' }}>Contato SENAI Lençóis Paulista: <br/> <span style={{ fontStyle: 'italic', fontWeight: 'normal' }}>(14) 3269-3969: Whatsapp e telefone.</span></p>
                            <p style={{ fontWeight: 'bold' }}>Email SENAI Lençóis Paulista: <br/> <span className='email-text' style={{ fontStyle: 'italic', fontWeight: 'normal' }}>senailencoispaulista@sp.senai.br</span></p>
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
        </>
    );
}

export default Contato;