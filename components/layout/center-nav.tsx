'use client';

import Image from "next/image";
import Link from "next/link";

interface CenterNavProps {
  onMenuClick: () => void;
}

export function CenterNav({ onMenuClick }: CenterNavProps) {
  return (
    <div
      className="flex items-center justify-between bg-white rounded-full pl-6 pr-2 py-2 w-[356px] center-nav-hover group"
      style={{
        border: '1px solid rgba(227, 220, 220, 0.53)',
        boxShadow: '0 5.635px 21.287px 0 rgba(0, 0, 0, 0.03), 0 2.993px 11.305px 0 rgba(0, 0, 0, 0.02), 0 1.245px 4.704px 0 rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
        <Image
          src="/af-logo.svg"
          alt="SearchAF Logo"
          width={27.55}
          height={27.55}
          className="w-[27.55px] h-[27.55px]"
        />
        <span className="text-[20px] logo-text relative" style={{ top: '-1px', width: '96px', display: 'inline-block' }}>
          <span style={{ fontWeight: 400 }}>search</span>
          <span style={{ fontWeight: 700 }}>af</span>
        </span>
      </Link>

      {/* CMD+K Shortcut */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1 text-sm font-medium opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          style={{
            color: '#ADB4B7',
            transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}
        >
          <span>⌘</span>
          <span>K</span>
        </div>
        <button
          onClick={onMenuClick}
          className="w-[52px] h-[52px] rounded-full relative overflow-hidden flex items-center justify-center group/button">
          {/* Base gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#EAF1FF] to-[#FAEDFE] transition-opacity duration-300 ease-in-out" />
          {/* Hover gradient */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#C2D9FC] to-[#F7CCFA] opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 ease-in-out" />
          <Image
            src="/menu1.svg"
            alt="Menu"
            width={34}
            height={34}
            className="w-[34px] h-[34px] relative z-10"
          />
        </button>
      </div>
    </div>
  );
}
