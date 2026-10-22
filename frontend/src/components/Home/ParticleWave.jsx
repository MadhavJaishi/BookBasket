import React, { useEffect, useRef } from "react";

const ParticleWave = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let dpr = window.devicePixelRatio || 1;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // High density particle grid for continuous terrain mesh
    const cols = 145;
    const rows = 68;
    let time = 0;

    // Pre-calculate per-point deterministic stipple jitter for sandy dune texture
    const jitterGrid = [];
    for (let r = 0; r < rows; r++) {
      const rowArr = [];
      for (let c = 0; c < cols; c++) {
        rowArr.push({
          jx: (Math.random() - 0.5) * 3.5,
          jy: (Math.random() - 0.5) * 3.5,
          jz: (Math.random() - 0.5) * 5.0,
          randRadius: Math.random() * 0.45 + 0.65,
          shimmer: Math.random() * 0.35 + 0.85,
        });
      }
      jitterGrid.push(rowArr);
    }

    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      const fov = 420;
      const cameraY = -220;
      const cameraZ = -100;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitter = jitterGrid[r][c];

          // Normalized coordinates across grid
          const u = (c / (cols - 1) - 0.5) * 2; // -1 to 1
          const v = r / (rows - 1); // 0 (foreground) to 1 (background)

          // Multi-harmonic 3D Topographic Terrain
          const hillLeft = Math.exp(-Math.pow((u + 0.65) / 0.55, 2)) * 110;
          const hillRight = Math.exp(-Math.pow((u - 0.7) / 0.6, 2)) * 120;
          const hillCenter = Math.exp(-Math.pow(u / 0.45, 2)) * 60 * Math.sin(v * 4 + time * 1.5);
          
          const undulatingWave = Math.sin(u * 4.2 + time * 1.1) * Math.cos(v * 3.2 - time * 0.9) * 45;
          const fineRipples = Math.sin(u * 9.5 + v * 8.0 + time * 1.6) * 14;
          const duneSlope = (1 - v) * 30;

          const baseElevation = hillLeft + hillRight + hillCenter + undulatingWave + fineRipples + duneSlope;
          
          // 3D coordinates in world space
          const x3d = u * (width * 0.74) + jitter.jx;
          const z3d = v * 640 + 80 + jitter.jz;
          const y3d = -baseElevation + 85 + jitter.jy;

          // 3D perspective projection
          const relZ = z3d - cameraZ;
          if (relZ <= 0) continue;

          const scale = fov / relZ;
          const projX = width / 2 + x3d * scale;
          const projY = height * 0.22 + (y3d - cameraY) * scale;

          if (projX < -20 || projX > width + 20 || projY < -20 || projY > height + 20) continue;

          // Lighting and crest calculation (ridges glow brighter emerald/chartreuse)
          const ridgeFactor = Math.max(0, Math.min(1, (baseElevation - 10) / 95));
          const depthFade = Math.max(0.15, 1 - v * 0.65);
          
          // Color ramp: Deep moss (#166534) -> Vivid emerald (#34d399) -> Luminous lime-chartreuse (#a7f3d0 / #86efac)
          const rCol = Math.round(30 + ridgeFactor * 130);
          const gCol = Math.round(140 + ridgeFactor * 105);
          const bCol = Math.round(75 + ridgeFactor * 95);
          
          const alpha = Math.max(0.08, Math.min(0.92, (0.3 + ridgeFactor * 0.7) * depthFade * jitter.shimmer));
          const pointRadius = Math.max(0.55, jitter.randRadius * scale * 1.35);

          ctx.beginPath();
          ctx.arc(projX, projY, pointRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block pointer-events-none"
      style={{ filter: "drop-shadow(0 0 18px rgba(74, 222, 128, 0.22))" }}
    />
  );
};

export default ParticleWave;
