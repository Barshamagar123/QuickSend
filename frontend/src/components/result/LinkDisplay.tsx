import { useState } from 'react';

interface Props {
  shortCode: string;
  fullUrl: string;
}

export default function LinkDisplay({ shortCode, fullUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card mb-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        🔗 Your Short Link
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={fullUrl}
          readOnly
          className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="btn-secondary whitespace-nowrap"
        >
          {copied ? '✅ Copied!' : '📋 Copy Link'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Short code: <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code>
      </p>
    </div>
  );
}