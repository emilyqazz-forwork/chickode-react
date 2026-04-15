import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Nav({ onOpenSettings, onOpenAuth, t }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { pathname } = useLocation();
  const isPlay = pathname === '/play';

  useEffect(() => {
    const close = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (isPlay) return null;

  return (
    <>
      <button
        className="global-menu-btn"
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      >☰</button>

      <nav className={`main-nav ${menuOpen ? 'show' : ''}`} ref={navRef}>
        <div className="nav-logo">
          <Link style={{ color: 'inherit', textDecoration: 'none' }} to="/">{t('nav_logo')}</Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/">{t('nav_home')}</Link></li>
          <li><Link to="/play">{t('nav_play')}</Link></li>
          <li><Link to="/note">{t('nav_note')}</Link></li>
          <li><Link to="/pattern">{t('nav_pattern')}</Link></li>
          <li><Link to="/customize">{t('nav_customize')}</Link></li>
        </ul>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
        <div className="top-right-controls" style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '15px', zIndex: 1000 }}>
          <button className="settings-btn" onClick={onOpenSettings}>⚙️</button>
          <img src="/images/login.png" alt="Login" className="login-btn" onClick={onOpenAuth} style={{ height: '36px', width: 'auto', cursor: 'pointer' }} />
        </div>
      </div>
    </>
  );
}
