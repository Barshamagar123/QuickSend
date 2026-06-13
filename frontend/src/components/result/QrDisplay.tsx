import { QRCodeSVG } from 'qrcode.react';

interface Props {
  shortCode: string;
  fullUrl: string;
}

export default function QRDisplay({ shortCode, fullUrl }: Props) {
  const downloadQR = () => {
    const canvas = document.getElementById('qr-code') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qrcode-${shortCode}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="card text-center mb-6">
      <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
        📱 QR Code
      </h3>
      <div className="flex justify-center mb-4">
        <QRCodeSVG id="qr-code" value={fullUrl} size={200} level="H" />
      </div>
      <button onClick={downloadQR} className="btn-secondary text-sm">
        💾 Download QR Code
      </button>
    </div>
  );
}