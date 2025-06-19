'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optional: log error to your own logging service
    console.error('Caught by custom error.tsx:', error);
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
        <p className="mt-2 text-gray-600">Please try again or contact support.</p>
        <button
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          onClick={reset}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
