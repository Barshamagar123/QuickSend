interface Props {
  shortCode: string;
  fullUrl: string;
}

export default function ShareButtons({ shortCode, fullUrl }: Props) {
  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=Check out this file: ${fullUrl}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(fullUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`, '_blank');
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        📤 Share This Link
      </h3>
      <div className="flex gap-3 justify-center">
        <button onClick={shareOnTwitter} className="text-2xl hover:scale-110 transition">
          🐦
        </button>
        <button onClick={shareOnWhatsApp} className="text-2xl hover:scale-110 transition">
          💬
        </button>
        <button onClick={shareOnLinkedIn} className="text-2xl hover:scale-110 transition">
          🔗
        </button>
      </div>
    </div>
  );
}