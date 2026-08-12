"use client";

export default function PrintButton({ label = "🖨️ چاپ معرفی‌نامه" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
    >
      {label}
    </button>
  );
}
