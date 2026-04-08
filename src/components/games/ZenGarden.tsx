import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Eraser, Sparkles } from 'lucide-react';

export default function ZenGarden() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#d2b48c'); // Sand color

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Fill with sand
        ctx.fillStyle = '#f3e5ab';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    ctx?.beginPath();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'; // Rake effect

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#f3e5ab';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="relative w-full h-[500px] bg-white/30 rounded-3xl overflow-hidden border border-calm-soft group">
      <div className="absolute top-4 left-6 z-10">
        <h3 className="font-serif text-2xl italic text-calm-accent">Zen Garden</h3>
        <p className="text-sm text-calm-ink/60">Rake the sand to clear your mind</p>
      </div>

      <div className="absolute top-4 right-6 z-10 flex gap-2">
        <button 
          onClick={clear}
          className="p-3 bg-white/80 hover:bg-white rounded-full shadow-sm transition-all text-calm-accent"
          title="Smooth the sand"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full cursor-pointer touch-none"
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Use your finger or mouse to rake
      </div>
    </div>
  );
}
