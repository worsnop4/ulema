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
      <Glass className="p-8 flex flex-col items-center">
        <p className="text-center text-xs tracking-[0.4em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Love Story
        </p>
        <h2 className="mb-10 text-center" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2.5rem', color: c.maroon }}>
          Kisah Kami
        </h2>
        <div className="w-full flex flex-col gap-10">
          {stories.map((s, i) => (
            <motion.div key={s.id || i}
              className="flex flex-col items-center text-center w-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              
              {s.photo ? (
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 shadow-sm" style={{ border: `2px solid ${c.gold}80` }}>
                  <img src={s.photo} alt={s.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full mb-4 flex items-center justify-center border" style={{ borderColor: c.gold + '60', background: 'rgba(255,255,255,0.5)' }}>
                  <Heart size={16} color={c.maroon} />
                </div>
              )}
              
              <span className="text-[13px] font-sans mb-1 opacity-60 tracking-widest" style={{ color: c.gold }}>
                {fmtLSDate(s.date || s.year)}
              </span>
              <h4 className="font-semibold text-[15px] mb-2 font-sans leading-tight" style={{ color: c.maroon }}>
                {s.title}
              </h4>
              <p className="text-[13px] opacity-80 leading-relaxed font-sans max-w-[260px]" style={{ color: c.text }}>
                {s.story}
              </p>
            </motion.div>
          ))}
        </div>
      </Glass>
    </section>
  )
}

"""

content = content[:start_idx] + new_section + content[end_idx:]

with open('src/themes/MinangElegantTheme.jsx', 'w') as f:
    f.write(content)

print("LoveStorySection fixed!")
