interface Props {
  fileInfo: {
    filename?: string;
    size?: number;
    fileType?: string;
    uploadedAt?: string;
    expiresAt?: string;
    views?: number;
  };
  onDownload: () => void;
}

export default function MetadataCard({ fileInfo, onDownload }: Props) {
  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="card mb-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        📋 File Information
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Filename:</span>
          <span className="font-medium">{fileInfo?.filename || 'Unknown'}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Size:</span>
          <span className="font-medium">{formatSize(fileInfo?.size)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium">{fileInfo?.fileType || 'Unknown'}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Uploaded:</span>
          <span className="font-medium">{formatDate(fileInfo?.uploadedAt)}</span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Expires:</span>
          <span className="font-medium text-orange-600">
            {formatDate(fileInfo?.expiresAt)}
          </span>
        </div>
        
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Views:</span>
          <span className="font-medium">{fileInfo?.views || 0}</span>
        </div>
      </div>

      <button
        onClick={onDownload}
        className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
      >
        ⬇️ Download File
      </button>
    </div>
  );
}