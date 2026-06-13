import { useState } from 'react';
import { uploadText } from '../../services/upload.service';
import { useNavigate } from 'react-router-dom';

export default function TextPaste() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      const result = await uploadText(content);
      navigate(`/result/${result.shortCode}`);
    } catch (error) {
      alert('Failed to share text');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your text or code here..."
        className="w-full h-64 p-4 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || loading}
        className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sharing...' : 'Share Text'}
      </button>
    </div>
  );
}