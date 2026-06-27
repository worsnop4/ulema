// ─── QUOTE SECTION ───────────────────────────────────────────────
const QuoteSection = ({ data }) => {
  if (!data?.quote) return null
  return (
    <section className="px-6 relative z-10">
      <Glass className="p-10 text-center flex flex-col items-center">
        <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <img src={A.m4} alt="ornament" className="w-12 h-12 object-contain mb-6 opacity-60" />
        </motion.div>
        <p className="text-[11px] leading-relaxed font-sans opacity-80 italic" style={{ color: c.text }}>
          "{data.quote}"
        </p>
      </Glass>
    </section>
  )
}

// ─── DRESSCODE SECTION ───────────────────────────────────────────
const DresscodeSection = ({ data }) => {
  if (!data?.dresscode?.name) return null
  return (
    <section className="px-6 relative z-10">
      <Glass className="p-10 text-center flex flex-col items-center">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-4 font-sans opacity-60" style={{ color: c.text }}>
          Dress Code
        </p>
        <div className="w-12 h-12 rounded-full mb-4 shadow-sm border border-white/40" style={{ background: data.dresscode.color || c.maroon }} />
        <h3 className="mb-2" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '1.6rem', color: c.maroon }}>
          {data.dresscode.name}
        </h3>
        <p className="text-[10px] leading-relaxed font-sans opacity-70" style={{ color: c.text }}>
          {data.dresscode.notes}
        </p>
      </Glass>
    </section>
  )
}

// ─── GIFT SECTION ────────────────────────────────────────────────
const GiftSection = ({ data }) => {
  const [showGifts, setShowGifts] = useState(false)
  const [copied, setCopied] = useState(null)
  
  if (!data?.accounts || data.accounts.length === 0) return null

  const copyAccount = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <section className="px-6 relative z-10">
      <Glass className="p-8 flex flex-col items-center">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-sans opacity-60 text-center" style={{ color: c.text }}>
          Wedding Gift
        </p>
        <h2 className="mb-6 text-center" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2.5rem', color: c.maroon }}>
          Kirim Hadiah
        </h2>
        <p className="text-[10px] leading-relaxed font-sans opacity-70 text-center max-w-[240px] mb-8" style={{ color: c.text }}>
          {data.giftAddress?.enabled
            ? 'Bagi yang ingin memberikan hadiah, berikut informasi rekening & alamat pengiriman kami.'
            : 'Bagi yang ingin memberikan hadiah, berikut informasi rekening kami.'}
        </p>
        
        <button onClick={() => setShowGifts(!showGifts)}
          className="px-6 py-2 text-[10px] tracking-[0.2em] uppercase font-sans font-semibold rounded-full border mb-4 transition-all"
          style={{ borderColor: c.maroon, color: showGifts ? '#fff' : c.maroon, backgroundColor: showGifts ? c.maroon : 'transparent' }}>
          {showGifts ? 'Tutup Detail' : 'Lihat Detail'}
        </button>

        <AnimatePresence>
          {showGifts && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full flex flex-col gap-4 mt-4 overflow-hidden">
              {data.accounts.map((acc, i) => (
                <div key={i} className="p-5 rounded-2xl border flex flex-col items-center text-center relative" style={{ borderColor: `${c.gold}40`, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: c.maroon }}>{acc.bank}</p>
                  <p className="text-[10px] opacity-70 mb-3" style={{ color: c.text }}>{acc.holder}</p>
                  <p className="text-[14px] font-mono tracking-widest font-semibold mb-4" style={{ color: c.text }}>{acc.number}</p>
                  <button onClick={() => copyAccount(acc.number, i)}
                    className="px-5 py-1.5 text-[9px] uppercase tracking-wider font-semibold rounded-full border transition-all"
                    style={{ borderColor: copied === i ? c.maroon : c.gold, backgroundColor: copied === i ? c.maroon : 'transparent', color: copied === i ? '#fff' : c.maroon }}>
                    {copied === i ? 'Tersalin!' : 'Salin Rekening'}
                  </button>
                </div>
              ))}

              {data.giftAddress?.enabled && (
                <div className="p-5 rounded-2xl border flex flex-col items-center text-center relative mt-2" style={{ borderColor: `${c.gold}40`, backgroundColor: 'rgba(255,255,255,0.3)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: c.maroon }}>Alamat Pengiriman</p>
                  <p className="text-[10px] opacity-80 mb-1" style={{ color: c.text }}>Penerima: {data.giftAddress.recipient}</p>
                  {data.giftAddress.phone && <p className="text-[10px] opacity-60 mb-2" style={{ color: c.text }}>No. HP: {data.giftAddress.phone}</p>}
                  <p className="text-[10px] opacity-70 mb-4 whitespace-pre-line leading-relaxed" style={{ color: c.text }}>{data.giftAddress.address}</p>
                  <button onClick={() => copyAccount(data.giftAddress.address, 'address')}
                    className="px-5 py-1.5 text-[9px] uppercase tracking-wider font-semibold rounded-full border transition-all"
                    style={{ borderColor: copied === 'address' ? c.maroon : c.gold, backgroundColor: copied === 'address' ? c.maroon : 'transparent', color: copied === 'address' ? '#fff' : c.maroon }}>
                    {copied === 'address' ? 'Tersalin!' : 'Salin Alamat'}
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Glass>
    </section>
  )
}

// ─── TURUT MENGUNDANG SECTION ────────────────────────────────────
const TurutMengundangSection = ({ data }) => {
  if (!data?.turutMengundangEnabled || !data?.families || !data.families.some(f => f.members.some(m => m.trim() !== ''))) return null
  return (
    <section className="px-6 relative z-10">
      <Glass className="p-10 text-center flex flex-col items-center">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-2 font-sans opacity-60" style={{ color: c.text }}>
          Turut Mengundang
        </p>
        <h2 className="mb-8" style={{ fontFamily: 'Cormorant Infant, serif', fontSize: '2.5rem', color: c.maroon }}>
          Keluarga Besar
        </h2>
        <div className="w-full flex flex-col gap-6">
          {data.families.map((fam, i) => {
            const validMembers = fam.members.filter(m => m.trim() !== '')
            if (validMembers.length === 0) return null
            return (
              <div key={i} className="flex flex-col items-center">
                {fam.title && <h3 className="text-[11px] font-bold tracking-widest uppercase mb-3 opacity-80" style={{ color: c.maroon }}>{fam.title}</h3>}
                <div className="flex flex-col gap-1.5">
                  {validMembers.map((m, j) => (
                    <p key={j} className="text-[11px] font-sans opacity-75 leading-relaxed" style={{ color: c.text }}>{m}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Glass>
    </section>
  )
}
