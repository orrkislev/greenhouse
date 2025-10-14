// components/CoverZoomCard.jsx
import Link from 'next/link';
import React from 'react';

export default function CoverZoomCard({
  href,
  imageUrl,
  label,
  className = '',
  aspect = 'aspect-[7/3]',
}) {
  const backgroundStyle = {
    backgroundImage: imageUrl
      ? `url(${imageUrl})`
      : 'linear-gradient(to right, #f7797d, #FBD786, #C6FFDD)',
  };

  return (
    <Link href={href}>
      <div className={`group/card cursor-pointer ${className}`}>
        <div className={`w-full ${aspect} relative overflow-hidden`}>
          {/* Background layer (cover + zoom on hover) */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-800 ease-out will-change-transform group-hover/card:scale-120"
            style={backgroundStyle}
          />

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-colors duration-200 group-hover/card:bg-stone-900/30">
            <h1 className="font-bold p-2 bg-white transition-transform transition-colors duration-150 ease-out group-hover/card:text-stone-900 group-hover/card:scale-115">
              {label}
            </h1>
          </div>
        </div>
      </div>
    </Link>
  );
}
