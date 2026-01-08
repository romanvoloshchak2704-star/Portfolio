import { useEffect, useState } from 'react';
import axios from 'axios';
import { FolderGit2, Plus, Code, X, Trash2, Github, ExternalLink, Search, Edit3 } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Всі");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ 
    title: '', description: '', status: 'В розробці', 
    codeSnippet: '', githubUrl: '', liveDemoUrl: '' 
  });

  const isAdmin = !!localStorage.getItem('admin_token');
  const API_BASE = 'http://localhost:5000/api/Projects';

  const fetchProjects = async () => {
    const res = await axios.get(API_BASE);
    setProjects(res.data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const openModal = (project = null) => {
    if (project) {
      setEditingId(project.id);
      setFormData(project);
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', status: 'В розробці', codeSnippet: '', githubUrl: '', liveDemoUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { 'X-Admin-Key': localStorage.getItem('admin_token') };
    if (editingId) {
      await axios.put(`${API_BASE}/${editingId}`, { ...formData, id: editingId }, { headers });
    } else {
      await axios.post(API_BASE, formData, { headers });
    }
    setIsModalOpen(false);
    fetchProjects();
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "Всі" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <FolderGit2 className="text-blue-600" size={40} /> Проєкти
        </h1>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Пошук..." 
              className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white border rounded-xl font-bold text-slate-600"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Всі">Всі статуси</option>
            <option value="В розробці">В розробці</option>
            <option value="Завершено">Завершено</option>
          </select>
          {isAdmin && (
            <button onClick={() => openModal()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
              <Plus size={20} /> Створити
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                project.status === 'Завершено' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {project.status}
              </span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => openModal(project)} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={16}/></button>
                  <button onClick={() => axios.delete(`${API_BASE}/${project.id}`, { headers: { 'X-Admin-Key': localStorage.getItem('admin_token') } }).then(fetchProjects)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-3">{project.description}</p>
            <div className="flex gap-4 mb-6">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600">
                  <Github size={16} /> GitHub
                </a>
              )}
              {project.liveDemoUrl && (
                <a href={project.liveDemoUrl} target="_blank" className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600">
                  <ExternalLink size={16} /> Live Demo
                </a>
              )}
            </div>
            {project.codeSnippet && (
              <pre className="bg-slate-900 rounded-xl p-4 text-blue-300 text-[10px] overflow-x-auto font-mono">
                <code>{project.codeSnippet}</code>
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{editingId ? "Редагувати" : "Новий проєкт"}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Назва" className="p-4 bg-slate-50 rounded-xl md:col-span-2" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <textarea placeholder="Опис" className="p-4 bg-slate-50 rounded-xl md:col-span-2 h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <select className="p-4 bg-slate-50 rounded-xl font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="В розробці">В розробці</option>
                <option value="Завершено">Завершено</option>
              </select>
              <input placeholder="GitHub URL" className="p-4 bg-slate-50 rounded-xl" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              <input placeholder="Live Demo URL" className="p-4 bg-slate-50 rounded-xl" value={formData.liveDemoUrl} onChange={e => setFormData({...formData, liveDemoUrl: e.target.value})} />
              <textarea placeholder="Code Snippet" className="p-4 bg-slate-50 rounded-xl md:col-span-2 font-mono text-xs h-32" value={formData.codeSnippet} onChange={e => setFormData({...formData, codeSnippet: e.target.value})} />
              <div className="md:col-span-2 flex gap-3">
                 <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase">Зберегти</button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 bg-slate-100 rounded-xl font-bold">Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}