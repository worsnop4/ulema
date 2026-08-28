const fs = require('fs')

let content = fs.readFileSync('src/themes/MinangElegantTheme.jsx', 'utf8')

// 1. Move colors and format functions outside
const utils = `
// Palet Warna Minang
const colors = {
  bg: '#1a0f0a',
  text: '#f5ead0',
  accent: '#c0872a',
  secondary: '#8b1a1a',
}

const formatCoverDate = (dateStr) => {
  if (!dateStr) return 'Sabtu, 28 Desember 2027'
  try {
    const d = new Date(dateStr)
    const days = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return \`\${days[d.getDay()]}, \${d.getDate()} \${months[d.getMonth()]} \${d.getFullYear()}\`
  } catch {
    return dateStr
  }
}

const formatEventDate = (dateStr) => {
  if (!dateStr) return { day: '28', monthYear: 'Desember 2027' }
  try {
    const d = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return { 
      day: d.getDate().toString().padStart(2, '0'), 
      monthYear: \`\${months[d.getMonth()]} \${d.getFullYear()}\`
    }
  } catch {
    return { day: '28', monthYear: 'Desember 2027' }
  }
}

const formatLoveStoryDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return \`\${d.getDate().toString().padStart(2, '0')} \${months[d.getMonth()]} \${d.getFullYear()}\`
  } catch {
    return dateStr
  }
}
`

// Inject utils right before export default function MinangElegantTheme
content = content.replace('export default function MinangElegantTheme', utils + '\nexport default function MinangElegantTheme')

// 2. We need to replace component declarations
// const CoverSection = () => (
// becomes:
// const CoverSection = ({ bride, groom, primaryEvent, handleOpen, animateClose }) => (
content = content.replace('const CoverSection = () => (', 'const CoverSection = ({ bride, groom, primaryEvent, handleOpen, animateClose }) => (')

// const ProfileSection = () => {
content = content.replace('const ProfileSection = () => {', 'const ProfileSection = ({ data }) => {')

// const CountdownSection = () => {
content = content.replace('const CountdownSection = () => {', 'const CountdownSection = ({ countdown, primaryEvent, groom, bride }) => {')

// const EventsSection = () => {
content = content.replace('const EventsSection = () => {', 'const EventsSection = ({ akadEvent, baralekEvent }) => {')

// const LoveStorySection = () => {
content = content.replace('const LoveStorySection = () => {', 'const LoveStorySection = ({ data }) => {')

// const GallerySection = () => {
content = content.replace('const GallerySection = () => {', 'const GallerySection = ({ data }) => {')

// const WishRsvpSection = () => {
content = content.replace('const WishRsvpSection = () => {', 'const WishRsvpSection = ({ data, wishes, onSubmitWish }) => {')

// const FooterSection = () => (
content = content.replace('const FooterSection = () => (', 'const FooterSection = ({ bride, groom }) => (')


// 3. Move them OUTSIDE MinangElegantTheme
// They currently end before "return (" of MinangElegantTheme
// We can find all text from "// --- KOMPONEN: COVER ---" up to "return (" and move it before "export default function MinangElegantTheme"
const componentsStartIdx = content.indexOf('  // --- KOMPONEN: COVER ---')
const componentsEndIdx = content.lastIndexOf('  return (\n    <InvitationLayout')

if (componentsStartIdx !== -1 && componentsEndIdx !== -1) {
  const componentsStr = content.slice(componentsStartIdx, componentsEndIdx)
  
  // Remove components from inside MinangElegantTheme
  content = content.slice(0, componentsStartIdx) + content.slice(componentsEndIdx)
  
  // Also remove the format functions and colors from inside MinangElegantTheme since we moved them out
  content = content.replace(/\/\/ Palet Warna Minang[\s\S]*?(?=const handleOpen =)/, '')

  // Insert components OUTSIDE
  content = content.replace('export default function MinangElegantTheme', componentsStr + '\n\nexport default function MinangElegantTheme')
}

// 4. Pass props to components inside MinangElegantTheme
content = content.replace('<CoverSection key="cover" />', '<CoverSection key="cover" bride={bride} groom={groom} primaryEvent={primaryEvent} handleOpen={handleOpen} animateClose={animateClose} />')
content = content.replace('<ProfileSection />', '<ProfileSection data={data} />')
content = content.replace('<CountdownSection />', '<CountdownSection countdown={countdown} primaryEvent={primaryEvent} groom={groom} bride={bride} />')
content = content.replace('<EventsSection />', '<EventsSection akadEvent={akadEvent} baralekEvent={baralekEvent} />')
content = content.replace('<LoveStorySection />', '<LoveStorySection data={data} />')
content = content.replace('<GallerySection />', '<GallerySection data={data} />')
content = content.replace('<WishRsvpSection />', '<WishRsvpSection data={data} wishes={wishes} onSubmitWish={onSubmitWish} />')
content = content.replace('<FooterSection />', '<FooterSection bride={bride} groom={groom} />')

fs.writeFileSync('src/themes/MinangElegantTheme.jsx', content)
console.log('Rewrite done!')
