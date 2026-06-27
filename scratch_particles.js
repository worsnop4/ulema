const LightParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
    {[...Array(15)].map((_, i) => {
      const size = Math.random() * 4 + 2
      const top = Math.random() * 100
      const left = Math.random() * 100
      const delay = Math.random() * 5
      const duration = Math.random() * 3 + 2
      return (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: size, height: size, top: `${top}%`, left: `${left}%`, backgroundColor: c.cream, boxShadow: `0 0 ${size*3}px ${c.gold}` }}
          animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
        />
      )
    })}
  </div>
)
