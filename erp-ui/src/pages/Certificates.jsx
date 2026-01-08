import { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Plus, Trash2, X, UploadCloud } from 'lucide-react';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCert, setNewCert] = useState({ title: '', issuer: '' });
  
  // ПЕРЕВІРКА СТАТУСУ АДМІНІСТРАТОРА
  const isAdmin = !!localStorage.getItem('admin_token');
  
  const API_BASE = 'http://localhost:5000';

  const fetchCertificates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/Certificates`);
      setCertificates(res.data);
    } catch (err) {
      console.error("Помилка завантаження:", err);
    }
  };

  useEffect(() => { fetchCertificates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await axios.post(`${API_BASE}/api/Certificates`, newCert);
      setIsModalOpen(false);
      setNewCert({ title: '', issuer: '' });
      fetchCertificates();
    } catch (err) {
      alert("Помилка при створенні");
    }
  };

  const handleFileUpload = async (certId, files) => {
    if (!isAdmin || !files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    try {
      await axios.post(`${API_BASE}/api/Certificates/${certId}/upload-images`, formData);
      fetchCertificates();
    } catch (err) {
      alert("Помилка завантаження фото");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (window.confirm("Видалити сертифікат?")) {
      try {
        await axios.delete(`${API_BASE}/api/Certificates/${id}`);
        fetchCertificates();
      } catch (err) {
        alert("Помилка видалення");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
          <Award className="text-blue-600" size={40} /> Сертифікати
        </h1>
        
        {/* КНОПКА ДОДАННЯ (ТІЛЬКИ ДЛЯ АДМІНА) */}
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
          >
            <Plus size={20} /> Додати документ
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative group hover:shadow-md transition-shadow">
            
            {/* КНОПКА ВИДАЛЕННЯ (ТІЛЬКИ ДЛЯ АДМІНА) */}
            {isAdmin && (
              <button 
                onClick={() => handleDelete(cert.id)} 
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={20} />
              </button>
            )}
            
            <h3 className="text-xl font-bold mb-1 text-slate-800">{cert.title}</h3>
            <p className="text-blue-600 font-bold text-sm mb-4 uppercase tracking-wider">{cert.issuer}</p>

            <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
              {cert.images?.map(img => (
                <img 
                  key={img.id} 
                  src={`${API_BASE}${img.imagePath}`} 
                  className="h-20 w-28 object-cover rounded-xl border border-slate-100 shadow-sm hover:scale-105 transition-transform" 
                  alt="certificate thumbnail"
                />
              ))}
              
              {/* ЗАВАНТАЖЕННЯ НОВИХ ФОТО (ТІЛЬКИ ДЛЯ АДМІНА) */}
              {isAdmin && (
                <label className="h-20 w-20 shrink-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all text-slate-400">
                  <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(cert.id, e.target.files)} />
                  <UploadCloud size={20} />
                  <span className="text-[10px] font-black mt-1">UPLOAD</span>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL (ТІЛЬКИ ДЛЯ АДМІНА) */}
      {isModalOpen && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in duration-200">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-800">Новий документ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Назва курсу</label>
                <input 
                  placeholder="напр. Docker Advanced" 
                  className="w-full p-4 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none font-medium" 
                  value={newCert.title} 
                  onChange={e => setNewCert({...newCert, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Організація</label>
                <input 
                  placeholder="напр. Udemy" 
                  className="w-full p-4 bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none font-medium" 
                  value={newCert.issuer} 
                  onChange={e => setNewCert({...newCert, issuer: e.target.value})} 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg mt-4 active:scale-95"
              >
                Зберегти в базу
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}