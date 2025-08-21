import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar(props) {
  const [menuAberto, setMenuAberto] = useState(false);

  const temMenu = React.Children.count(props.children) > 0;
  const fecharMenu = () => setMenuAberto(false);

  useEffect(() => {
    if (menuAberto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [menuAberto]);

  return (
    <>
      <nav className='navbar'>
        <img src='/images/projeto-mobiliza.png' alt='Logo' className='navbar-logo' />

        {temMenu && (
          <div
            className='menu-toggle'
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label='Abrir menu'
            role='button'
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setMenuAberto(!menuAberto); }}
          >
            &#9776;
          </div>
        )}

        {temMenu && (
          <ul className={`navbar-menu ${menuAberto ? 'aberto' : ''}`}>
            {props.children}
          </ul>
        )}
      </nav>

      {/* Overlay só aparece se menu aberto */}
      {menuAberto && <div className='overlay' onClick={fecharMenu} />}
    </>
  );
}

export default Navbar;