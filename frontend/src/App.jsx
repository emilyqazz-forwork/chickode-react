import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { SettingModal } from './components/SettingModal';
import { AuthModal } from './components/AuthModal';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { Note } from './pages/Note';
import { Pattern } from './pages/Pattern';
import { Customize } from './pages/Customize';
import { Result } from './pages/Result';
import { useI18n } from './state/i18n';

function App() {
  const { t, params, setParams } = useI18n();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  return (
    <BrowserRouter>
      <Nav
        onOpenSettings={() => setShowSettings(true)}
        onOpenAuth={() => setShowAuth(true)}
        t={t}
      />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} t={t} />}
      {showSettings && <SettingModal onClose={() => setShowSettings(false)} t={t} params={params} setParams={setParams} />}
      <Routes>
        <Route path="/" element={<Home t={t} />} />
        <Route path="/play" element={<Play t={t} />} />
        <Route path="/note" element={<Note t={t} />} />
        <Route path="/pattern" element={<Pattern t={t} />} />
        <Route path="/customize" element={<Customize t={t} />} />
        <Route path="/result" element={<Result t={t} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
