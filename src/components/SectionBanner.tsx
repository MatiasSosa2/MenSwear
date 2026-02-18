import Link from 'next/link'

interface SectionBannerProps {
  title: string
  description: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
  textAlign?: 'left' | 'center' | 'right'
  darkOverlay?: boolean
}

export default function SectionBanner({
  title,
  description,
  ctaText,
  ctaLink,
  backgroundImage,
  textAlign = 'left',
  darkOverlay = true
}: SectionBannerProps) {
  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  }
  
  return (
    <Link 
      href={ctaLink}
      className="group block overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className="relative h-[250px] sm:h-[300px] md:h-[350px] w-full">
        {/* Imagen de fondo */}
        <img 
          src={backgroundImage} 
          alt={title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Overlay */}
        {darkOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 group-hover:bg-black/40 transition-all duration-300" />
        )}
        
        {/* Contenido */}
        <div className={`relative h-full flex flex-col justify-center px-6 sm:px-8 md:px-10 ${alignmentClasses[textAlign]}`}>
          <div className="max-w-lg">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg uppercase tracking-wide">
              {title}
            </h3>
            
            <p className="text-xs sm:text-sm md:text-base text-white/90 mb-4 sm:mb-5 drop-shadow">
              {description}
            </p>
            
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-full group-hover:bg-white group-hover:text-black transition-all duration-300">
              {ctaText}
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
