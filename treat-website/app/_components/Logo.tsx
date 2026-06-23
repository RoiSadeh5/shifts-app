export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* 3 bars — large to small */}
      <div className="flex flex-col gap-[5px] justify-center">
        <div className="h-[3px] w-[22px] rounded-full bg-[#6366F1]" />
        <div className="h-[3px] w-[15px] rounded-full bg-[#6366F1]" />
        <div className="h-[3px] w-[9px] rounded-full bg-[#6366F1]" />
      </div>
      <span
        className="text-[17px] font-semibold tracking-tight text-[#F8F8FC]"
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        treat
      </span>
    </div>
  );
}
