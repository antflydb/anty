'use client';

/**
 * Anty V3 - Using Actual Figma Assets
 */

const img = "http://localhost:3845/assets/f61f5eee0a4c503b51eb2c596b246821745b99a8.svg";
const img1 = "http://localhost:3845/assets/a14b6cd517de309621701f782bdf6c81889c4a43.svg";
const img2 = "http://localhost:3845/assets/36dc1ef172b0d1bbf9cfbd7e399e8dbb0da0b3b4.svg";

export default function AntyV3() {
  return (
    <div className="bg-white min-h-screen flex flex-col relative">
      {/* Hearts - Top right */}
      <div className="absolute top-8 right-8 flex gap-2.5">
        <img src="/heart.svg" alt="heart" className="w-7 h-7" />
        <img src="/heart.svg" alt="heart" className="w-7 h-7" />
        <img src="/heart.svg" alt="heart" className="w-7 h-7" />
      </div>

      {/* Character - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative size-[160px]">
          <div className="absolute inset-[13.46%_0_0_13.46%]">
            <img alt="" className="block max-w-none size-full" src={img} />
          </div>
          <div className="absolute inset-[0_13.15%_13.15%_0]">
            <img alt="" className="block max-w-none size-full" src={img1} />
          </div>
          <div className="absolute flex inset-[33.41%_31.63%_38.76%_56.72%] items-center justify-center">
            <div className="flex-none scale-y-[-100%]" style={{ height: '44.52px', width: '18.63px' }}>
              <div className="relative size-full">
                <img alt="" className="block max-w-none size-full" src={img2} />
              </div>
            </div>
          </div>
          <div className="absolute flex inset-[33.41%_57.36%_38.76%_31%] items-center justify-center">
            <div className="flex-none scale-y-[-100%]" style={{ height: '44.52px', width: '18.63px' }}>
              <div className="relative size-full">
                <img alt="" className="block max-w-none size-full" src={img2} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons - Bottom */}
      <div className="flex gap-5 justify-center pb-8">
        <button className="hover:scale-105 transition-transform">
          <img src="/button-chat.svg" alt="Chat" className="w-[57.6px] h-[57.6px]" />
        </button>

        <button className="hover:scale-105 transition-transform">
          <img src="/button-moods.svg" alt="Moods" className="w-[57.6px] h-[57.6px]" />
        </button>

        <button className="hover:scale-105 transition-transform">
          <img src="/button-play.svg" alt="Play" className="w-[57.6px] h-[57.6px]" />
        </button>

        <button className="hover:scale-105 transition-transform">
          <img src="/button-eat.svg" alt="Eat" className="w-[57.6px] h-[57.6px]" />
        </button>
      </div>
    </div>
  );
}
