import Link from 'next/link';

export default function OldContentPage({ params }: { params: { slug: string[] } }) {
  const path = params.slug.join('/');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Content Migrating</h1>
        <p className="text-gray-600 mb-6">
          This content is being migrated from our previous website.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Path: /{path}
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
          <Link 
            href="/chronicles" 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            View News
          </Link>
        </div>
      </div>
    </div>
  );
}
