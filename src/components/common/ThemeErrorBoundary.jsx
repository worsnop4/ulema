import React from 'react'

export class ThemeErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ThemeErrorBoundary] Failed to load theme:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-6 font-sans text-center">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-zinc-200 mb-3 tracking-wide">
              Momen Spesial Sedang Disiapkan
            </h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              Tampaknya koneksi terputus saat memuat tema undangan ini. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-zinc-200 text-zinc-900 font-medium py-3 px-6 rounded-full hover:bg-white transition-colors duration-300"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
