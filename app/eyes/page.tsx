'use client';

import { EYE_SHAPES, EYE_DIMENSIONS } from '@searchaf/anty-embed';

export default function EyesPage() {
  const eyeShapes = Object.keys(EYE_SHAPES) as Array<keyof typeof EYE_SHAPES>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Anty Eye Shapes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eyeShapes.map((shapeName) => {
            const path = EYE_SHAPES[shapeName];
            const dimensions = EYE_DIMENSIONS[shapeName];

            return (
              <div
                key={shapeName}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">
                  {shapeName}
                </h2>

                <div className="flex items-center justify-center bg-gray-100 rounded-lg p-8 mb-4">
                  <svg
                    width={dimensions.width * 3}
                    height={dimensions.height * 3}
                    viewBox={dimensions.viewBox}
                    className="fill-gray-900"
                  >
                    <path d={path} />
                  </svg>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Width:</span>
                    <span>{dimensions.width}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Height:</span>
                    <span>{dimensions.height}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">ViewBox:</span>
                    <span className="font-mono text-xs">{dimensions.viewBox}</span>
                  </div>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    View SVG Path
                  </summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 break-all">
                    {path}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
