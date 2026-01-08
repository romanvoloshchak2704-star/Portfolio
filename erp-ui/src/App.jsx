import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Додано useState та useEffect
import Resume from './pages/Resume';
import SkillsPage from './pages/SkillsPage';
import Projects from './pages/Projects';
import Certificates from './pages/Certificates';
import { 
  LayoutDashboard, 
  FileUser, 
  FolderGit2, 
  Award,
  Lock,   // Іконка для входу
  Unlock  // Іконка для адміна
} from 'lucide-react';

import axios from 'axios';

// Налаштування перехоплювача Axios
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers['X-Admin-Key'] = token;
  }
  return config;
});

function App() {
  // Стан для відстеження чи користувач адмін
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('admin_token'));

  // Функція для логіну/виходу
  const handleAdminAuth = () => {
    if (isAdmin) {
      // Вихід
      if (window.confirm("Вийти з режиму адміністратора?")) {
        localStorage.removeItem('admin_token');
        setIsAdmin(false);
        window.location.reload(); // Перезавантажуємо, щоб оновити доступ у всіх компонентах
      }
    } else {
      // Вхід
      const password = prompt("Введіть адміністративний ключ доступу:");
      if (password) {
        localStorage.setItem('admin_token', password);
        setIsAdmin(true);
        window.location.reload(); // Перезавантажуємо для активації адмін-прав
      }
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        {/* NAVIGATION BAR */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex gap-8">
              <Link to="/" className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition tracking-tight">
                <FileUser size={18} className="text-blue-500" /> Резюме
              </Link>
              
              <Link to="/skills" className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition tracking-tight">
                <LayoutDashboard size={18} className="text-blue-500" /> Навички
              </Link>
              
              <Link to="/projects" className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition tracking-tight">
                <FolderGit2 size={18} className="text-blue-500" /> Проєкти
              </Link>

              <Link to="/certificates" className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition tracking-tight">
                <Award size={18} className="text-blue-500" /> Сертифікати
              </Link>
            </div>

            <div className="flex items-center gap-6">
              {/* Логотип (приховано на мобільних) */}
              <div className="hidden lg:block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                  ERP <span className="text-blue-500 underline decoration-2">Portfolio</span>
                </span>
              </div>

              {/* Кнопка ADMIN LOGIN */}
              <button 
                onClick={handleAdminAuth}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                  isAdmin 
                    ? 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100' 
                    : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isAdmin ? (
                  <><Unlock size={14} strokeWidth={3} /> Admin Mode</>
                ) : (
                  <><Lock size={14} strokeWidth={3} /> Admin Login</>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ROUTES CONTENT */}
        <main className="animate-in fade-in duration-500">
          <Routes>
            <Route path="/" element={<Resume />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/certificates" element={<Certificates />} />
          </Routes>
        </main>
        
        <footer className="py-10 text-center border-t border-slate-200 mt-20">
          <p className="text-slate-400 text-sm font-medium">
            © 2026 Roman Voloshchak — Побудовано на .NET 9 & React
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;