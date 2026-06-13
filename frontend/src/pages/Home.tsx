import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropZone from '../components/upload/DropZone';
import TextPaste from '../components/upload/TextPaste';
import { uploadFile } from '../services/upload.service';

export default function Home() {
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const result = await uploadFile(file);
      navigate(`/result/${result.shortCode}`);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          QuickSend
        </h1>
        <p className="text-xl text-gray-600">
          Share files instantly with short links and QR codes
        </p>
      </div>

      <div className="flex gap-4 mb-8 justify-center">
        <button
          onClick={() => setMode('file')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            mode === 'file'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📁 Upload File
        </button>
        <button
          onClick={() => setMode('text')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
            mode === 'text'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          📝 Paste Text/Code
        </button>
      </div>

      {mode === 'file' ? (
        <DropZone onUpload={handleUpload} loading={loading} />
      ) : (
        <TextPaste />
      )}
    </div>
  );
}