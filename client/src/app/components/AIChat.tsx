import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sparkles,
  X,
  Bot,
  Check,
  RefreshCw,
  Plus,
  DollarSign,
  Utensils,
  UtensilsCrossed,
  AlertTriangle,
  Loader2,
  QrCode,
  User,
  Salad,
} from "lucide-react";
import { MOCK_USER, MenuItem } from "../data/mockData";
import { QRScannerModal } from "./QRScannerModal";

interface Preferences {
  hungerLevel: "light" | "hearty";
  dietType: "all" | "vegetarian" | "vegan";
  drinks: boolean | null;
  dessert: boolean | null;
  budget: number | "";
  allergies: string[];
}

interface Props {
  onAddToCart?: (
    item: MenuItem,
    chefNote: string,
    orderType: "individual" | "group",
    userName: string,
  ) => void;
}

const COMMON_ALLERGIES = ["lactoză", "alune", "gluten", "ouă", "pește", "soia"];

export const AIChat: React.FC<Props> = ({ onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<number[]>([]);
  const [customAllergyInput, setCustomAllergyInput] = useState("");

  const [searchParams] = useSearchParams();

  const [isScanningCamera, setIsScanningCamera] = useState(false);
  const [scannedUser, setScannedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [prefs, setPrefs] = useState<Preferences>({
    hungerLevel: "hearty",
    dietType: "all",
    drinks: null,
    dessert: null,
    budget: "",
    allergies: [...MOCK_USER.allergies],
  });

  const [recommendations, setRecommendations] = useState<MenuItem[]>([]);
  const [aiReasoning, setAiReasoning] = useState<string>("");
  const [totalCost, setTotalCost] = useState<number | null>(null);

  // Auto-deschidere la Pasul 1 dacă utilizatorul accesează link-ul generat de QR code
  useEffect(() => {
    if (
      searchParams.get("startAi") === "true" ||
      searchParams.get("qr") === "true"
    ) {
      setStep(1);
      setIsOpen(true);
    }
  }, [searchParams]);

  // Descărcare profil din C# pe baza ID-ului din QR code
  const loadUserProfileFromBackend = async (userId: string) => {
    const cleanId = userId.trim();
    if (!cleanId) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://172.30.69.205:5000/api/users/${cleanId}`,
      );

      if (response.ok) {
        const userData = await response.json();
        console.log("[PLAIN TEXT QR SUCCESS]: Profil găsit în C#:", userData);

        const loadedAllergies: string[] =
          userData.allergies ?? userData.Allergies ?? [];
        const userName: string = userData.name ?? userData.Name ?? "Alex";

        setPrefs((prev) => ({
          ...prev,
          allergies: loadedAllergies,
        }));

        setScannedUser({ id: cleanId, name: userName });
        setStep(1); // Ne asigurăm că ajunge la primul pas
        setIsOpen(true);
      } else {
        alert(`Utilizatorul cu ID '${cleanId}' nu există în baza de date.`);
      }
    } catch (error) {
      console.error("Eroare la conectarea cu serverul C#:", error);
      alert("Eroare la conectarea cu serverul.");
    } finally {
      setLoading(false);
    }
  };

  // Apelat când camera citește un cod QR
  const handleCameraQrSuccess = (decodedText: string) => {
    setIsScanningCamera(false);
    console.log("[CAMERA READ RAW STRING]:", decodedText);
    loadUserProfileFromBackend(decodedText);
  };

  const handleReset = () => {
    setStep(1);
    setLoading(false);
    setPrefs({
      hungerLevel: "hearty",
      dietType: "all",
      drinks: null,
      dessert: null,
      budget: "",
      allergies: [...MOCK_USER.allergies],
    });
    setRecommendations([]);
    setAiReasoning("");
    setTotalCost(null);
    setAddedItemIds([]);
    setCustomAllergyInput("");
    setScannedUser(null);
  };

  const toggleAllergy = (allergy: string) => {
    setPrefs((prev) => {
      const exists = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== allergy)
          : [...prev.allergies, allergy],
      };
    });
  };

  const handleAddCustomAllergy = () => {
    const trimmed = customAllergyInput.trim().toLowerCase();
    if (trimmed && !prefs.allergies.includes(trimmed)) {
      setPrefs((prev) => ({
        ...prev,
        allergies: [...prev.allergies, trimmed],
      }));
      setCustomAllergyInput("");
    }
  };

  const submitPreferencesToBackend = async () => {
    setLoading(true);

    const payload = {
      user_id: scannedUser?.id || "GUEST",
      budget: typeof prefs.budget === "number" ? prefs.budget : null,
      allergies:
        prefs.allergies && prefs.allergies.length > 0 ? prefs.allergies : [],
      wants_drink: Boolean(prefs.drinks),
      wants_dessert: Boolean(prefs.dessert),
      preferences: [
        prefs.hungerLevel === "hearty" ? "masă copioasă" : "gustare ușoară",
        prefs.dietType !== "all" ? prefs.dietType : null,
      ].filter(Boolean) as string[],
    };

    try {
      const response = await fetch(
        "http://172.30.69.205:5000/api/recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        const data = await response.json();

        setAiReasoning(data.reasoning ?? data.Reasoning ?? "");
        setTotalCost(data.total_cost ?? data.TotalCost ?? null);

        const rawItems =
          data.selected_items ??
          data.SelectedItems ??
          data.items ??
          (Array.isArray(data) ? data : []);

        const normalizedItems: MenuItem[] = rawItems.map(
          (item: any, index: number) => {
            let parsedAllergens: string[] = [];
            const rawAllergens = item.allergens ?? item.Allergens;

            if (Array.isArray(rawAllergens)) {
              parsedAllergens = rawAllergens;
            } else if (
              typeof rawAllergens === "string" &&
              rawAllergens.trim().length > 0
            ) {
              parsedAllergens = rawAllergens
                .split(",")
                .map((a: string) => a.trim());
            }

            return {
              id: Number(item.id ?? item.Id ?? index + 1),
              title:
                item.name ??
                item.Name ??
                item.title ??
                item.Title ??
                "Preparat Recomandat",
              description:
                item.reason ??
                item.Reason ??
                item.description ??
                item.Description ??
                "",
              price: Number(item.price ?? item.Price ?? 0),
              category: item.category ?? item.Category ?? "General",
              image:
                item.image ??
                item.Image ??
                item.image_url ??
                item.imageUrl ??
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
              allergens: parsedAllergens,
            };
          },
        );

        setRecommendations(normalizedItems);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error("Eroare la trimiterea cererii către C#:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
      setStep(5);
    }
  };

  const handleAddDirectly = (item: MenuItem) => {
    if (onAddToCart) {
      onAddToCart(
        item,
        "Recomandat de Sommelier AI",
        "individual",
        scannedUser?.name || MOCK_USER.name,
      );
      setAddedItemIds((prev) => [...prev, item.id]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 font-sans">
      {/* Live Camera Scanner */}
      {isScanningCamera && (
        <QRScannerModal
          onScanSuccess={handleCameraQrSuccess}
          onClose={() => setIsScanningCamera(false)}
        />
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setStep(1);
            setIsOpen(true);
          }}
          className="flex items-center gap-2.5 bg-brand hover:bg-brand-dark text-white font-bold px-5 py-3.5 rounded-full shadow-xl shadow-brand/30 transition-all hover:scale-105 cursor-pointer border border-brand/30"
        >
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          <span>Sommelier AI</span>
        </button>
      )}

      {/* Chat Drawer */}
      {isOpen && (
        <div className="bg-white border border-line w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col h-[540px] overflow-hidden">
          {/* Header */}
          <div className="bg-white p-4 border-b border-line flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-soft border border-brand/20 text-brand flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-ink text-sm font-serif">
                  SmartResto AI
                </h4>
                <p className="text-[11px] text-brand font-medium">
                  {step <= 4 ? `Pasul ${step} din 4` : "Meniu Recomandat"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsScanningCamera(true)}
                className="p-1.5 rounded-lg bg-sand hover:bg-brand-soft text-brand-dark border border-line transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="Scanează QR"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Scanează</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-muted hover:text-ink p-1 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Identified Badge */}
          {scannedUser && (
            <div className="bg-brand-soft border-b border-line px-4 py-1.5 flex items-center justify-between text-[11px]">
              <span className="text-brand-dark font-medium flex items-center gap-1.5">
                <User className="w-3 h-3 text-brand" /> Profil:{" "}
                <strong>{scannedUser.name}</strong>
              </span>
              <span className="text-muted text-[10px]">
                Alergii sincronizate
              </span>
            </div>
          )}

          {/* Steps 1 to 5 Content */}
          <div className="flex-1 p-5 overflow-y-auto bg-cream flex flex-col justify-start">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4 my-auto animate-in fade-in duration-200">
                <h3 className="text-ink font-semibold text-sm text-center font-serif">
                  Cât de foame vă este și ce preferințe aveți? 🍽️
                </h3>

                <div>
                  <label className="text-[11px] text-muted font-semibold uppercase tracking-wider block mb-1.5">
                    Mărime Masă:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs({ ...prefs, hungerLevel: "light" })
                      }
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        prefs.hungerLevel === "light"
                          ? "bg-[#E04F26]/10 border-[#E04F26] text-[#E04F26] font-bold"
                          : "bg-[#FAF7F2] border-[#E5DFD3] text-stone-600 hover:border-[#E04F26]/40"
                      }`}
                    >
                      <Salad className="w-4 h-4 shrink-0" />
                      <span>Gustare Ușoară</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs({ ...prefs, hungerLevel: "hearty" })
                      }
                      className={`py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        prefs.hungerLevel === "hearty"
                          ? "bg-[#E04F26]/10 border-[#E04F26] text-[#E04F26] font-bold"
                          : "bg-[#FAF7F2] border-[#E5DFD3] text-stone-600 hover:border-[#E04F26]/40"
                      }`}
                    >
                      {prefs.hungerLevel === "hearty" ? (
                        <UtensilsCrossed className="w-4 h-4 shrink-0" />
                      ) : (
                        <Utensils className="w-4 h-4 shrink-0" />
                      )}
                      <span>Masă Copioasă</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-muted font-semibold uppercase tracking-wider block mb-1.5">
                    Preferință Dietă:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["all", "vegetarian", "vegan"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPrefs({ ...prefs, dietType: d })}
                        className={`py-2 text-[11px] font-semibold rounded-xl border capitalize transition-all cursor-pointer ${
                          prefs.dietType === d
                            ? "bg-brand-soft border-brand text-brand-dark font-bold"
                            : "bg-white border-line text-muted hover:border-brand/40"
                        }`}
                      >
                        {d === "all" ? "Toate" : d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-2 py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                >
                  Înainte ➔
                </button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4 text-center my-auto animate-in fade-in duration-200">
                <h3 className="text-ink font-semibold text-sm font-serif">
                  Doriți o băutură sau un desert? 🍷🍰
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-line">
                    <span className="text-xs text-ink font-medium">
                      Include Băutură
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs({ ...prefs, drinks: !prefs.drinks })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prefs.drinks
                          ? "bg-brand text-white"
                          : "bg-sand text-muted"
                      }`}
                    >
                      {prefs.drinks ? "DA" : "NU"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-line">
                    <span className="text-xs text-ink font-medium">
                      Include Desert
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPrefs({ ...prefs, dessert: !prefs.dessert })
                      }
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        prefs.dessert
                          ? "bg-brand text-white"
                          : "bg-sand text-muted"
                      }`}
                    >
                      {prefs.dessert ? "DA" : "NU"}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 bg-sand hover:bg-line text-ink font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                  >
                    Înainte ➔
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4 text-center my-auto animate-in fade-in duration-200">
                <h3 className="text-ink font-semibold text-sm font-serif">
                  Care este bugetul maxim? 💵
                </h3>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="w-4 h-4 text-brand" />
                  </div>
                  <input
                    type="number"
                    placeholder="Ex: 300"
                    value={prefs.budget}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        budget: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                    className="w-full pl-9 pr-12 py-3 bg-white border border-line rounded-xl text-ink placeholder-muted/60 focus:outline-none focus:border-brand text-sm font-bold"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted font-bold">
                    MDL
                  </span>
                </div>

                <div className="flex gap-2 justify-center">
                  {[150, 300, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, budget: amount })}
                      className="text-xs bg-white hover:bg-sand border border-line px-3 py-1.5 rounded-lg text-brand-dark cursor-pointer"
                    >
                      {amount} MDL
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-2.5 bg-sand hover:bg-line text-ink font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md"
                  >
                    Înainte ➔
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-4 my-auto animate-in fade-in duration-200">
                <div className="text-center">
                  <h3 className="text-ink font-semibold text-sm font-serif flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-brand" /> Selectează
                    Alergiile Tale
                  </h3>
                  <p className="text-[11px] text-muted mt-1">
                    Selectează alergenii de transmis către API:
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {COMMON_ALLERGIES.map((alg) => {
                    const isSelected = prefs.allergies.includes(alg);
                    return (
                      <button
                        key={alg}
                        type="button"
                        onClick={() => toggleAllergy(alg)}
                        className={`py-2 px-2 text-[11px] font-bold rounded-xl border capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isSelected
                            ? "bg-rose-50 border-rose-400 text-rose-700 shadow-sm"
                            : "bg-white border-line text-muted hover:border-brand/40"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3 h-3 text-rose-600 shrink-0" />
                        )}
                        {alg}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Alta (ex: susan...)"
                    value={customAllergyInput}
                    onChange={(e) => setCustomAllergyInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddCustomAllergy()
                    }
                    className="flex-1 bg-white border border-line rounded-xl px-3 py-2 text-xs text-ink placeholder-muted/60 focus:outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomAllergy}
                    className="bg-sand hover:bg-line text-brand px-3 py-2 rounded-xl text-xs font-bold border border-line cursor-pointer"
                  >
                    Adaugă
                  </button>
                </div>

                {prefs.allergies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-muted font-semibold block w-full">
                      Alergii selectate:
                    </span>
                    {prefs.allergies.map((alg) => (
                      <span
                        key={alg}
                        onClick={() => toggleAllergy(alg)}
                        className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer hover:line-through"
                      >
                        {alg} <X className="w-2.5 h-2.5" />
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-sand hover:bg-line text-ink font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Înapoi
                  </button>
                  <button
                    type="button"
                    onClick={submitPreferencesToBackend}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />{" "}
                        Trimitere...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" /> Trimite la API
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-3 text-left animate-in fade-in duration-200">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-ink font-bold text-xs font-serif">
                    Meniu Recomandat{" "}
                    {totalCost !== null && `(${totalCost.toFixed(2)} MDL)`}:
                  </h4>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-muted hover:text-brand flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Resetează
                  </button>
                </div>

                {aiReasoning && (
                  <div className="bg-brand-soft border border-brand/20 p-2.5 rounded-xl text-ink text-[11px] leading-relaxed font-sans">
                    💡 <span className="italic">{aiReasoning}</span>
                  </div>
                )}

                {recommendations.length === 0 ? (
                  <p className="text-muted text-xs text-center py-6 font-sans">
                    Nu s-au găsit preparate conform răspunsului primit de la
                    server.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {recommendations.map((item) => {
                      const isAdded = addedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="bg-white border border-line p-3 rounded-xl flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-12 h-12 object-cover rounded-lg border border-line shrink-0"
                                />
                              )}
                              <div>
                                <h5 className="font-semibold text-ink text-xs font-serif">
                                  {item.title}
                                </h5>
                                <span className="text-brand font-bold text-xs">
                                  {item.price} MDL
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddDirectly(item)}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                                isAdded
                                  ? "bg-sand text-muted"
                                  : "bg-brand hover:bg-brand-dark text-white"
                              }`}
                            >
                              {isAdded ? (
                                "Adăugat"
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> Adaugă
                                </>
                              )}
                            </button>
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-muted italic border-t border-line pt-1.5 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
