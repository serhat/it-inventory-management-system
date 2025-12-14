// client/src/pages/Login.tsx
import { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });

      // --- KRİTİK BÖLÜM ---
      // Gelen bilgileri tarayıcı hafızasına kaydediyoruz
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role); // <-- BU SATIR EKSİKSE ADMİN PANELİ AÇILMAZ
      // --------------------

      alert(`Giriş Başarılı! Hoşgeldin ${response.data.role === 'admin' ? 'Yönetici' : 'Personel'}`);
      
      // Dashboard sayfasına yönlendir (sayfayı yenileyerek)
      window.location.href = '/dashboard'; 

    } catch (err: any) {
      console.error(err);
      setError("Giriş başarısız! Kullanıcı adı veya şifre yanlış.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-100 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 border-t-4 border-blue-600">
        <h2 className="text-2xl font-bold mb-2 text-center text-slate-800">Sistem Girişi</h2>
        <p className="text-center text-slate-500 mb-6 text-sm">Devam etmek için oturum açın</p>
        
        {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm font-bold text-center">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-slate-700 mb-1 text-sm font-bold">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kullanıcı adınız"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-slate-700 mb-1 text-sm font-bold">Şifre</label>
            <input 
              type="password" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-md active:scale-95"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;