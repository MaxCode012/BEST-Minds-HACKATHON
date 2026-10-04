import React, { useState } from "react";
import { CartItem } from "../data/mockData";
import {
  Clock,
  MessageSquare,
  CheckCircle,
  Printer,
  ChevronDown,
  CheckCircle2,
  Check,
} from "lucide-react";

interface Props {
  orders: CartItem[];
  onCompleteOrder: () => void;
}

// Lista utilizatorilor pentru aparatul de casă
const CASH_REGISTER_USERS = ["Alexandru", "Elena", "Ion"];

export const KDS: React.FC<Props> = ({ orders, onCompleteOrder }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPrintDropdownOpen, setIsPrintDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stare pentru a urmări utilizatorii ale căror bonuri au fost printate
  const [printedUsers, setPrintedUsers] = useState<string[]>([]);

  // Marcare comandă ca gata
  const handleMarkAsReady = () => {
    setIsCompleted(true);
  };

  // Simularea trimiterii la aparatul de casă
  const handleSimulatePrint = (userName: string) => {
    setIsPrintDropdownOpen(false);

    // Adăugăm utilizatorul în lista celor printați dacă nu există deja
    const updatedPrinted = printedUsers.includes(userName)
      ? printedUsers
      : [...printedUsers, userName];

    setPrintedUsers(updatedPrinted);

    setSuccessMessage(
      `Comanda pentru ${userName} a fost trimisă la aparatul de casă cu succes!`,
    );

    // Ascunde mesajul automat după 3 secunde
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    // Dacă toți cei 3 utilizatori au primit bonul, eliminăm comanda
    if (updatedPrinted.length >= CASH_REGISTER_USERS.length) {
      setTimeout(() => {
        onCompleteOrder();
        setIsCompleted(false);
        setPrintedUsers([]);
      }, 1500);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-left font-sans relative">
      {/* Alerta de succes stilizată pe ecran */}
      {successMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 border border-emerald-500">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="text-xs font-bold tracking-wide">
            {successMessage}
          </span>
        </div>
      )}

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
          {/* Antet Bilet Comandă Masa #4 */}
          <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4 mb-4">
            <div>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCompleted ? "text-emerald-600" : "text-[#E04F26]"
                }`}
              >
                {isCompleted
                  ? `Comandă Finalizată (${printedUsers.length}/3 bonuri)`
                  : "Comandă Nouă"}
              </span>
              <h3 className="text-lg font-bold text-stone-900 font-serif">
                Masa #4
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Buton "Printează Bon" apare DOAR după ce comanda e marcată ca GATA */}
              {isCompleted ? (
                <div className="relative animate-in fade-in zoom-in-95 duration-200">
                  <button
                    type="button"
                    onClick={() => setIsPrintDropdownOpen(!isPrintDropdownOpen)}
                    className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Printer className="w-4 h-4 text-[#E04F26]" />
                    <span>Printează Bon ({printedUsers.length}/3)</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isPrintDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Persoane */}
                  {isPrintDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5DFD3] rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase border-b border-[#E5DFD3]">
                        Selectează Client
                      </div>
                      {CASH_REGISTER_USERS.map((user) => {
                        const isPrinted = printedUsers.includes(user);
                        return (
                          <button
                            key={user}
                            type="button"
                            onClick={() => handleSimulatePrint(user)}
                            className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                              isPrinted
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-stone-800 hover:bg-[#E04F26]/10 hover:text-[#E04F26]"
                            }`}
                          >
                            <span>{user}</span>
                            {isPrinted && (
                              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                                <Check className="w-3 h-3" /> Printat
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Buton "Marchează ca Gata" */
                <button
                  type="button"
                  onClick={handleMarkAsReady}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" /> Marchează ca Gata
                </button>
              )}
            </div>
          </div>

          {/* Lista Preparatelor din Comandă */}
          <div className="space-y-3">
            {orders.map((item) => (
              <div
                key={item.cartItemId}
                className="bg-white p-3.5 rounded-2xl border border-[#E5DFD3]"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      {item.title}
                    </h4>
                    {item.userName && (
                      <span className="text-[11px] text-stone-500 font-medium">
                        Comandat de: <strong>{item.userName}</strong>
                      </span>
                    )}
                  </div>
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
