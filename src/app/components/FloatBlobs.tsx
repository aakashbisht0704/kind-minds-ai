"use client";

// ...existing code...

interface FloatBlobsProps {
  top?: number;
  left?: number;
  rotate?: number;
}

export function FloatBlobs({ top, left, rotate, }: FloatBlobsProps) {
  const gradients = [
    "bg-gradient-to-r from-[#6C63FF] to-[#F28AB2]",
    "bg-gradient-to-r from-[#F28AB2] to-[#6C63FF]",
    "bg-gradient-to-r from-[#6C63FF] to-[#F28AB2]",
  ];

  return (
    <div >
      <div className={`absolute inset-0 -z-10 overflow-hidden `}>
        <div
          className={`absolute w-72 h-44 rounded-[50%] ${gradients[0]} opacity-10`}
          style={{
            top: `${top ?? 15}%`,
            left: `${left ?? 41}%`,
            rotate: rotate ? `${rotate}deg` : undefined,
            zIndex: -1,
          }}
        />
        <div
          className={`absolute w-72 h-44 rounded-[50%] ${gradients[1]} opacity-10`}
          style={{
            top: `${(top ?? 15) + 1.5}%`,
            left: `${(left ?? 41) + 1.5}%`,
            rotate: rotate ? `${rotate}deg` : undefined,
            zIndex: -1,
          }}
        />
        <div
          className={`absolute w-72 h-44 rounded-[50%] ${gradients[2]} opacity-10`}
          style={{
            top: `${(top ?? 15) - 1.5}%`,
            left: `${(left ?? 41) - 1.5}%`,
            rotate: rotate ? `${rotate}deg` : undefined,
            zIndex: -1,
          }}
        />
      </div>
    </div>
  );
}
