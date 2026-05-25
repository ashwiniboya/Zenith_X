'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 40;
const INITIAL_FRAME = 1;

interface HeadphoneScrollProps {
  imagePathPrefix?: string;
  imagePathSuffix?: string;
}

export default function HeadphoneScroll({
  imagePathPrefix = '/ezgif-split/ezgif-frame-',
  imagePathSuffix = '.jpg',
}: HeadphoneScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const isLoaded = imagesLoaded === FRAME_COUNT;

  // Track scroll progressive from 0 to 1 inside the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      // Format number to be 3 digits (e.g., 001, 012, 120)
      const frameIndex = i.toString().padStart(3, '0');
      img.src = `${imagePathPrefix}${frameIndex}${imagePathSuffix}`;

      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };

      img.onerror = () => {
        // Just increment loaded count even if error so we don't get stuck infinitely loading
        // user might not have all images ready
        console.warn(`Failed to load ${img.src}`);
        loadedCount++;
        setImagesLoaded(loadedCount);
      };

      loadedImages.push(img);
    }

    setImages(loadedImages);
  }, [imagePathPrefix, imagePathSuffix]);

  // Render a specific frame on the canvas
  const renderFrame = useCallback(
    (index: number) => {
      if (!canvasRef.current || images.length === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = images[index];
      // Note: we might hit valid index but missing image data if it onerror'd
      if (!img || !img.complete || img.naturalWidth === 0) {
        // Fallback: clear and draw a placeholder or just leave it
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // Draw the image scaled nicely to fit the canvas, centering it.
      // We will assume 1920x1080 native size for the canvas context but responsive style
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio); // Use max for "cover", min for "contain" ... let's use max for a seamless blended background or center it with contain

      // Since the prompt asks for "Seamless Blending: The background of the website MUST match the background color of the image sequence exactly so the image edges are invisible."
      // We can use contain fit to prevent cropping the product
      const scaleRatio = Math.min(hRatio, vRatio);

      const centerShift_x = (canvas.width - img.width * scaleRatio) / 2;
      const centerShift_y = (canvas.height - img.height * scaleRatio) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // We match the exact dark mode #050505 color behind if anything shows
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        img,
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * scaleRatio, img.height * scaleRatio
      );
    },
    [images]
  );

  // Initial render when first image loads
  useEffect(() => {
    if (imagesLoaded > 0 && images.length > 0) {
      renderFrame(0);
    }
  }, [imagesLoaded, images, renderFrame]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      // Re-render current frame on resize so canvas scales
      const currentFrameIndex = Math.floor(scrollYProgress.get() * (FRAME_COUNT - 1));
      renderFrame(currentFrameIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderFrame, scrollYProgress]);

  // Main scroll driver
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Map 0 -> 1 progress to 0 -> 119 frames
    let frameIndex = Math.floor(latest * (FRAME_COUNT - 1));
    if (frameIndex < 0) frameIndex = 0;
    if (frameIndex >= FRAME_COUNT) frameIndex = FRAME_COUNT - 1;

    // Use requestAnimationFrame for smoothness
    requestAnimationFrame(() => renderFrame(frameIndex));
  });

  // Text Animations (Opacities mapped to scroll ranges)

  // 0% - 15% Title fade out
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // 25% - 40% Precision fade in/out
  const precisionOpacity = useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]);
  const precisionY = useTransform(scrollYProgress, [0.2, 0.4], [50, -50]);

  // 55% - 70% Titanium fade in/out
  const titaniumOpacity = useTransform(scrollYProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
  const titaniumY = useTransform(scrollYProgress, [0.5, 0.7], [50, -50]);

  // 85% - 100% CTA fade in
  const ctaOpacity = useTransform(scrollYProgress, [0.8, 0.85, 1], [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, [0.8, 1], [50, 0]);

  return (
    <div ref={containerRef} className="relative w-full text-white" style={{ height: '400vh' }}>

      {/* Sticky Canvas Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050505]">

        {/* Loading Spinner */}
        {!isLoaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
            <div className="h-12 w-12 rounded-full border-t-2 border-r-2 border-white/60 animate-spin"></div>
            <p className="mt-4 text-sm text-white/40 tracking-widest uppercase">
              Loading Sequence ({Math.floor((imagesLoaded / FRAME_COUNT) * 100)}%)
            </p>
          </div>
        )}

        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Text Overlays - Positioned Absolute Over the Sticky Canvas */}

        {/* Title */}
        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mix-blend-difference">
            Zenith X.
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/60 tracking-wide font-light">
            Pure Sound.
          </p>
        </motion.div>

        {/* Precision Engineering */}
        <motion.div
          style={{ opacity: precisionOpacity, y: precisionY }}
          className="absolute inset-0 flex flex-col items-start justify-center pl-[10%] md:pl-[15%] pointer-events-none"
        >
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight mt-32 max-w-sm drop-shadow-lg">
            Precision Engineering.
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-xs leading-relaxed drop-shadow">
            Every component crafted to exact tolerances for an unparalleled acoustic chamber.
          </p>
        </motion.div>

        {/* Titanium Drivers */}
        <motion.div
          style={{ opacity: titaniumOpacity, y: titaniumY }}
          className="absolute inset-0 flex flex-col items-end justify-center pr-[10%] md:pr-[15%] pointer-events-none text-right"
        >
          <h2 className="text-4xl md:text-6xl font-medium tracking-tight mt-32 max-w-sm drop-shadow-lg">
            Titanium Drivers.
          </h2>
          <p className="mt-4 text-lg text-white/60 max-w-xs leading-relaxed ml-auto drop-shadow">
            Ultra-stiff drivers push the boundaries of high-resolution frequency response.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          style={{ opacity: ctaOpacity, y: ctaY }}
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Hear Everything.
          </h2>
          <button className="mt-12 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors pointer-events-auto tracking-wide">
            Pre-order Zenith X
          </button>
        </motion.div>

      </div>
    </div>
  );
}
