import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function DropZone({ onUpload, loading }: Props) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !loading) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload, loading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    disabled: loading
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50'}
      `}
    >
      <input {...getInputProps()} />
      {loading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Uploading...</p>
        </div>
      ) : isDragActive ? (
        <div>
          <p className="text-2xl mb-2">📂</p>
          <p className="text-blue-600 font-medium">Drop the file here...</p>
        </div>
      ) : (
        <div>
          <p className="text-5xl mb-4">📁</p>
          <p className="text-gray-700 font-medium mb-2">Drag & drop a file here</p>
          <p className="text-gray-500 text-sm">or click to select</p>
          <p className="text-gray-400 text-xs mt-4">Maximum file size: 100MB</p>
        </div>
      )}
    </div>
  );
}