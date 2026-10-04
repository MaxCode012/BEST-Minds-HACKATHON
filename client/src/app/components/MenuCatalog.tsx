import React, { useState, useEffect } from "react";
import { MOCK_USER, MenuItem, fetchMenuFromBackend } from "../data/mockData";
import {
  AlertTriangle,
  Plus,
  MessageSquare,
  Users,
  User,
  Loader2,
  Filter,
  UserPlus,
  X,
  ChevronDown,
} from "lucide-react";

interface Props {
  onAddToCart: (
    item: MenuItem,
    chefNote: string,
    orderType: "individual" | "group",
    userName: string,
  ) => void;
}

const CATEGORIES = [
  { id: "all", label: "Toate" },
  { id: "soup", label: "Supe & Ciorbe" },
  { id: "starter", label: "Gustări" },
  { id: "main", label: "Fel Principal" },
  { id: "side", label: "Garnituri" },
  { id: "drink", label: "Băuturi" },
  { id: "dessert", label: "Desert" },
  { id: "salad", label: "Salate" },
];

export const MenuCatalog: React.FC<Props> = ({ onAddToCart }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [safeOnlyFilter, setSafeOnlyFilter] = useState<boolean>(false);

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [chefNote, setChefNote] = useState("");
  const [orderType, setOrderType] = useState<"individual" | "group">(
    "individual",
  );

  // Stare pentru membri grupului
  const [groupMembers, setGroupMembers] = useState<string[]>([
    "Alexandru",
    "Ion",
    "Elena",
  ]);
  const [selectedPerson, setSelectedPerson] = useState<string>("Alexandru");
  const [newPersonInput, setNewPersonInput] = useState("");
  const [showAddPersonInput, setShowAddPersonInput] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const data = await fetchMenuFromBackend();
      setMenuItems(data);
      setLoading(false);
    };

    loadMenu();
  }, []);

  const handleAddPerson = () => {
    if (newPersonInput.trim()) {
      const name = newPersonInput.trim();
      if (!groupMembers.includes(name)) {
        setGroupMembers((prev) => [...prev, name]);
      }
      setSelectedPerson(name);
      setNewPersonInput("");
      setShowAddPersonInput(false);
    }
  };

  const handleConfirmAdd = () => {
    if (selectedItem) {
      const finalName = orderType === "group" ? selectedPerson : MOCK_USER.name;

      onAddToCart(selectedItem, chefNote, orderType, finalName);
      setSelectedItem(null);
      setChefNote("");
      setShowAddPersonInput(false);
      setNewPersonInput("");
    }
  };

  const filteredMenu = menuItems.filter((item) => {
    const itemCat = item.category?.toLowerCase() || "";

    let categoryMatch = false;

    if (selectedCategory === "all") {
      categoryMatch = true;
    } else if (selectedCategory === "soup") {
      categoryMatch = itemCat.includes("sup") || itemCat.includes("ciorb");
    } else if (selectedCategory === "starter") {
      categoryMatch =
        itemCat.includes("gustar") ||
        itemCat.includes("starter") ||
        itemCat.includes("aperitiv");
    } else if (selectedCategory === "main") {
      categoryMatch =
        itemCat.includes("fel principal") ||
        itemCat.includes("main") ||
        itemCat.includes("pasta") ||
        itemCat.includes("burger") ||
        itemCat.includes("friptur") ||
        itemCat.includes("peste");
    } else if (selectedCategory === "side") {
      categoryMatch = itemCat.includes("garnitur") || itemCat.includes("side");
    } else if (selectedCategory === "drink") {
      categoryMatch =
        itemCat.includes("bautur") ||
        itemCat.includes("băutur") ||
        itemCat.includes("drink") ||
        itemCat.includes("vin") ||
        itemCat.includes("racoritor");
    } else if (selectedCategory === "dessert") {
      categoryMatch =
        itemCat.includes("desert") ||
        itemCat.includes("prajitur") ||
        itemCat.includes("inghetat");
    } else if (selectedCategory === "salad") {
      categoryMatch = itemCat.includes("salat");
    } else {
      categoryMatch = itemCat === selectedCategory.toLowerCase();
    }

    const hasUserAllergen = item.allergens?.some((a) =>
      MOCK_USER.allergies.includes(a),
    );
    const safetyMatch = safeOnlyFilter ? !hasUserAllergen : true;

    return categoryMatch && safetyMatch;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 font-sans">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#E04F26]" /> Filtre:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-[#E04F26] text-white shadow-md shadow-[#E04F26]/20 font-bold"
                  : "bg-[#FAF7F2] border border-[#E5DFD3] text-stone-700 hover:border-[#E04F26]/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#E04F26] gap-3 font-sans">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm text-stone-500">
            Se încarcă meniul din baza de date...
          </p>
        </div>
      ) : filteredMenu.length === 0 ? (
        <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl p-12 text-center my-8">
          <p className="text-stone-500 font-medium text-sm">
            Nu s-a găsit niciun preparat conform filtrelor selectate.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSafeOnlyFilter(false);
            }}
            className="mt-4 text-xs font-bold text-[#E04F26] underline cursor-pointer"
          >
            Resetează filtrele
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map((item) => {
            const hasAllergen = item.allergens?.some((a) =>
              MOCK_USER.allergies.includes(a),
            );

            return (
              <div
                key={item.id}
                className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-[#E04F26]/40 transition-all shadow-sm hover:shadow-xl hover:shadow-[#E04F26]/10"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-stone-200">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    {hasAllergen && (
                      <div className="absolute top-3 right-3 bg-white/95 border border-rose-200 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 shadow-md font-sans">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />{" "}
                        Conține Alergeni
                      </div>
                    )}
                  </div>

                  <div className="p-6 text-left">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-xl text-stone-900 tracking-wide">
                        {item.title}
                      </h3>
                      <span className="text-[#E04F26] font-extrabold text-xl font-sans">
                        {item.price} MDL
                      </span>
                    </div>
                    <p className="text-stone-500 text-sm mb-4 leading-relaxed font-sans font-light">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2 font-sans">
                      {item.allergens?.map((alg) => {
                        const isUserAllergic =
                          MOCK_USER.allergies.includes(alg);
                        return (
                          <span
                            key={alg}
                            className={`text-[11px] px-2.5 py-1 rounded-lg font-medium capitalize ${
                              isUserAllergic
                                ? "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                                : "bg-[#EAE4D9] text-stone-600 border border-[#DCD3C1]"
                            }`}
                          >
                            {alg}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 font-sans">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="w-full py-3.5 px-4 bg-[#E04F26] hover:bg-[#c9421d] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" /> Adaugă la Comandă
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-stone-900 font-serif mb-1">
              {selectedItem.title}
            </h3>
            <p className="text-[#E04F26] font-bold text-lg mb-5">
              {selectedItem.price} MDL
            </p>

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Opțiune Servire
            </label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setOrderType("individual")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === "individual"
                    ? "bg-[#E04F26]/10 border-[#E04F26] text-[#E04F26] font-bold"
                    : "bg-[#EAE4D9] border-[#DCD3C1] text-stone-600"
                }`}
              >
                <User className="w-4 h-4" /> Comandă Personală
              </button>

              <button
                type="button"
                onClick={() => setOrderType("group")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-sm font-medium transition-all cursor-pointer ${
                  orderType === "group"
                    ? "bg-[#E04F26]/10 border-[#E04F26] text-[#E04F26] font-bold"
                    : "bg-[#EAE4D9] border-[#DCD3C1] text-stone-600"
                }`}
              >
                <Users className="w-4 h-4" /> La Masă (Grup)
              </button>
            </div>

            {/* Selector Persoană din Grup cu Custom UI (fără element nativ select) */}
            {orderType === "group" && (
              <div className="mb-5 animate-in fade-in duration-150 relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
                    Cine comandă acest preparat?
                  </label>
                  {!showAddPersonInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPersonInput(true);
                        setIsDropdownOpen(false);
                      }}
                      className="text-xs text-[#E04F26] font-bold hover:text-[#c9421d] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Adaugă persoană
                    </button>
                  )}
                </div>

                {!showAddPersonInput ? (
                  <div className="relative">
                    {/* Trigger Buton */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full bg-white border border-[#E04F26] rounded-2xl py-3 px-4 text-sm font-bold text-stone-900 shadow-sm flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E04F26]/20 transition-all"
                    >
                      <span>{selectedPerson}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#E04F26] transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Meniu Derulant Personalizat */}
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#E5DFD3] rounded-2xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                        {groupMembers.map((member) => {
                          const isSelected = selectedPerson === member;
                          return (
                            <button
                              key={member}
                              type="button"
                              onClick={() => {
                                setSelectedPerson(member);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? "bg-[#E04F26]/10 text-[#E04F26]"
                                  : "text-stone-800 hover:bg-[#FAF7F2]"
                              }`}
                            >
                              <span>{member}</span>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-[#E04F26]"></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Nume nou (ex: Daniel)"
                        value={newPersonInput}
                        onChange={(e) => setNewPersonInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPerson();
                          }
                        }}
                        autoFocus
                        className="w-full bg-white border border-[#E5DFD3] rounded-2xl py-2.5 px-3.5 text-sm text-stone-800 font-medium placeholder-stone-400 focus:outline-none focus:border-[#E04F26] focus:ring-2 focus:ring-[#E04F26]/10 shadow-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPerson}
                      className="bg-[#E04F26] hover:bg-[#c9421d] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPersonInput(false);
                        setNewPersonInput("");
                      }}
                      className="p-2.5 bg-[#EAE4D9] hover:bg-[#DCD3C1] text-stone-600 rounded-2xl transition-all cursor-pointer border border-[#DCD3C1]"
                      title="Anulează adăugarea"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#E04F26]" /> Mențiuni
              pentru Chef
            </label>
            <textarea
              rows={3}
              placeholder="Ex: Păt păstrat mediu-făcut, fără dressing, sosul separat..."
              value={chefNote}
              onChange={(e) => setChefNote(e.target.value)}
              className="w-full bg-white border border-[#E5DFD3] rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#E04F26] mb-6 resize-none"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setChefNote("");
                  setShowAddPersonInput(false);
                  setNewPersonInput("");
                }}
                className="flex-1 py-3 bg-[#EAE4D9] hover:bg-[#E0D8C9] text-stone-800 font-medium rounded-2xl transition-colors text-sm cursor-pointer border border-[#DCD3C1]"
              >
                Anulează
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 py-3 bg-[#E04F26] hover:bg-[#c9421d] text-white font-bold rounded-2xl transition-colors text-sm shadow-md cursor-pointer"
              >
                Confirmă
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
