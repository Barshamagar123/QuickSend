import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function View() {
  const { shortCode } = useParams();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');

  useEffect(() => {
    if (!shortCode) return;

    // Fetch file metadata
    fetch(`http://localhost:3004/preview/${shortCode}`)
      .then(res => {
        if (!res.ok) throw new Error('File not found or expired');
        return res.json();
      })
      .then(async (data) => {
        setFileInfo(data);
        
        // If it's text, fetch the content
        if (data.mimetype?.startsWith('text/')) {
          const textRes = await fetch(`http://localhost:3004/view/${shortCode}`);
          const text = await textRes.text();
          setTextContent(text);
        }
        
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [shortCode]);

  const handleDownload = () => {
    window.open(`http://localhost:3004/view/${shortCode}`, '_blank');
  };

  const handleCopyText = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      alert('Text copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">The link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  if (!fileInfo) return null;

  // PDF Files
  if (fileInfo.mimetype === 'application/pdf') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{fileInfo.filename}</h1>
              <p className="text-gray-600">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Download PDF
            </button>
          </div>
        </div>
        <iframe
          src={`http://localhost:3004/view/${shortCode}`}
          className="w-full h-[800px] border rounded-lg"
          title="PDF Viewer"
        />
      </div>
    );
  }

  // Text/Code Files
  if (fileInfo.mimetype?.startsWith('text/')) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{fileInfo.filename}</h1>
              <p className="text-gray-600">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
              <p className="text-gray-600">Type: {fileInfo.mimetype}</p>
            </div>
            <div className="space-x-2">
              <button
                onClick={handleCopyText}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Copy Text
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download
              </button>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
          <pre className="text-white font-mono text-sm whitespace-pre-wrap">
            {textContent || 'Loading content...'}
          </pre>
        </div>
      </div>
    );
  }

  // Images
  if (fileInfo.mimetype?.startsWith('image/')) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h1 className="text-2xl font-bold">{fileInfo.filename}</h1>
          <p className="text-gray-600">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
          <button
            onClick={handleDownload}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Download
          </button>
        </div>
        <img
          src={`http://localhost:3004/view/${shortCode}`}
          alt={fileInfo.filename}
          className="max-w-full rounded-lg shadow"
        />
      </div>
    );
  }

  // Other files
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-4">{fileInfo.filename}</h1>
        <p className="mb-2">Type: {fileInfo.mimetype}</p>
        <p className="mb-4">Size: {(fileInfo.size / 1024).toFixed(2)} KB</p>
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Download File
        </button>
      </div>
    </div>
  );
}