import React from "react";
import { CartItem } from "../data/mockData";
import { Clock, MessageSquare, CheckCircle } from "lucide-react";

interface Props {
  orders: CartItem[];
  onCompleteOrder: () => void;
}

export const KDS: React.FC<Props> = ({ orders, onCompleteOrder }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 text-left font-sans">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 font-serif">
            Ecran Bucătărie (KDS)
          </h2>
          <p className="text-stone-500 text-sm">Comenzi active în timp real</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> Live Sync
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl p-12 text-center text-stone-500">
          Nu există comenzi în așteptare.
        </div>
      ) : (
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4 mb-4">
            <div>
              <span className="text-xs font-bold text-[#E04F26]">
                Comandă Nouă
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Masa #4
              </h3>
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
              <div
                key={item.cartItemId}
                className="bg-white p-3.5 rounded-2xl border border-[#E5DFD3]"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-stone-900">{item.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#EAE4D9] text-stone-600 font-mono uppercase">
                    {item.orderType}
                  </span>
                </div>
                {item.chefNote && (
                  <p className="text-xs text-[#E04F26] bg-[#E04F26]/10 border border-[#E04F26]/20 rounded-xl p-2 mt-2 flex items-center gap-1.5">
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
