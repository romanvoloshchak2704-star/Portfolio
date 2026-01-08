import { useState } from 'react';

export default function AdminWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Зберігаємо введений пароль як токен
    localStorage.setItem('admin_token', password);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    window.location.href = "/"; // Повертаємо на головну
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black mb-2">Адмін-доступ</h2>
          <p className="text-slate-500 text-sm mb-8">Введіть секретний ключ для керування даними</p>
          
          <input 
            type="password" 
            placeholder="Введіть ключ..." 
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 mb-4 outline-none focus:ring-2 focus:ring-blue-400 transition-all text-center font-bold tracking-widest"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            Підтвердити
          </button>
        </div>
      </div>
    );
  }

  // Якщо авторизований — показуємо контент (сторінку) + кнопку виходу (опціонально)
  return (
    <div className="relative">
        <button 
          onClick={handleLogout}
          className="fixed bottom-6 right-6 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 hover:bg-red-600 hover:text-white transition-all z-[100]"
        >
            Вийти з сесії
        </button>
        {children}
    </div>
  );
}