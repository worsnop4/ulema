import sys

with open('src/themes/MinangElegantTheme.jsx', 'r') as f:
    content = f.read()

with open('combined_sections.js', 'r') as f:
    sections = f.read()

# Replace MotionVideoBg definition
old_motion = """// ─── VIDEO BG MOTION (fixed behind all content) ──────────────────
const MotionVideoBg = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <video autoPlay muted loop playsInline poster={A.mobileBg}
      className="w-full h-full object-cover"
      onError={e => {
        e.target.parentElement.style.backgroundImage = `url('${A.mobileBg}')`
        e.target.parentElement.style.backgroundSize = 'cover'
        e.target.style.display = 'none'
      }}>
      <source src={A.bgVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: 'rgba(253,246,238,0.18)' }} />
  </div>
)"""

new_motion = sections + """
// ─── VIDEO BG MOTION (fixed behind all content) ──────────────────
const MotionVideoBg = () => (
  <div className="fixed inset-0 z-0 pointer-events-none">
    <video autoPlay muted loop playsInline poster={A.mobileBg}
      className="w-full h-full object-cover"
      onError={e => {
        e.target.parentElement.style.backgroundImage = `url('${A.mobileBg}')`
        e.target.parentElement.style.backgroundSize = 'cover'
        e.target.style.display = 'none'
      }}>
      <source src={A.bgVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0" style={{ background: 'rgba(253,246,238,0.18)' }} />
    <LightParticles />
  </div>
)"""

if old_motion in content:
    content = content.replace(old_motion, new_motion)
else:
    print("Could not find old MotionVideoBg")
    sys.exit(1)

# Add to render block
old_render = """            <div className="relative flex flex-col gap-5 pt-8 pb-6" style={{ zIndex: 2 }}>
              <ProfileSection data={data} />
              <CountdownSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
              <EventsSection akad={akad} baralek={baralek} />
              <LoveStorySection data={data} />
              <GallerySection data={data} />
              <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
              <FooterSection bride={bride} groom={groom} />
            </div>"""

new_render = """            <div className="relative flex flex-col gap-5 pt-8 pb-6" style={{ zIndex: 2 }}>
              <QuoteSection data={data} />
              <ProfileSection data={data} />
              <CountdownSection countdown={countdown} primaryEvent={primary} bride={bride} groom={groom} />
              <EventsSection akad={akad} baralek={baralek} />
              <DresscodeSection data={data} />
              <LoveStorySection data={data} />
              <GallerySection data={data} />
              <GiftSection data={data} />
              <WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />
              <TurutMengundangSection data={data} />
              <FooterSection bride={bride} groom={groom} />
            </div>"""

if old_render in content:
    content = content.replace(old_render, new_render)
else:
    print("Could not find old render block")
    sys.exit(1)

with open('src/themes/MinangElegantTheme.jsx', 'w') as f:
    f.write(content)

print("Injected successfully")
