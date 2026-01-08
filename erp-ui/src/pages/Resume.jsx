import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FaGithub, FaEnvelope, FaTelegram, FaTimes, 
  FaChevronLeft, FaChevronRight, FaSearch, FaLayerGroup, FaEye,
  FaEdit, FaTrash, FaGlobe
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function Resume() {
  const [skills, setSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [languages, setLanguages] = useState([]); // Стан для мов
  const [newLang, setNewLang] = useState({ name: '', level: '' }); // Для додавання мови адміном

  // ПЕРЕВІРКА СТАТУСУ АДМІНІСТРАТОРА
  const isAdmin = !!localStorage.getItem('admin_token');

  // Стани для модалок
  const [activeCert, setActiveCert] = useState(null);
  const [activeSkill, setActiveSkill] = useState(null); 
  const [skillImagePreview, setSkillImagePreview] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Стани для фільтрації та пошуку
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Всі");

  // Стани для розгортання
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCerts, setShowAllCerts] = useState(false);

  const API_BASE = 'http://localhost:5000';
  const SKILLS_LIMIT = 12;
  const CERTS_LIMIT = 3;

  const fetchLanguages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Languages`);
      setLanguages(res.data);
    } catch (err) { console.error("Помилка завантаження мов", err); }
  };

  useEffect(() => {
    axios.get(`${API_BASE}/api/Skills`).then(res => setSkills(res.data));
    axios.get(`${API_BASE}/api/Certificates`).then(res => setCertificates(res.data));
    fetchLanguages();
  }, []);

  const handleAddLanguage = async () => {
    if (!newLang.name || !newLang.level) return;
    const headers = { 'X-Admin-Key': localStorage.getItem('admin_token') };
    await axios.post(`${API_BASE}/api/Languages`, newLang, { headers });
    setNewLang({ name: '', level: '' });
    fetchLanguages();
  };

  const deleteLanguage = async (id) => {
    const headers = { 'X-Admin-Key': localStorage.getItem('admin_token') };
    await axios.delete(`${API_BASE}/api/Languages/${id}`, { headers });
    fetchLanguages();
  };

  const calculateAge = (birthDateString) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const categoriesList = ["Всі", ...new Set(skills.flatMap(s => s.categories?.map(c => c.name) || []))];

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Всі" || skill.categories?.some(c => c.name === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const nextImg = (e) => { 
    e.stopPropagation(); 
    setCurrentImgIndex(prev => (prev < activeCert.images.length - 1 ? prev + 1 : 0)); 
  };
  
  const prevImg = (e) => { 
    e.stopPropagation(); 
    setCurrentImgIndex(prev => (prev > 0 ? prev - 1 : activeCert.images.length - 1)); 
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {isAdmin && (
          <div className="mb-6 flex justify-center">
            <div className="bg-green-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg animate-pulse">
              Режим адміністратора активовано
            </div>
          </div>
        )}

        {/* MODALS (Skills Preview, Skill Details, Certificate Gallery) - ідентичні твоїм */}
        {skillImagePreview && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={() => setSkillImagePreview(null)}>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"><FaTimes size={32}/></button>
            <img src={`${API_BASE}${skillImagePreview}`} className="max-w-full max-h-[90vh] rounded-xl" alt="Preview" />
          </div>
        )}

        {activeSkill && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4" onClick={() => setActiveSkill(null)}>
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {activeSkill.categories?.map(c => (
                        <span key={c.id} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-md tracking-widest">{c.name}</span>
                      ))}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900">{activeSkill.name}</h2>
                  </div>
                  <button onClick={() => setActiveSkill(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><FaTimes size={24}/></button>
                </div>
                <div className="max-h-[350px] overflow-y-auto pr-4 text-slate-600 leading-relaxed text-sm whitespace-pre-wrap custom-scrollbar">
                  {activeSkill.description || "Опис наразі відсутній..."}
                </div>
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  {isAdmin ? (
                    <Link to="/skills" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg"><FaEdit /> Редагувати</Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <FaLayerGroup className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Технічна документація</span>
                    </div>
                  )}
                  {activeSkill.imagePath && (
                    <button onClick={() => { setSkillImagePreview(activeSkill.imagePath); setActiveSkill(null); }} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-lg"><FaEye /> Переглянути</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeCert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4" onClick={() => setActiveCert(null)}>
            <button className="absolute top-6 right-6 text-white text-3xl z-[110]"><FaTimes /></button>
            {activeCert.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-4 text-white text-4xl p-2 z-[110]"><FaChevronLeft /></button>
                <button onClick={nextImg} className="absolute right-4 text-white text-4xl p-2 z-[110]"><FaChevronRight /></button>
              </>
            )}
            <div className="relative max-w-5xl w-full flex flex-col items-center">
               <img src={`${API_BASE}${activeCert.images[currentImgIndex].imagePath}`} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" alt="Certificate" />
               <p className="mt-6 text-xl font-bold text-white">{activeCert.title}</p>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header className="flex flex-col md:flex-row items-center gap-10 mb-12 p-10 bg-white rounded-[3rem] shadow-sm border border-slate-200/60">
          <div className="shrink-0 relative">
            <div className="w-48 h-48 rounded-[2.2rem] overflow-hidden shadow-xl border-4 border-white">
              <img src="/my-photo.jpg" alt="Роман Волощак" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-6xl font-black tracking-tighter mb-4 text-slate-900">Роман <span className="text-blue-600">Волощак</span></h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-500 font-bold mb-8">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs uppercase">Fullstack Developer</span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs uppercase">🎂 {calculateAge("1999-05-15")} років</span>
              <span className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs uppercase">📍 Україна</span>
            </div>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="https://github.com/rorshah72" target="_blank" className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg"><FaGithub size={22}/></a>
              <a href="https://t.me/rorshah72" target="_blank" className="p-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-lg"><FaTelegram size={22}/></a>
              <a href="mailto:vaman@example.com" className="p-4 bg-white text-slate-600 border border-slate-200 rounded-2xl hover:text-blue-600 transition-all shadow-sm"><FaEnvelope size={22}/></a>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            
            {/* SKILLS */}
            <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200/60">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <h2 className="text-sm uppercase tracking-[0.2em] text-slate-900 font-black flex items-center gap-3">
                  <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Технічний стек
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input type="text" placeholder="Пошук..." className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-32 md:w-48 outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <select className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 py-2.5 px-3 outline-none" onChange={(e) => setSelectedCategory(e.target.value)}>
                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {(showAllSkills ? filteredSkills : filteredSkills.slice(0, SKILLS_LIMIT)).map(skill => (
                  <button key={skill.id} onClick={() => setActiveSkill(skill)} className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/30 transition-all text-sm">
                    {skill.name}
                  </button>
                ))}
                {filteredSkills.length > SKILLS_LIMIT && (
                  <button onClick={() => setShowAllSkills(!showAllSkills)} className="px-6 py-3 bg-slate-50 text-slate-500 font-bold text-sm hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-slate-200">
                    {showAllSkills ? "Згорнути" : `+ ще ${filteredSkills.length - SKILLS_LIMIT}`}
                  </button>
                )}
              </div>
            </section>

            {/* CERTIFICATES */}
            <section className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-200/60">
              <div className="flex items-center justify-between mb-10">
                  <h2 className="text-sm uppercase tracking-[0.2em] text-slate-900 font-black flex items-center gap-3">
                      <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Освіта та Сертифікація
                  </h2>
                  {certificates.length > CERTS_LIMIT && (
                    <button onClick={() => setShowAllCerts(!showAllCerts)} className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                      {showAllCerts ? "Згорнути" : `Всі (${certificates.length})`}
                    </button>
                  )}
              </div>
              <div className="grid gap-4">
                {(showAllCerts ? certificates : certificates.slice(0, CERTS_LIMIT)).map(cert => (
                  <div key={cert.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 border border-slate-200/50 rounded-2xl hover:bg-white hover:border-blue-300 transition-all group gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">📜</div>
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{cert.title}</h3>
                        <p className="text-sm text-slate-500 font-medium">{cert.issuer} • {cert.issueDate ? new Date(cert.issueDate).getFullYear() : '—'}</p>
                      </div>
                    </div>
                    {cert.images?.length > 0 && (
                      <button onClick={() => { setActiveCert(cert); setCurrentImgIndex(0); }} className="px-5 py-3 bg-white text-slate-900 text-[10px] uppercase tracking-widest font-black rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white transition-all shadow-sm">Докладніше</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl"></div>
              <h3 className="font-black text-2xl mb-6 relative z-10">Про мене</h3>
              <p className="text-slate-400 leading-relaxed text-sm relative z-10 font-medium">
                Я розробляю цифрові продукти з фокусом на продуктивність, масштабовану архітектуру та бездоганний досвід користувача. Постійно досліджую нові технології екосистеми .NET та React.
              </p>
            </div>

            {/* LANGUAGE SECTION */}
            <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm">
              <h3 className="font-black text-xl mb-6 text-slate-900 flex items-center gap-2">
                <FaGlobe className="text-blue-600" /> Знання мов
              </h3>
              <div className="space-y-4">
                {languages.map(lang => (
                  <div key={lang.id} className="flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-slate-800">{lang.name}</p>
                      <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{lang.level}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => deleteLanguage(lang.id)} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                        <FaTrash size={12}/>
                      </button>
                    )}
                  </div>
                ))}
                
                {isAdmin && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
                    <input placeholder="Мова" className="w-full p-2 bg-slate-50 rounded-lg text-xs" value={newLang.name} onChange={e => setNewLang({...newLang, name: e.target.value})} />
                    <input placeholder="Рівень (напр. B2)" className="w-full p-2 bg-slate-50 rounded-lg text-xs" value={newLang.level} onChange={e => setNewLang({...newLang, level: e.target.value})} />
                    <button onClick={handleAddLanguage} className="w-full py-2 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase">Додати мову</button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-10 bg-white border border-slate-200 rounded-[3rem] text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner">
                <FaEnvelope />
              </div>
              <h3 className="font-black text-xl mb-2 text-slate-900">На зв'язку?</h3>
              <p className="text-sm text-slate-500 mb-8 opacity-80">Завжди відкритий до цікавих пропозицій та Open Source проєктів.</p>
              <a href="mailto:vaman@example.com" className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Надіслати Email
              </a>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}