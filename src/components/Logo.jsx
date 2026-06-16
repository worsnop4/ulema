export default function Logo({ className = "h-8", ...props }) {
  return (
    <img 
      src="/logo-ulema.svg" 
      alt="Ulema Logo" 
      className={className} 
      {...props}
    />
  )
}
