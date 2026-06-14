import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function View() {
  const { shortCode } = useParams();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortCode) {
      // Fetch file metadata from PREVIEW endpoint
      fetch(`http://localhost:3004/preview/${shortCode}`)
        .then(res => {
          if (!res.ok) throw new Error('File not found');
          return res.json();
        })
        .then(data => {
          setFileInfo(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [shortCode]);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;
  if (!fileInfo) return <div className="text-center p-8">No file found</div>;

  // For PDF files - show embedded PDF
  if (fileInfo.mimetype === 'application/pdf') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold">{fileInfo.filename}</h1>
          <p className="text-gray-600">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
          <button 
            onClick={() => window.open(`http://localhost:3004/view/${shortCode}`, '_blank')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Download
          </button>
        </div>
        <iframe
          src={`http://localhost:3004/view/${shortCode}`}
          className="w-full h-[800px] border rounded-lg"
          title="PDF Viewer"
        />
      </div>
    );
  }

  // For text files
  if (fileInfo.mimetype?.startsWith('text/')) {
    const [content, setContent] = useState('');
    useEffect(() => {
      fetch(`http://localhost:3004/view/${shortCode}`)
        .then(res => res.text())
        .then(setContent);
    }, [shortCode]);
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold">{fileInfo.filename}</h1>
          <button 
            onClick={() => window.open(`http://localhost:3004/view/${shortCode}`, '_blank')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Download
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
          {content}
        </pre>
      </div>
    );
  }

  // For other files
  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4">{fileInfo.filename}</h1>
        <p className="mb-4">Type: {fileInfo.mimetype}</p>
        <p className="mb-4">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
        <button 
          onClick={() => window.open(`http://localhost:3004/view/${shortCode}`, '_blank')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Download File
        </button>
      </div>
    </div>
  );
}