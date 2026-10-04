import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Navigate, Link } from "react-router-dom";
import { MenuCatalog } from "./app/components/MenuCatalog";
import { KDS } from "./app/components/KDS";
import { AIChat } from "./app/components/AIChat";
import { AllergyQRModal } from "./app/components/AllergyQRModal";
import { CartItem, MenuItem } from "./app/data/mockData";
import {
  ChefHat,
  ShoppingBag,
  X,
  Trash2,
  UtensilsCrossed,
  QrCode,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  Utensils,
  Bike,
} from "lucide-react";

const ALLERGEN_LIST = [
  "gluten",
  "lactoză",
  "pește",
  "muștar",
  "țelină",
  "nuci",
  "ouă",
  "soia",
];

export const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("smartresto_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [kitchenOrders, setKitchenOrders] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("smartresto_kds");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Stări pentru Progress Bar pe 4 Stagii
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [orderProgress, setOrderProgress] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedCart = localStorage.getItem("smartresto_cart");
      const savedKds = localStorage.getItem("smartresto_kds");
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedKds) setKitchenOrders(JSON.parse(savedKds));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("smartresto_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("smartresto_kds", JSON.stringify(kitchenOrders));
  }, [kitchenOrders]);

  const handleAddToCart = (
    item: MenuItem,
    chefNote: string,
    orderType: "individual" | "group",
    userName: string,
  ) => {
    const newItem: CartItem = {
      ...item,
      cartItemId: `${item.id}-${Date.now()}`,
      chefNote,
      orderType,
      userName,
    };
    setCartItems((prev) => [...prev, newItem]);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  // Trimiterea comenzii cu Progress pe 4 Stagii (5 secunde)
  const handleSendToKitchen = () => {
    if (cartItems.length === 0 || isSendingOrder) return;

    setIsSendingOrder(true);
    setOrderProgress(0);

    const startTime = Date.now();
    const duration = 5000;

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min((elapsedTime / duration) * 100, 100);
      setOrderProgress(progress);
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const newKds = [...kitchenOrders, ...cartItems];
      setKitchenOrders(newKds);
      localStorage.setItem("smartresto_kds", JSON.stringify(newKds));

      setCartItems([]);
      localStorage.setItem("smartresto_cart", JSON.stringify([]));

      setIsSendingOrder(false);
      setOrderProgress(0);
      setIsCartOpen(false);
    }, duration);
  };

  const handleCompleteKitchenOrder = () => {
    setKitchenOrders([]);
    localStorage.setItem("smartresto_kds", JSON.stringify([]));
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const numericPrice =
      typeof item.price === "string"
        ? parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0
        : item.price || 0;

    return sum + numericPrice;
  }, 0);

  // Determinare stagiu curent pe baza celor 4 praguri (25%, 50%, 75%, 100%)
  const getStageInfo = () => {
    if (orderProgress < 25) {
      return { step: 1, text: "Trimitere bucătărie...", icon: Send };
    } else if (orderProgress < 50) {
      return { step: 2, text: "Pregătire preparate...", icon: Utensils };
    } else if (orderProgress < 75) {
      return { step: 3, text: "Finalizare comandă...", icon: CheckCircle2 };
    } else {
      return { step: 4, text: "Transmitere către client...", icon: Bike };
    }
  };

  const currentStage = getStageInfo();
  const StageIcon = currentStage.icon;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 font-sans">
      <header className="bg-white border-b border-[#E5DFD3] sticky top-0 z-40 px-6 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            to="/menu"
            className="flex items-center gap-2.5 group cursor-pointer transition-transform active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-[#E04F26]/10 border border-[#E04F26]/20 flex items-center justify-center group-hover:bg-[#E04F26] transition-colors">
              <UtensilsCrossed className="w-5 h-5 text-[#E04F26] group-hover:text-white transition-colors" />
            </div>
            <span className="font-serif font-bold text-xl text-stone-900 group-hover:text-[#E04F26] transition-colors tracking-wide">
              TabLinq
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-stone-700 bg-[#EAE4D9]/60 hover:bg-[#EAE4D9] border border-[#DCD3C1] transition-all cursor-pointer active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#E04F26]" />
              <span className="hidden sm:inline">Creează QR</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-[#E04F26] hover:bg-[#c9421d] text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer border border-[#E04F26]/30 active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Coș</span>
              {cartItems.length > 0 && (
                <span className="bg-white text-[#E04F26] text-[11px] font-extrabold px-2 py-0.5 rounded-full ml-0.5 shadow-sm font-sans">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route
            path="/menu"
            element={<MenuCatalog onAddToCart={handleAddToCart} />}
          />
          <Route
            path="/kds"
            element={
              <KDS
                orders={kitchenOrders}
                onCompleteOrder={handleCompleteKitchenOrder}
              />
            }
          />
        </Routes>
      </main>

      {/* Drawer Coș cu Progress Bar pe 4 Stagii */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex justify-end">
          <div className="bg-[#FAF7F2] w-full max-w-md h-full shadow-2xl border-l border-[#E5DFD3] flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200 relative overflow-hidden">
            {/* Componenta de Progres cu 4 Stagii */}
            {isSendingOrder && (
              <div className="absolute top-0 left-0 right-0 bg-white border-b border-[#E5DFD3] p-4 shadow-md z-50 animate-in slide-in-from-top duration-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <StageIcon className="w-4 h-4 text-[#E04F26] animate-bounce" />
                    <span className="text-xs font-bold text-stone-900">
                      {currentStage.text}
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-[#E04F26] bg-[#E04F26]/10 px-2 py-0.5 rounded-full font-mono">
                    Stagiul {currentStage.step}/4
                  </span>
                </div>

                {/* Bara de progres vizuală */}
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-[#E5DFD3]">
                  <div
                    className="h-full bg-[#E04F26] transition-all ease-linear duration-75"
                    style={{ width: `${orderProgress}%` }}
                  />
                </div>

                {/* Cele 4 stagii sub bară */}
                <div className="grid grid-cols-4 text-center mt-2 font-sans">
                  <span
                    className={`text-[9px] font-bold ${orderProgress >= 0 ? "text-[#E04F26]" : "text-stone-300"}`}
                  >
                    1. Trimitere
                  </span>
                  <span
                    className={`text-[9px] font-bold ${orderProgress >= 25 ? "text-[#E04F26]" : "text-stone-300"}`}
                  >
                    2. Pregătire
                  </span>
                  <span
                    className={`text-[9px] font-bold ${orderProgress >= 50 ? "text-[#E04F26]" : "text-stone-300"}`}
                  >
                    3. Finalizare
                  </span>
                  <span
                    className={`text-[9px] font-bold ${orderProgress >= 75 ? "text-[#E04F26]" : "text-stone-300"}`}
                  >
                    4. Transmitere
                  </span>
                </div>
              </div>
            )}

            <div className={isSendingOrder ? "pt-20" : ""}>
              <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#E04F26]" />
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Coșul Tău
                  </h3>
                </div>
                <button
                  onClick={() => !isSendingOrder && setIsCartOpen(false)}
                  disabled={isSendingOrder}
                  className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm font-medium">
                  Coșul tău este gol. Adaugă ceva din meniu!
                </div>
              ) : (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="bg-white border border-[#E5DFD3] p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs font-serif">
                          {item.title}
                        </h4>
                        <span className="text-[#E04F26] font-bold text-xs">
                          {item.price} MDL
                        </span>
                        {item.userName && (
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Comandat de: <strong>{item.userName}</strong>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(item.cartItemId)}
                        disabled={isSendingOrder}
                        className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-[#E5DFD3] pt-4 space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-stone-900 font-sans">
                  <span>Total:</span>
                  <span className="text-[#E04F26] text-lg font-extrabold">
                    {totalPrice} MDL
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isSendingOrder}
                  onClick={handleSendToKitchen}
                  className={`w-full py-3.5 text-white font-bold rounded-2xl transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                    isSendingOrder
                      ? "bg-amber-600 cursor-wait"
                      : "bg-[#E04F26] hover:bg-[#c9421d]"
                  }`}
                >
                  {isSendingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{currentStage.text}</span>
                    </>
                  ) : (
                    "Trimite Comanda la Bucătărie ➔"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <AllergyQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        allAvailableAllergens={ALLERGEN_LIST}
      />

      <AIChat onAddToCart={handleAddToCart} />
    </div>
  );
};

export default App;
