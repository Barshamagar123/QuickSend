interface Props {
  fileId: string;
}

export default function PDFViewer({ fileId }: Props) {
  return (
    <div className="card mt-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        📄 PDF Preview
      </h3>
      <iframe
        src={`http://localhost:3005/file/${fileId}`}
        className="w-full h-[600px] border-0 rounded-lg"
        title="PDF Viewer"
      />
      <p className="text-sm text-gray-500 mt-3 text-center">
        If PDF doesn't load,{' '}
        <a
          href={`http://localhost:3005/file/${fileId}`}
          download
          className="text-blue-600 hover:underline"
        >
          download it here
        </a>
      </p>
    </div>
  );
}