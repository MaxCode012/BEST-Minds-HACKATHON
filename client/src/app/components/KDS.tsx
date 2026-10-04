import React from 'react';
import { CartItem } from '../data/mockData';
import { Clock, MessageSquare, CheckCircle } from 'lucide-react';

interface Props {
  orders: CartItem[];
  onCompleteOrder: () => void;
}

export const KDS: React.FC<Props> = ({ orders, onCompleteOrder }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 text-left">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-ink">Ecran Bucătărie (KDS)</h2>
          <p className="text-muted text-sm">Comenzi active în timp real</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Live Sync
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-12 text-center text-muted">
          Nu există comenzi în așteptare.
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-line pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-brand">Comandă Nouă</span>
              <h3 className="text-lg font-bold text-ink">Masa #4</h3>
            </div>
            <button
              onClick={onCompleteOrder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" /> Marchează ca Gata
            </button>
          </div>

          <div className="space-y-3">
            {orders.map((item) => (
              <div key={item.cartItemId} className="bg-cream p-3.5 rounded-xl border border-line">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-ink">{item.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-sand text-muted font-mono uppercase">
                    {item.orderType}
                  </span>
                </div>
                {item.chefNote && (
                  <p className="text-xs text-brand-dark bg-brand-soft border border-brand/20 rounded p-2 mt-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <strong>Notă:</strong> {item.chefNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};