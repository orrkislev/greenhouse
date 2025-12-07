import React, { useMemo, useRef, useState, useEffect } from 'react';

const GooeySlider = ({
  min,
  max,
  value,
  onChange,
  labelLeft = "Low",
  labelRight = "High",
  midValues = [],
  color = "#B47C10",
}) => {
  const containerRef = useRef(null);

  // Visual state for the inertia effect: main handle and the trailing "tail"
  const [visualState, setVisualState] = useState({ main: value, trail: value });
  const targetValueRef = useRef(value);

  // Sync ref with prop
  useEffect(() => {
    targetValueRef.current = value;
  }, [value]);

  // Animation Loop for "Mass" and "Stretch" effects
  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      setVisualState((prev) => {
        const target = targetValueRef.current;

        // 1. Main Handle Physics
        const diffMain = target - prev.main;
        let newMain = prev.main;

        // Snap if close enough to stop micro-jitters
        if (Math.abs(diffMain) < 0.01) {
          newMain = target;
        } else {
          newMain = prev.main + diffMain * 0.2; // Slightly faster for smaller feel
        }

        // 2. Trail Physics
        const diffTrail = newMain - prev.trail;
        let newTrail = prev.trail;

        if (Math.abs(diffTrail) < 0.01 && newMain === target) {
          newTrail = newMain;
        } else {
          newTrail = prev.trail + diffTrail * 0.18;
        }

        // Stop updates if everything is settled
        if (newMain === target && newTrail === target) {
          return { main: target, trail: target };
        }

        return { main: newMain, trail: newTrail };
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Calculate percentages for positioning
  const getPercentage = (val) => Math.min(Math.max((val - min) / (max - min), 0), 1);

  const visualPercentage = getPercentage(visualState.main);
  const trailPercentage = getPercentage(visualState.trail);

  // Refined / Thinner Visual Configuration
  const trackHeight = 4;        // Was 6 or 12
  const thumbRadius = 16;       // Was 15 or 24
  const trailRadius = 8;        // Was 10 or 18
  const holeRadius = 6;         // Was 5 or 10

  const filterId = useMemo(() => `goo-filter-${Math.random().toString(36).substr(2, 9)}`, []);

  const handleChange = (e) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="w-full flex items-start justify-center gap-4 select-none relative font-sans">
      {/* Left Label */}
      <div className="flex-1 text-slate-600 font-medium text-sm tracking-wide min-w-[2rem] text-left ">
        {labelLeft}
      </div>

      <div className="flex-1 flex h-12 flex-col justify-center mx-2">
        {/* Slider Container */}
        <div
          ref={containerRef}
          className="relative h-12 flex items-center mx-2 mt-1"
          style={{ touchAction: 'none' }}
        >
          {/* The SVG Layer for Gooey Effect */}
          <svg
            width="100%"
            height="100%"
            className="overflow-visible absolute inset-0 pointer-events-none"
          >
            <defs>
              <filter id={filterId}>
                {/* Tighter blur for smaller elements */}
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 40 -10"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </defs>

            <rect
              x="0"
              y={`calc(50% - ${(trackHeight + 4) / 2}px)`}
              width="100%"
              height={trackHeight + 4}
              rx={(trackHeight + 4) / 2}
              fill={color}
            />

            {/* Gooey Group: Active Track + Handle + Trail */}
            <g filter={`url(#${filterId})`}>
              {/* Active Track Portion */}
              <rect
                x="0"
                y={`calc(50% - ${trackHeight / 2}px)`}
                width="100%"
                height={trackHeight}
                rx={trackHeight / 2}
                fill={color}
              />

              {/* Trail Blob (Follows main handle) */}
              <circle
                cx={`${100 - trailPercentage * 100}%`}
                cy="50%"
                r={trailRadius}
                fill={color}
              />

              {/* Main Handle Blob */}
              <circle
                cx={`${100 - visualPercentage * 100}%`}
                cy="50%"
                r={thumbRadius}
                fill={color}
              />
            </g>

            {/* Crisp Overlay Elements (No Goo) */}
            <circle
              cx={`${100 - visualPercentage * 100}%`}
              cy="50%"
              r={holeRadius}
              fill="white"
              style={{ pointerEvents: 'none' }}
            />
          </svg>

          {/* Invisible Range Input for Interaction */}
          <input type="range" min={min} max={max}
            value={value}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        <div className="flex items-center justify-between gap-2 w-full mt-4">
          {midValues.map((value, index) => (
            <span key={index} className="text-slate-400 font-medium text-xs tracking-wide min-w-[2rem]">
              {value}
            </span>
          ))}
        </div>
      </div>

      {/* Right Label */}
      <div className="flex-1 text-slate-600 font-medium text-sm tracking-wide min-w-[2rem] text-right">
        {labelRight}
      </div>

    </div>
  );
};

export default GooeySlider;
