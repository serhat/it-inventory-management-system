import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface Item {
  id: number;
  name: string;
  quantity: number;
  assignedTo?: string | null;
  supplier?: { username: string };
}

const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  // Form State'leri
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  
  const navigate = useNavigate();
  // Rol bilgisini al
  const userRole = localStorage.getItem('role'); 

  useEffect(() => {
    // Sadece admin listeyi çeksin, personelin listeyle işi yok
    if (userRole === 'admin') {
      fetchItems();
    }
  }, [userRole]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/materials');
      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/materials', { name, quantity: Number(quantity) });
      alert("Depoya Giriş Başarıyla Yapıldı! ✅");
      setName('');
      setQuantity('');
      // Eğer admin kendisi ekleme yaptıysa listeyi anında yenile
      if (userRole === 'admin') fetchItems(); 
    // handleAdd fonksiyonunun içindeki catch bloğunu bul ve bununla değiştir:

    } catch (error: any) {
      console.error("Hata Detayı:", error);
      
      // Hatanın sebebini ekrana yazdıralım
      if (error.response) {
        // Sunucu cevap verdiyse (Backend'den gelen hata mesajı)
        alert(`Sunucu Hatası: ${error.response.data.error || error.response.status}`);
      } else if (error.request) {
        // Sunucuya hiç ulaşılamadıysa
        alert("Sunucuya ulaşılamıyor! Backend (siyah ekran) çalışıyor mu?");
      } else {
        // Başka bir sorun varsa
        alert(`Bilinmeyen Hata: ${error.message}`);
      }
    }
  };

  const handleAssign = async (item: Item) => {
    // 1. Kime verilecek?
    const unitName = prompt(`"${item.name}" cihazını kime/hangi birime veriyorsunuz?`);
    if (!unitName) return;

    // 2. Kaç tane verilecek?
    const quantityStr = prompt(`Stokta şu an ${item.quantity} adet var. Kaç tanesini veriyorsunuz?`, "1");
    if (!quantityStr) return;
    
    const quantityToAssign = Number(quantityStr);

    // Hata önleme
    if (isNaN(quantityToAssign) || quantityToAssign <= 0) {
      alert("Lütfen geçerli bir sayı girin.");
      return;
    }
    if (quantityToAssign > item.quantity) {
      alert("Hata: Stoktan fazla adet veremezsiniz!");
      return;
    }

    try {
      // Backend'e gönderiyoruz
      await api.patch(`/materials/${item.id}/assign`, { 
        unitName, 
        quantityToAssign 
      });
      
      alert("Zimmet Kaydı Oluşturuldu ve Stoktan Düşüldü! 📦➡️👤");
      fetchItems(); // Tabloyu yenile
   // handleAssign fonksiyonunun sonundaki catch bloğu:

    } catch (error: any) {
      console.error("Zimmet Hatası:", error);
      
      if (error.response) {
        // Backend'in gönderdiği hata mesajını ekrana bas
        alert(`HATA: ${error.response.data.error}`);
      } else {
        alert(`Bilinmeyen Hata: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu kaydı silmek istediğine emin misin?")) return;
    try { await api.delete(`/materials/${id}`); fetchItems(); } catch { alert("Hata"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // ==========================================================
  // SENARYO 1: PERSONEL EKRANI (Sadece Veri Girişi)
  // ==========================================================
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-20 font-sans">
        <nav className="w-full bg-blue-900 text-white p-4 fixed top-0 flex justify-between items-center shadow-lg z-50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚛</span>
            <div className="font-bold text-xl">IT Mal Kabul Terminali</div>
          </div>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition">Güvenli Çıkış</button>
        </nav>

        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-8 border-blue-600 mt-10">
          <h2 className="text-2xl font-bold mb-2 text-slate-800 text-center">Envanter Girişi</h2>
          <p className="text-slate-500 mb-8 text-center text-sm">
            Gelen irsaliyedeki ürünleri sisteme işleyin.
          </p>
          
          <form onSubmit={handleAdd}>
            <div className="mb-5">
              <label className="block text-sm font-bold text-slate-700 mb-2">Cihaz / Ürün Adı</label>
              <input 
                type="text" 
                className="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition bg-slate-50"
                placeholder="Örn: Dell Latitude 3520"
                value={name} onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Gelen Adet</label>
              <input 
                type="number" 
                className="w-full border-2 border-slate-200 p-3 rounded-lg focus:border-blue-500 outline-none transition bg-slate-50"
                placeholder="0"
                value={quantity} onChange={e => setQuantity(e.target.value)}
                required
                min="1"
              />
            </div>
            <button className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition transform active:scale-95 shadow-lg">
              Depoya Kaydet
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            * Kayıtlar anında Admin paneline düşer.
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // SENARYO 2: ADMIN EKRANI (Tam Kontrol)
  // ==========================================================
  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <nav className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🖥️</span>
          <h1 className="text-xl font-bold">IT Yönetim Paneli</h1>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Yönetici Modu</span>
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded text-sm hover:bg-red-700 transition">Çıkış</button>
        </div>
      </nav>

      <div className="container mx-auto p-6">
        
        {/* ÜST BİLGİ KARTI */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border-l-4 border-indigo-500 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-700">Genel Envanter Durumu</h2>
            <p className="text-slate-500 text-sm">Depodaki boşta ürünleri buradan birimlere atayabilirsiniz.</p>
          </div>
          <div className="text-right">
             <div className="text-2xl font-bold text-indigo-600">{items.reduce((acc, item) => acc + item.quantity, 0)}</div>
             <div className="text-xs text-slate-500">Toplam Cihaz</div>
          </div>
        </div>

        {/* LİSTE */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-200 text-slate-700 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 w-32">Durum</th>
                <th className="p-4">Cihaz Adı</th>
                <th className="p-4">Stok / Adet</th>
                <th className="p-4">Konum / Birim</th>
                <th className="p-4 text-center">Yönetim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition group">
                  
                  {/* DURUM İKONU */}
                  <td className="p-4">
                    {item.assignedTo ? (
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-200 block text-center">
                        ZİMMETLİ
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200 block text-center">
                        DEPODA
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-slate-700">{item.name}</td>
                  
                  <td className="p-4 font-mono font-bold text-slate-600">
                    {item.quantity} Adet
                    {item.quantity === 0 && <span className="text-red-500 text-xs ml-2">(Tükendi)</span>}
                  </td>

                  {/* KONUM BİLGİSİ */}
                  <td className="p-4 text-sm">
                    {item.assignedTo ? (
                      <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                        <span>👤</span> {item.assignedTo}
                      </div>
                    ) : (
                      <div className="text-gray-400 italic">Merkez Depo</div>
                    )}
                  </td>

                  {/* BUTONLAR */}
                  <td className="p-4 text-center flex justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {/* Sadece Depodaki (Zimmetsiz) ve Stoğu Olan Ürünler Zimmetlenebilir */}
                    {!item.assignedTo && item.quantity > 0 && (
                      <button 
                        onClick={() => handleAssign(item)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-indigo-700 shadow-sm transition"
                      >
                        Dağıt 📦
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-50 text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded text-xs font-medium transition"
                      title="Kaydı Sil"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Kayıt bulunamadı.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;