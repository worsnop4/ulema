import React, { useEffect, useState } from 'react'

export default function FallingLeaves({ imageSrc }) {
  const [leaves, setLeaves] = useState([])

  useEffect(() => {
    // Generate 15 leaf instances with random properties
    const leafCount = 15
    const generatedLeaves = Array.from({ length: leafCount }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${6 + Math.random() * 8}s`,
      size: `${12 + Math.random() * 16}px`, // between 12px and 28px
      swayX: `${Math.random() * 120 - 60}px`,
      rotateStart: `${Math.random() * 360}deg`,
      rotateEnd: `${Math.random() * 720 + 360}deg`,
      opacity: 0.3 + Math.random() * 0.4, // between 0.3 and 0.7
    }))
    setLeaves(generatedLeaves)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[30]">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes leaf-fall {
          0% {
            top: -5%;
            opacity: 0;
            transform: translate3d(0, 0, 0) rotate(var(--rot-start));
          }
          10% {
            opacity: var(--op);
          }
          90% {
            opacity: var(--op);
          }
          100% {
            top: 105%;
            opacity: 0;
            transform: translate3d(var(--sway), 0, 0) rotate(var(--rot-end));
          }
        }
        .falling-leaf-item {
          position: absolute;
          animation-name: leaf-fall;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
      ` }} />
      {leaves.map((leaf) => (
        <img
          key={leaf.id}
          src={imageSrc || "/images/ornaments/special-leaf.png"}
          className="falling-leaf-item"
          alt=""
          style={{
            left: leaf.left,
            width: leaf.size,
            height: leaf.size,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            '--sway': leaf.swayX,
            '--rot-start': leaf.rotateStart,
            '--rot-end': leaf.rotateEnd,
            '--op': leaf.opacity,
            opacity: 0, // start hidden until animation begins
          }}
        />
      ))}
    </div>
  )
}
