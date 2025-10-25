export default function Template({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Page content with smooth transition */}
      <div className="page-transition">
        {children}
      </div>
    </div>
  )
}