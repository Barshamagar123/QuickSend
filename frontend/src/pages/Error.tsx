import { Link } from 'react-router-dom';

export default function Error() {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔗</div>
      <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
      <p className="text-gray-600 mb-6">
        This link may have expired or doesn't exist.
      </p>
      <Link to="/" className="btn-primary inline-block">
        Create New Link
      </Link>
    </div>
  );
}