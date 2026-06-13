import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFileInfo } from '../services/view.service';
import LinkDisplay from '../components/result/LinkDisplay';
import QRDisplay from '../components/result/QrDisplay';
import ShareButtons from '../components/result/ShareButtons';
import Loader from '../components/common/Loader';

export default function Result() {
  const { shortCode } = useParams();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shortCode) {
      getFileInfo(shortCode)
        .then(setFileInfo)
        .finally(() => setLoading(false));
    }
  }, [shortCode]);

  if (loading) return <Loader />;

  const fullUrl = `${window.location.origin}/view/${shortCode}`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">File Shared Successfully!</h2>
        <p className="text-gray-600">Your file is ready to share</p>
      </div>

      <LinkDisplay shortCode={shortCode!} fullUrl={fullUrl} />
      <QRDisplay shortCode={shortCode!} fullUrl={fullUrl} />
      <ShareButtons shortCode={shortCode!} fullUrl={fullUrl} />
    </div>
  );
}