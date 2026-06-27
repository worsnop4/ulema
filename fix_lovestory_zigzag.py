import sys

with open('src/themes/MinangElegantTheme.jsx', 'r') as f:
    content = f.read()

start_idx = content.find('// ─── 6. LOVE STORY')
end_idx = content.find('// ─── 7. GALLERY')

if start_idx == -1 or end_idx == -1:
    print("Could not find section markers")
    sys.exit(1)

new_section = """// ─── 6. LOVE STORY ───────────────────────────────────────────────
const LoveStorySection = ({ data }) => {
  const stories = data?.loveStory || []
  if (!stories.length) return null
  return (
    <section className="w-full py-6 px-4">
      <Glass className="p-8">
        <p className="text-center text-xs tracking-[0.4em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Kisah Kami
        </p>
        <h2 className="mb-12 text-center" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2.2rem', color: c.maroon, fontWeight: 400, fontStyle: 'italic' }}>
          Love Story
        </h2>
        <div className="relative w-full flex flex-col">
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2"
            style={{ background: `linear-gradient(to bottom, transparent, ${c.gold}60, transparent)` }} />
          {stories.map((s, i) => {
            const isL = i % 2 === 0
            return (
              <motion.div key={s.id || i}
                className={`flex w-full items-center justify-between mb-12 relative ${isL ? 'flex-row' : 'flex-row-reverse'}`}
                initial={{ opacity: 0, x: isL ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7 }}>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 bg-white"
                  style={{ borderColor: c.maroon, zIndex: 10 }} />
                <div className="w-5/12 flex justify-center">
                  {s.photo
                    ? <div className="w-24 h-24 rounded-full overflow-hidden border-2 shadow-md" style={{ borderColor: c.gold + '80' }}>
                        <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
                      </div>
                    : <div className="w-16 h-16 rounded-full border flex items-center justify-center" style={{ borderColor: c.gold + '60', background: 'rgba(255,255,255,0.5)' }}>
                        <Heart size={16} color={c.maroon} />
                      </div>}
                </div>
                <div className={`w-5/12 flex flex-col ${isL ? 'text-left' : 'text-right'}`}>
                  <span className="text-xs font-sans mb-1 opacity-60 tracking-widest" style={{ color: c.gold }}>
                    {fmtLSDate(s.date || s.year)}
                  </span>
                  <h4 className="font-semibold text-[15px] mb-1.5 font-sans leading-tight" style={{ color: c.maroon }}>
                    {s.title}
                  </h4>
                  <p className="text-[13px] opacity-80 leading-relaxed font-sans" style={{ color: c.text }}>
                    {s.story}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Glass>
    </section>
  )
}

"""

content = content[:start_idx] + new_section + content[end_idx:]

with open('src/themes/MinangElegantTheme.jsx', 'w') as f:
    f.write(content)

print("LoveStorySection zigzag applied!")
