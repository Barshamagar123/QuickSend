import { useEffect, useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface Props {
  fileId: string;
}

export default function CodeViewer({ fileId }: Props) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch file content from file-storage-service
    fetch(`http://localhost:3005/file/${fileId}`)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fileId]);

  if (loading) return <div className="text-center py-8">Loading code...</div>;

  return (
    <div className="card mt-6">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        📄 Code Content
      </h3>
      <div className="overflow-auto rounded-lg">
        <SyntaxHighlighter
          language="javascript"
          style={vs2015}
          showLineNumbers
          wrapLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}