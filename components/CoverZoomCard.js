// components/CoverZoomCard.jsx
import Link from 'next/link';
import React from 'react';
import { BGGrads } from './ContextBar';

export default function CoverZoomCard({ href, imageUrl, label, className = '', aspect = 'aspect-[7/3]' }) {
  return (
    <Link href={href}>
      <div className={`group/card cursor-pointer rounded-xl overflow-hidden border border-stone-300 hover:shadow-sm transition-all duration-300 ${className}`}>
        <div className={`w-full ${aspect} relative overflow-hidden`}>
          {/* Background layer (cover + zoom on hover) */}
          {imageUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-800 ease-out will-change-transform group-hover/card:scale-120"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          ) : (
            <BGGrads ammount={1000} opacity={1} />
          )}

          {/* Overlay content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-bold p-2 bg-white rounded-md transition-transform transition-colors duration-150 ease-out group-hover/card:text-stone-900 group-hover/card:scale-115">
              {label}
            </h1>
          </div>
        </div>
      </div>
    </Link>
  );
}
