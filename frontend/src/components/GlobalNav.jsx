import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function GlobalNav({ onOpenSettings, onOpenAuth, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <button 
        id="globalMenuBtn" 
        className="global-menu-btn" 
        title="Menu"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        style={{ display: location.pathname === '/play' ? 'none' : 'block' }} // Hide in coding screen
      >
        ☰
      </button>

      {location.pathname !== '/play' && (
        <nav className={`main-nav ${menuOpen ? 'show' : ''}`} id="globalNav" ref={navRef}>
          <div className="nav-logo"><Link style={{color:'inherit', textDecoration:'none'}} to="/">{t('nav_logo')}</Link></div>
          <ul className="nav-links">
            <li><Link to="/">{t('nav_home')}</Link></li>
            <li><Link to="/play">{t('nav_play')}</Link></li>
            <li><Link to="/note">{t('nav_note')}</Link></li>
            <li><Link to="/pattern">{t('nav_pattern') || "패턴분석"}</Link></li>
            <li><Link to="/customize">{t('nav_customize')}</Link></li>
          </ul>
        </nav>
      )}

      {location.pathname !== '/play' && (
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          <div className="top-right-controls" style={{position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 1000}}>
            <button id="globalSettingsBtn" className="settings-btn" title="Settings" onClick={onOpenSettings}>⚙️</button>
            <img src="/images/login.png" alt="Login" id="loginBtn" className="login-btn" title="Login" onClick={onOpenAuth} style={{height:'36px', width:'auto', cursor:'pointer'}} />
          </div>
        </div>
      )}
    </>
  );
}
