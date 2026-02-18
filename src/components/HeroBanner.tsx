import Link from 'next/link'
import Image from 'next/image'

type BannerVariant = 'navy' | 'red' | 'black' | 'dark'

interface HeroBannerProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  backgroundImage: string
  variant?: BannerVariant
  imagePosition?: 'center' | 'top' | 'bottom'
  overlayIntensity?: 'light' | 'medium' | 'heavy'
  height?: 'small' | 'medium' | 'large' | 'hero'
}

const overlayClasses = {
  light: 'from-black/30 via-black/20 to-transparent',
  medium: 'from-black/60 via-black/40 to-transparent',
  heavy: 'from-black/80 via-black/60 to-black/30'
}

const heightClasses = {
  small: 'h-[300px] sm:h-[350px]',
  medium: 'h-[400px] sm:h-[500px]',
  large: 'h-[500px] sm:h-[600px] md:h-[700px]',
  hero: 'h-[60vh] sm:h-[75vh] md:h-[85vh] lg:h-[90vh]'
}

const objectPositionClasses = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom'
}

export default function HeroBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage,
  variant = 'dark',
  imagePosition = 'center',
  overlayIntensity = 'medium',
  height = 'hero'
}: HeroBannerProps) {
  const overlayClass = overlayClasses[overlayIntensity]
  const heightClass = heightClasses[height]
  const positionClass = objectPositionClasses[imagePosition]
  
  return (
    <Link 
      href={ctaLink}
      className="group block overflow-hidden rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[3rem] shadow-2xl hover:shadow-3xl transition-all duration-500"
    >
      <div className={`relative ${heightClass} w-full`}>
        {/* Imagen de fondo */}
        {backgroundImage.startsWith('http') ? (
          <img 
            src={backgroundImage} 
            alt={title}
            className={`absolute inset-0 w-full h-full object-cover ${positionClass} group-hover:scale-105 transition-transform duration-700`}
          />
        ) : (
          <Image
            src={backgroundImage}
            alt={title}
            fill
            className={`object-cover ${positionClass} group-hover:scale-105 transition-transform duration-700`}
            priority
          />
        )}
        
        {/* Overlay oscuro para legibilidad */}
        <div className={`absolute inset-0 bg-gradient-to-r ${overlayClass} group-hover:opacity-90 transition-opacity duration-300`} />
        
        {/* Contenido de texto */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-20 max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-tight mb-3 sm:mb-4 md:mb-6 drop-shadow-2xl uppercase">
              {title}
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-[#EDE3D4] font-medium mb-6 sm:mb-8 md:mb-10 drop-shadow-lg max-w-xl">
              {subtitle}
            </p>
            
            <div className="inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base md:text-lg font-bold px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full group-hover:bg-white group-hover:text-black group-hover:scale-105 transition-all duration-300 shadow-2xl">
              {ctaText}
              <svg 
                className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Brillo sutil al hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/0 via-white/5 to-white/10" />
      </div>
    </Link>
  )
}
