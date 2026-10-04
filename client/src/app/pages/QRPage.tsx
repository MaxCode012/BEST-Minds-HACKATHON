import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, ShieldCheck } from "lucide-react";

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

export const QRPage: React.FC = () => {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen],
    );
  };

  const qrData = `${window.location.origin}/menu?allergies=${selectedAllergens.join(",")}`;

  return (
    <div className="max-w-2xl mx-auto p-6 text-left font-sans">
      <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 border-b border-[#E5DFD3] pb-4">
          <QrCode className="w-8 h-8 text-[#E04F26]" />
          <div>
            <h2 className="text-2xl font-bold text-stone-900 font-serif">
              Generare Cod QR Alergii
            </h2>
            <p className="text-stone-500 text-sm">
              Selectează restricțiile tale alimentare pentru a genera un cod QR
              personalizat.
            </p>
          </div>
        </div>

        {/* Selecție Alergeni */}
        <div className="mb-8">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-3">
            Alergeni
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_LIST.map((alg) => {
              const isSelected = selectedAllergens.includes(alg);
              return (
                <button
                  key={alg}
                  type="button"
                  onClick={() => toggleAllergen(alg)}
                  className={`text-xs px-4 py-2.5 rounded-2xl font-semibold capitalize transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 shadow-md"
                      : "bg-white text-stone-700 border-[#E5DFD3] hover:border-[#E04F26]/40"
                  }`}
                >
                  {alg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afișare Cod QR */}
        <div className="bg-white p-8 rounded-3xl border border-[#E5DFD3] flex flex-col items-center justify-center gap-4 text-center shadow-inner">
          <QRCodeSVG
            value={qrData}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#1C1917"
            level="H"
          />
          <p className="text-xs text-stone-500 font-mono">
            {selectedAllergens.length > 0
              ? `Codifică: ${selectedAllergens.join(", ")}`
              : "Niciun alergen selectat"}
          </p>
        </div>
      </div>
    </div>
  );
};
