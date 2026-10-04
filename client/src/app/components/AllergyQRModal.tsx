import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X, CheckCircle2, Loader2, Utensils } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allAvailableAllergens: string[];
}

export const AllergyQRModal: React.FC<Props> = ({
  isOpen,
  onClose,
  allAvailableAllergens,
}) => {
  const [fullName, setFullName] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  // Generare cheie în format NUME_PRENUME (ex: MAXIM_SEREMET)
  const userKey = fullName.trim().toUpperCase().replace(/\s+/g, "_");

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen],
    );
    setSavedSuccess(false);
  };

  // Trimitere date (alergeni + preferințe) prin POST către backend-ul C#
  const handleSaveToBackend = async () => {
    if (!userKey) return;

    setLoading(true);
    setSavedSuccess(false);

    try {
      const response = await fetch("http://172.30.69.205:5000/api/allergies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userKey: userKey,
          allergens: selectedAllergens,
          preferences: preferences.trim(),
        }),
      });

      if (response.ok) {
        setSavedSuccess(true);
      } else {
        console.error("Eroare la salvarea în serverul C#");
      }
    } catch (error) {
      console.error("Eroare de conexiune cu backend-ul:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Antet Modal */}
        <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#E04F26]" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Profil & QR Alergii
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Câmp Nume și Prenume */}
        <div className="mb-4">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
            Nume și Prenume
          </label>
          <input
            type="text"
            placeholder="Ex: Maxim Seremet"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setSavedSuccess(false);
            }}
            className="w-full bg-white border border-[#E5DFD3] rounded-xl p-3 text-sm text-stone-800 focus:outline-none focus:border-[#E04F26]"
          />
          {userKey && (
            <p className="text-[11px] text-stone-400 mt-1">
              Cheie utilizator:{" "}
              <strong className="font-mono text-[#E04F26]">{userKey}</strong>
            </p>
          )}
        </div>

        {/* Selecție Alergeni */}
        <div className="mb-4">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Selectează Alergenii
          </label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
            {allAvailableAllergens.map((alg) => {
              const isSelected = selectedAllergens.includes(alg);
              return (
                <button
                  key={alg}
                  type="button"
                  onClick={() => toggleAllergen(alg)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold capitalize transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-white text-stone-700 border-[#E5DFD3] hover:border-[#E04F26]/40"
                  }`}
                >
                  {alg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Câmp Preferințe Alimentare (Textarea) */}
        <div className="mb-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-[#E04F26]" /> Preferințe
            Culinare
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Fără ceapă, vegetarian, puțin sărat, prefer bucăți mediu-făcute..."
            value={preferences}
            onChange={(e) => {
              setPreferences(e.target.value);
              setSavedSuccess(false);
            }}
            className="w-full bg-white border border-[#E5DFD3] rounded-xl p-3 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#E04F26] resize-none"
          />
        </div>

        {/* Buton de salvare în Baza de Date C# */}
        <button
          type="button"
          disabled={!userKey || loading}
          onClick={handleSaveToBackend}
          className={`w-full py-3 mb-5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            !userKey
              ? "bg-stone-300 text-stone-500 cursor-not-allowed"
              : "bg-[#E04F26] hover:bg-[#c9421d] text-white shadow-md"
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Salvat în Baza de Date
            </>
          ) : (
            "Salvează Profilul"
          )}
        </button>

        {/* Afișare Cod QR (Conține doar cheia NUME_PRENUME) */}
        {userKey && (
          <div className="bg-white p-4 rounded-2xl border border-[#E5DFD3] flex flex-col items-center justify-center gap-2 text-center shadow-inner">
            <QRCodeSVG
              value={userKey}
              size={140}
              bgColor="#FFFFFF"
              fgColor="#1C1917"
              level="H"
            />
            <p className="text-[11px] text-stone-400 font-mono">
              Valoare QR: <strong>{userKey}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
