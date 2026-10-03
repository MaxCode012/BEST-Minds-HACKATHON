import { useState } from 'react';
import { MenuCatalog } from './app/components/MenuCatalog';
import { MenuItem } from './app/data/mockData';
import { ShoppingBag, Utensils } from 'lucide-react';

export default function App() {
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [view, setView] = useState<'table' | 'kitchen'>('table');

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => [...prev, item]);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl text-white">
            <Utensils className="text-emerald-400" />
            <span>SmartResto <span className="text-xs font-normal text-slate-400">| Masa #4</span></span>
          </div>

          <div className="flex items-center gap-4">
            {/* Comutator rapid Client / Bucătărie */}
            <button
              onClick={() => setView(view === 'table' ? 'kitchen' : 'table')}
              className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300"
            >
              Schimbă în: {view === 'table' ? 'Ecran Bucătărie' : 'Ecran Client'}
            </button>

            {/* Indicator Coș */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">{cart.length} produse</span>
              <span className="text-slate-500">|</span>
              <span className="font-bold text-sm text-emerald-400">{totalPrice} MDL</span>
            </div>
          </div>
        </div>
      </header>

      {/* Corpul Paginii */}
      <main>
        {view === 'table' ? (
          <MenuCatalog onAddToCart={handleAddToCart} />
        ) : (
          <div className="max-w-6xl mx-auto p-6 text-center py-20 text-slate-400">
            <h2 className="text-2xl font-bold text-white mb-2">Ecran Bucătărie (KDS)</h2>
            <p>Comenzile primite în timp real prin SignalR vor fi afișate aici.</p>
          </div>
        )}
      </main>
    </div>
  );
}