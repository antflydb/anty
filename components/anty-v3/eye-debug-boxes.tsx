'use client';

import { useEffect, useState } from 'react';

interface EyeDebugBoxesProps {
  leftEyeRef: React.RefObject<HTMLDivElement>;
  rightEyeRef: React.RefObject<HTMLDivElement>;
}

export function EyeDebugBoxes({ leftEyeRef, rightEyeRef }: EyeDebugBoxesProps) {
  const [boxes, setBoxes] = useState<{
    left: DOMRect | null;
    right: DOMRect | null;
  }>({ left: null, right: null });

  useEffect(() => {
    let animationFrameId: number;

    const updateBoxes = () => {
      if (leftEyeRef.current && rightEyeRef.current) {
        setBoxes({
          left: leftEyeRef.current.getBoundingClientRect(),
          right: rightEyeRef.current.getBoundingClientRect(),
        });
      }
      animationFrameId = requestAnimationFrame(updateBoxes);
    };

    updateBoxes();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [leftEyeRef, rightEyeRef]);

  return (
    <>
      {/* Left Eye Bounding Box - Orange */}
      {boxes.left && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: boxes.left.left,
            top: boxes.left.top,
            width: boxes.left.width,
            height: boxes.left.height,
            border: '2px dashed #fb923c',
            boxShadow: '0 0 0 1px rgba(251, 146, 60, 0.2)',
          }}
        />
      )}

      {/* Right Eye Bounding Box - Yellow */}
      {boxes.right && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: boxes.right.left,
            top: boxes.right.top,
            width: boxes.right.width,
            height: boxes.right.height,
            border: '2px dashed #fde047',
            boxShadow: '0 0 0 1px rgba(253, 224, 71, 0.2)',
          }}
        />
      )}
    </>
  );
}
