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

  // Funcție de siguranță pentru oprirea fizică a camerei foto
  const forceStopCameraTracks = () => {
    try {
      const container = document.getElementById('qr-camera-stream');
      if (container) {
        const videoElement = container.querySelector('video') as HTMLVideoElement | null;
        if (videoElement && videoElement.srcObject) {
          const stream = videoElement.srcObject as MediaStream;
          stream.getTracks().forEach((track) => {
            track.stop(); // Oprește direct pista hardware a camerei
          });
          videoElement.srcObject = null;
        }
      }
    } catch (e) {
      console.error('Eroare la oprirea pistelor camerei:', e);
    }
  };

  useEffect(() => {
    const elementId = 'qr-camera-stream';
    const html5QrCode = new Html5Qrcode(elementId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText: string) => {
          // Scanat cu succes: oprim scanerul, oprim camera și trimitem rezultatul
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current
              .stop()
              .then(() => {
                forceStopCameraTracks();
                onScanSuccess(decodedText);
              })
              .catch(() => {
                forceStopCameraTracks();
                onScanSuccess(decodedText);
              });
          } else {
            forceStopCameraTracks();
            onScanSuccess(decodedText);
          }
        },
        () => {
          // Eroare la cadrele individuale - ignorată în timpul streaming-ului
        }
      )
      .catch((err) => {
        console.error('Eroare la accesarea camerei:', err);
        setErrorMsg('Nu s-a putut accesa camera video. Permiteți accesul la cameră din browser.');
      });

    // Cleanup: Se execută automat la demontarea componentei
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .then(() => forceStopCameraTracks())
          .catch(() => forceStopCameraTracks());
      } else {
        forceStopCameraTracks();
      }
    };
  }, [onScanSuccess]);

  const handleClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          forceStopCameraTracks();
          onClose();
        })
        .catch(() => {
          forceStopCameraTracks();
          onClose();
        });
    } else {
      forceStopCameraTracks();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white border border-line p-5 rounded-2xl w-full max-w-sm text-center relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-muted hover:text-ink transition-colors p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand/20 text-brand flex items-center justify-center mx-auto mb-2">
          <Camera className="w-5 h-5" />
        </div>

        <h3 className="text-ink font-serif font-bold text-base mb-1">
          Scanați Codul QR
        </h3>
        <p className="text-xs text-muted mb-4">
          Îndreptați camera foto către codul QR pentru preluarea preferințelor.
        </p>

        {errorMsg ? (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-line bg-black min-h-[250px]">
            <div id="qr-camera-stream" className="w-full h-full"></div>
          </div>
        )}

        <button
          onClick={handleClose}
          className="mt-4 w-full py-2.5 bg-sand hover:bg-line text-ink font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Anulează
        </button>
      </div>
    </div>
  );
};