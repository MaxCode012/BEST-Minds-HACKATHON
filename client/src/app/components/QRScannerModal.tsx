import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ onScanSuccess, onClose }) => {
  const [errorMsg, setErrorMsg] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const cleanUpScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (e) {
        console.warn('Eroare la oprirea scanerului:', e);
      }
      scannerRef.current = null;
    }

    const container = document.getElementById('qr-camera-stream');
    if (container) {
      const videos = container.getElementsByTagName('video');
      for (let i = 0; i < videos.length; i++) {
        if (videos[i].srcObject) {
          const stream = videos[i].srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      }
      container.innerHTML = '';
    }
  };

  useEffect(() => {
    let isMounted = true;
    const elementId = 'qr-camera-stream';

    const startCamera = async () => {
      await cleanUpScanner();
      if (!isMounted) return;

      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 200, height: 200 },
          },
          (decodedText: string) => {
            if (isMounted) {
              cleanUpScanner().then(() => onScanSuccess(decodedText));
            }
          },
          () => {}
        );
      } catch (err) {
        if (isMounted) {
          console.error('Eroare cameră:', err);
          setErrorMsg('Nu s-a putut accesa camera video. Permiteți accesul din browser.');
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      cleanUpScanner();
    };
  }, []);

  const handleClose = async () => {
    await cleanUpScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <div className="bg-[#FAF7F2] border border-[#E5DFD3] p-6 rounded-3xl w-full max-w-sm text-center relative shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Buton Închidere */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Iconiță Aparat Foto */}
        <div className="w-12 h-12 rounded-full bg-[#E04F26]/10 border border-[#E04F26]/20 text-[#E04F26] flex items-center justify-center mx-auto mb-3 shadow-sm">
          <Camera className="w-5 h-5" />
        </div>

        {/* Titlu & Subtitlu */}
        <h3 className="text-stone-900 font-serif font-bold text-xl mb-1 tracking-wide">
          Scanați Codul QR
        </h3>
        <p className="text-xs text-stone-500 mb-5 leading-relaxed font-light">
          Îndreptați camera foto către codul QR pentru preluarea preferințelor.
        </p>

        {/* Eroare sau Stream Camera */}
        {errorMsg ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 text-left shadow-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl border border-[#E5DFD3] bg-stone-950 h-[240px] max-h-[240px] flex items-center justify-center shadow-inner">
            <div id="qr-camera-stream" className="w-full h-full [&>video]:object-cover [&>video]:h-full [&>video]:w-full"></div>
          </div>
        )}

        {/* Buton Anulează */}
        <button
          onClick={handleClose}
          className="mt-5 w-full py-3 bg-[#EAE4D9] hover:bg-[#E0D8C9] text-stone-800 font-bold rounded-2xl text-xs transition-all cursor-pointer border border-[#DCD3C1] shadow-sm active:scale-[0.98]"
        >
          Anulează
        </button>
      </div>
    </div>
  );
};