// Subtle gold ornament divider placed between landing sections so the page
// flows like a real wedding invitation. Purely decorative.
export default function GoldDivider() {
  return (
    <div className="bg-[#F4F6F5] flex items-center justify-center gap-3 py-7 sm:py-9 px-4" aria-hidden="true">
      <span className="ornament-line w-16 sm:w-28 max-w-[22%]"></span>
      <svg width="26" height="26" viewBox="0 0 40 40" fill="none" className="flex-shrink-0 opacity-80">
        <path d="M20 4 Q22 12 20 20 Q18 12 20 4Z" fill="#DDC497" />
        <path d="M20 20 Q22 28 20 36 Q18 28 20 20Z" fill="#DDC497" />
        <path d="M4 20 Q12 22 20 20 Q12 18 4 20Z" fill="#DDC497" />
        <path d="M20 20 Q28 22 36 20 Q28 18 20 20Z" fill="#DDC497" />
        <path d="M8.5 8.5 Q14 14 20 20" stroke="#C4A771" strokeWidth="1" opacity="0.6" />
        <path d="M31.5 31.5 Q26 26 20 20" stroke="#C4A771" strokeWidth="1" opacity="0.6" />
        <circle cx="20" cy="20" r="3.2" fill="#C4A771" />
        <circle cx="20" cy="20" r="1.4" fill="#fff" opacity="0.6" />
      </svg>
      <span className="ornament-line w-16 sm:w-28 max-w-[22%]"></span>
    </div>
  )
}
