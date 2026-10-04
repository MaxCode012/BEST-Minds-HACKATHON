import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Users, QrCode, X, UserPlus, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  members: string[];
  onAddMember: (name: string) => void;
}

export const GroupQRModal: React.FC<Props> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
}) => {
  const [newMemberName, setNewMemberName] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAddMember(newMemberName.trim());
    setNewMemberName("");
  };

  const groupInviteUrl = `${window.location.origin}/menu?table=4&joinGroup=true`;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FAF7F2] border border-[#E5DFD3] rounded-3xl max-w-md w-full p-6 text-left shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#E5DFD3] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E04F26]" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Grup Comandă — Masa #4
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code de Invitație */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD3] flex flex-col items-center justify-center gap-2 text-center mb-5 shadow-inner">
          <QRCodeSVG value={groupInviteUrl} size={140} level="H" />
          <p className="text-[11px] text-stone-500 font-medium">
            Scanează codul QR pentru a te alătura comenzii de la această masă
          </p>
        </div>

        {/* Adăugare Persoană Nouă */}
        <form onSubmit={handleAdd} className="mb-5">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
            Adaugă Persoană la Masă
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Alexandru, Elena..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 bg-white border border-[#E5DFD3] rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-[#E04F26]"
            />
            <button
              type="submit"
              className="bg-[#E04F26] hover:bg-[#c9421d] text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Adaugă
            </button>
          </div>
        </form>

        {/* Lista Membrilor din Grup */}
        <div>
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block mb-2">
            Persoane la masă ({members.length})
          </label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto pr-1">
            {members.map((member) => (
              <span
                key={member}
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-white border border-[#E5DFD3] text-stone-800 px-3 py-1.5 rounded-xl shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                {member}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-[#EAE4D9] hover:bg-[#dcd3c1] text-stone-800 font-bold rounded-2xl transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          Închide
        </button>
      </div>
    </div>
  );
};
