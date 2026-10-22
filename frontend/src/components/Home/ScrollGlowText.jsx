import React, { useEffect, useRef } from "react";

const ScrollGlowText = ({ text = "BookBasket", className = "" }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lettersDataRef = useRef([]);
  const smoothScrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const initText = () => {
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const fontSize = Math.min(width * 0.15, 115);
      const fontStr = `400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;

      const offCanvas = document.createElement("canvas");
      const offCtx = offCanvas.getContext("2d");
      offCanvas.width = width;
      offCanvas.height = height;
      offCtx.font = fontStr;
      offCtx.textBaseline = "middle";

      const fullWidth = offCtx.measureText(text).width;
      let startX = (width - fullWidth) / 2;
      const centerY = height / 2;

      const lettersData = [];

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = offCtx.measureText(char).width;

        lettersData.push({
          char,
          startX,
          charWidth,
          centerY,
          normPos: text.length > 1 ? i / (text.length - 1) : 0.5,
        });

        startX += charWidth;
      }

      lettersDataRef.current = lettersData;
    };

    if (document.fonts) {
      document.fonts.ready.then(initText);
    } else {
      setTimeout(initText, 100);
    }

    const handleResize = () => {
      initText();
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth scroll interpolation for fluid, responsive highlight tracking
      const targetScroll = window.scrollY || window.pageYOffset || 0;
      smoothScrollRef.current += (targetScroll - smoothScrollRef.current) * 0.22;
      const currentScroll = smoothScrollRef.current;

      // Faster scroll sweep (completes over ~150px of scrolling)
      const sweepDistance = 150;
      const rawProgress = Math.min(1, Math.max(0, currentScroll / sweepDistance));
      // Sweeps from letter 0 all the way past the final letter seamlessly
      const scrollSweepProgress = rawProgress * 1.18 - 0.08;

      const letters = lettersDataRef.current;
      const fontSize = Math.min(width * 0.15, 115);
      const fontStr = `400 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
      ctx.font = fontStr;
      ctx.textBaseline = "middle";

      for (let i = 0; i < letters.length; i++) {
        const item = letters[i];

        // Calculate Scroll Highlight Beam Intensity
        const beamDist = Math.abs(scrollSweepProgress - item.normPos);
        const beamWidth = 0.32; // Width of the highlight beam across letters
        const highlightFactor = Math.max(0, 1 - beamDist / beamWidth);
        const glow = Math.pow(highlightFactor, 2);

        // Dynamic Color matching the 3D Topographic Wave Particle Palette:
        // Blends from soft luminous white (250, 250, 250) to vivid wave particle crest (#4ADE80 - 74, 222, 128)
        const r = Math.round(250 - glow * 176);
        const g = Math.round(250 - glow * 28);
        const b = Math.round(250 - glow * 122);

        ctx.save();
        if (glow > 0.05) {
          ctx.shadowColor = `rgba(74, 222, 128, ${glow * 0.95})`;
          ctx.shadowBlur = glow * 26;
        }
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillText(item.char, item.startX, item.centerY);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [text]);

  return (
    <div className={`relative w-full flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-32 sm:h-40 md:h-48 lg:h-56 block max-w-5xl cursor-default"
      />
      <h1 className="sr-only">{text}</h1>
    </div>
  );
};

export default ScrollGlowText;
