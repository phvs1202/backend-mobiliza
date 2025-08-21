import './Footer.css';
import '../CSSGeral/CSSGeral.css';
import LinkNavbar from '../LinkNavbar/LinkNavbar';
import '../Navbar/Navbar.css';
 
function Footer(props) {
    return (
        <>
            <footer>
                <div className='footer-items'>
                    <img src='/images/senai.png' />
                    {props.children}
                    {/*<ul className='nav-list'>
                        <LinkNavbar link='#' linkName='Nome'/>
                        <LinkNavbar link='#' linkName='Nome'/>
                        <LinkNavbar link='#' linkName='Nome'/>
                        <LinkNavbar link='#' linkName='Nome'/>
                        <LinkNavbar link='#' linkName='Nome'/>
                    </ul>*/}
                </div>
                <hr></hr>
                <div className='footer-texts'>
                    <label>Desenvolvido pelo grupo do Desenvolvimento de Sistemas MOBILIZA</label>
                    <label>&copy; 2025 - Todos os direitos reservados</label>
                </div>
            </footer>
        </>
    );
}

export default Footer;
