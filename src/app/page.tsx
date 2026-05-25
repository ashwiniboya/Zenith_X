import HeadphoneScroll from '@/components/HeadphoneScroll';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black">
      {/* 
        This is the main scroll-triggered storytelling component. 
        It has a height of 400vh to ensure long scrolling. 
        The canvas inside is sticky and tracks 120 frames. 
      */}
      <HeadphoneScroll />

      {/* 
        Footer area (after the 400vh scroll) to ensure smooth transition 
        past the storytelling section.
      */}
      <section className="relative z-10 w-full py-32 bg-[#050505] flex flex-col items-center justify-center border-t border-white/10">
        <p className="text-white/40 uppercase tracking-widest text-sm mb-4">
          Experience Zenith
        </p>
        <div className="flex gap-8 mb-12">
          <a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Specifications</a>
          <a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Design Story</a>
          <a href="#" className="text-white/60 hover:text-white transition-colors duration-300">Retailers</a>
        </div>
        <p className="text-white/20 text-xs text-center px-4 max-w-sm">
          © 2026 Zenith Audio. All rights reserved.
          Headphone rendering uses WebGL and HTML5 Canvas technology for optimal performance.
        </p>
      </section>
    </main>
  );
}
