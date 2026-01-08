import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import { 
  Plus, Database, X, Image as ImageIcon, UploadCloud, 
  Trash2, Tag, Maximize2, Save, Edit3, Search, Filter 
} from 'lucide-react'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [categories, setCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSkill, setActiveSkill] = useState(null) 
  const [activeImage, setActiveImage] = useState(null) 
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Всі')
  const [newCatName, setNewCatName] = useState('')

  const [newSkill, setNewSkill] = useState({ 
    name: '', description: '', personalConclusion: '', categoryIds: [] 
  })

  // ПЕРЕВІРКА СТАТУСУ АДМІНІСТРАТОРА
  const isAdmin = !!localStorage.getItem('admin_token');

  const API_BASE = 'http://localhost:5000'

  const fetchData = async () => {
    try {
      const [skillsRes, catsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/Skills`),
        axios.get(`${API_BASE}/api/Categories`)
      ])
      setSkills(skillsRes.data)
      setCategories(catsRes.data)
    } catch (err) { console.error("Load error:", err) }
  }

  useEffect(() => { fetchData() }, [])

  const handleAddCategory = async () => {
    if (!newCatName.trim() || !isAdmin) return
    try {
      const res = await axios.post(`${API_BASE}/api/Categories`, { name: newCatName })
      setCategories([...categories, res.data])
      setNewCatName('')
      setNewSkill(prev => ({
        ...prev,
        categoryIds: [...prev.categoryIds, res.data.id]
      }))
    } catch (err) { alert("Помилка створення категорії") }
  }

  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            skill.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Всі' || 
                              skill.categories?.some(c => c.name === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [skills, searchTerm, selectedCategory]);

  const handleFileUpload = async (skillId, file) => {
    if (!file || !isAdmin) return
    const formData = new FormData()
    formData.append('file', file)
    try {
      await axios.post(`${API_BASE}/api/Skills/${skillId}/upload-image`, formData)
      fetchData()
    } catch (err) { alert("Помилка завантаження фото") }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    try {
      if (newSkill.id) {
        await axios.put(`${API_BASE}/api/Skills/${newSkill.id}`, newSkill)
      } else {
        await axios.post(`${API_BASE}/api/Skills`, newSkill)
      }
      setIsModalOpen(false)
      setNewSkill({ name: '', description: '', personalConclusion: '', categoryIds: [] })
      fetchData()
    } catch (err) { alert("Помилка при збереженні") }
  }

  const toggleCategory = (catId) => {
    setNewSkill(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(catId)
        ? prev.categoryIds.filter(id => id !== catId)
        : [...prev.categoryIds, catId]
    }))
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      
      {activeImage && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setActiveImage(null)}>
          <img src={activeImage} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl" alt="Full" />
          <button className="absolute top-8 right-8 text-white/50 hover:text-white"><X size={40}/></button>
        </div>
      )}

      {activeSkill && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActiveSkill(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-black text-slate-800">{activeSkill.name}</h2>
                <button onClick={() => setActiveSkill(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
             </div>
             <div className="max-h-80 overflow-y-auto custom-scrollbar text-slate-600 mb-6 pr-4 whitespace-pre-wrap leading-relaxed">
                {activeSkill.description}
             </div>
             <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 italic text-blue-700 text-sm mb-8">
                "{activeSkill.personalConclusion}"
             </div>
             <button onClick={() => setActiveSkill(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all">Закрити вікно</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Database className="text-blue-600" size={32}/> Skills Hub
          </h1>
          <p className="text-slate-500 font-medium mt-1">Знайдено: {filteredSkills.length} навичок</p>
        </div>
        
        {/* КНОПКА СТВОРЕННЯ (ТІЛЬКИ ДЛЯ АДМІНА) */}
        {isAdmin && (
          <button onClick={() => { setNewSkill({ name: '', description: '', personalConclusion: '', categoryIds: [] }); setIsModalOpen(true); }} 
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-200 active:scale-95">
            <Plus size={20}/> Створити навичку
          </button>
        )}
      </div>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Шукати за назвою..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative min-w-[240px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <select 
            className="w-full pl-12 pr-10 py-4 bg-white border border-slate-200 rounded-2xl outline-none appearance-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer font-bold text-slate-700"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="Всі">Усі категорії</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSkills.map(skill => (
          <div key={skill.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-7 flex flex-col hover:shadow-2xl transition-all relative group h-full hover:-translate-y-1">
            <div className="flex justify-between items-start mb-5">
               <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                  {skill.categories?.map(c => (
                    <span key={c.id} className="text-[10px] font-black uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      {c.name}
                    </span>
                  ))}
               </div>
               
               {/* КНОПКИ РЕДАГУВАННЯ ТА ВИДАЛЕННЯ (ТІЛЬКИ ДЛЯ АДМІНА) */}
               {isAdmin && (
                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { 
                      setNewSkill({ 
                        id: skill.id, 
                        name: skill.name, 
                        description: skill.description, 
                        personalConclusion: skill.personalConclusion, 
                        categoryIds: skill.categories?.map(c => c.id) || [] 
                      }); 
                      setIsModalOpen(true); 
                    }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => { if(window.confirm('Видалити навичку?')) axios.delete(`${API_BASE}/api/Skills/${skill.id}`).then(fetchData)}} 
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                 </div>
               )}
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-3">{skill.name}</h3>
            
            <div className="flex gap-2 mb-6">
              {skill.imagePath && (
                <button onClick={() => setActiveImage(`${API_BASE}${skill.imagePath}`)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 transition-all shadow-lg shadow-slate-200">
                  <Maximize2 size={14}/> Дивитись
                </button>
              )}
              
              {/* ЗАВАНТАЖЕННЯ СКРІНШОТА (ТІЛЬКИ ДЛЯ АДМІНА) */}
              {isAdmin && (
                <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer hover:border-blue-500 hover:text-blue-600 transition-all">
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(skill.id, e.target.files[0])} />
                  <UploadCloud size={14}/> Скріншот
                </label>
              )}
            </div>

            <p className="text-slate-400 text-xs line-clamp-3 mb-8 italic leading-relaxed">"{skill.personalConclusion}"</p>
            
            <button onClick={() => setActiveSkill(skill)} className="mt-auto w-full py-4 bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 hover:text-white transition-all">
              Детальний опис
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: CREATE / EDIT (ТІЛЬКИ ЯКЩО АДМІН) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-2xl w-full shadow-2xl relative max-h-[95vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-3xl font-black text-slate-800">{newSkill.id ? 'Редагування' : 'Створення'}</h2>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={28}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Назва навички</label>
                <input required className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none font-bold text-slate-700" value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} />
              </div>
              
              <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center mb-2">
                   <label className="text-[11px] font-black uppercase text-slate-400">Категорії</label>
                   <div className="flex gap-2">
                      <input placeholder="Нова категорія..." className="text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 w-40" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                      <button type="button" onClick={handleAddCategory} className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"><Plus size={18}/></button>
                   </div>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {categories.map(cat => (
                    <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${newSkill.categoryIds.includes(cat.id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Детальний опис</label>
                <textarea rows={5} className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none text-slate-600 text-sm leading-relaxed" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 ml-4">Короткий висновок</label>
                <input className="w-full p-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 border-none italic text-slate-600" value={newSkill.personalConclusion} onChange={e => setNewSkill({...newSkill, personalConclusion: e.target.value})} />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98]">
                  <Save className="inline-block mr-2" size={20}/> Зберегти дані
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}