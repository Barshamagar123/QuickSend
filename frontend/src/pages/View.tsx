import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFileInfo, downloadFile } from '../services/view.service';
import CodeViewer from '../components/view/CodeViewer';
import PDFViewer from '../components/view/PDFViewer';
import MetadataCard from '../components/view/MetadataCard';
import Loader from '../components/common/Loader';

export default function View() {
  const { shortCode } = useParams();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shortCode) {
      getFileInfo(shortCode)
        .then(setFileInfo)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [shortCode]);

  const handleDownload = () => {
    if (shortCode) downloadFile(shortCode);
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <MetadataCard fileInfo={fileInfo} onDownload={handleDownload} />
      
      {fileInfo?.fileType?.startsWith('text/') && (
        <CodeViewer fileId={fileInfo.fileId} />
      )}
      
      {fileInfo?.fileType === 'application/pdf' && (
        <PDFViewer fileId={fileInfo.fileId} />
      )}
    </div>
  );
}