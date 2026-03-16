export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="poster-section min-h-[calc(100vh-4rem)] flex items-center justify-center">
      {/* Background: city panorama */}
      <div
        className="poster-bg"
        style={{ backgroundImage: "url('/images/hero-city.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="poster-overlay" style={{ background: 'rgba(10,15,20,0.82)' }} />
      {/* Subtle teal tint */}
      <div className="poster-overlay" style={{ background: 'rgba(42,139,154,0.06)' }} />

      <div className="poster-content w-full max-w-md mx-auto px-4 py-16">
        {/* Branding above card */}
        <div className="text-center mb-6">
          <span className="pixel-brand text-3xl text-white">LAGOS</span>
          <span className="pixel-brand text-2xl ml-2" style={{ color: '#008751' }}>2058</span>
          <div className="nigeria-stars pixel-brand text-lg mt-1">★★★</div>
        </div>
        {children}
      </div>
    </div>
  )
}
