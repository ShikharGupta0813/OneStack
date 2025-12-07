import React, { useRef, useEffect, useState } from 'react';

/**
 * InteractiveGridBackground
 * - Animated grid with mouse-following glow, inspired by FNZ.com
 * - Pure React + Tailwind (no canvas, no extra libs)
 * - Optimized for performance
 */
const GRID_SIZE = 28; // Number of columns/rows
const CELL_SIZE = 32; // px
const GLOW_RADIUS = 4; // cells
const GLOW_MAX = 0.85; // max opacity
const GLOW_MIN = 0.08; // min opacity

export const InteractiveGridBackground: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Track mouse position relative to grid
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!gridRef.current) return;
      const rect = gridRef.current.getBoundingClientRect();
      setMouse({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Track grid size
  useEffect(() => {
    const update = () => {
      if (!gridRef.current) return;
      setDimensions({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Calculate grid
  const cols = Math.floor(dimensions.width / CELL_SIZE);
  const rows = Math.floor(dimensions.height / CELL_SIZE);

  // Render grid cells
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Cell center
      const cx = x * CELL_SIZE + CELL_SIZE / 2;
      const cy = y * CELL_SIZE + CELL_SIZE / 2;
      // Distance from mouse
      const dx = (mouse.x - cx) / CELL_SIZE;
      const dy = (mouse.y - cy) / CELL_SIZE;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Glow intensity
      let glow = 0;
      if (dist < GLOW_RADIUS) {
        glow = GLOW_MAX * (1 - dist / GLOW_RADIUS);
      }
      if (glow < GLOW_MIN) glow = GLOW_MIN;
      // Color
      const color = `rgba(34,212,255,${glow.toFixed(2)})`; // cyan glow
      cells.push(
        <div
          key={`${x},${y}`}
          className="transition-all duration-200 will-change-transform"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            boxShadow: glow > 0.12 ? `0 0 16px 6px ${color}` : undefined,
            background:
              glow > 0.12
                ? `radial-gradient(circle at 50% 50%, rgba(34,212,255,${glow * 0.7}), transparent 80%)`
                : 'transparent',
            border: '1px solid rgba(100,116,139,0.08)', // slate-500/10
            borderRadius: 6,
            opacity: 0.9,
            zIndex: 1,
          }}
        />
      );
    }
  }

  // Subtle noise overlay
  return (
    <div
      ref={gridRef}
      className="fixed inset-0 w-full h-full z-0 pointer-events-none select-none overflow-hidden"
      style={{
        background:
          'linear-gradient(120deg, #0f172a 60%, #0ea5e9 120%)', // slate-950 to cyan-400
        transition: 'background 0.5s',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
        }}
      >
        {cells}
      </div>
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100\' height=\'100\' fill=\'white\' fill-opacity=\'0.01\'/%3E%3Ccircle cx=\'20\' cy=\'80\' r=\'1.5\' fill=\'white\' fill-opacity=\'0.04\'/%3E%3Ccircle cx=\'70\' cy=\'30\' r=\'1.2\' fill=\'white\' fill-opacity=\'0.03\'/%3E%3C/svg%3E")',
          opacity: 0.18,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
};
