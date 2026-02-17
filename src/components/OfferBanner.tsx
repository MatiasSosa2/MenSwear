import Link from 'next/link'

type BannerVariant = 'navy' | 'red' | 'black'

interface OfferBannerProps {
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  variant?: BannerVariant
  small?: boolean
}

const variantClasses = {
  navy: 'from-[#0A1F44] via-[#0d2856] to-[#0A1F44]',
  red: 'from-[#C41E3A] via-[#d4243f] to-[#C41E3A]',
  black: 'from-gray-900 via-black to-gray-900'
}

export default function OfferBanner({
  title,
  subtitle,
  ctaText,
  ctaLink,
  variant = 'navy',
  small = false
}: OfferBannerProps) {
  const gradientClass = variantClasses[variant]
  
  return (
    <Link 
      href={ctaLink}
      className="group block overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className={`
        relative bg-gradient-to-r ${gradientClass} text-white
        ${small ? 'px-4 sm:px-6 md:px-8 py-6 sm:py-8' : 'px-6 sm:px-10 md:px-16 py-10 sm:py-14 md:py-20'}
        transition-all duration-300
      `}>
        {/* Overlay brillante */}
        <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-all duration-300" />
        
        {/* Contenido */}
        <div className="relative z-10 max-w-4xl">
          <h2 className={`
            font-black tracking-tight leading-tight
            ${small ? 'text-lg sm:text-xl md:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'}
            drop-shadow-md
          `}>
            {title}
          </h2>
          
          <p className={`
            mt-2 sm:mt-3 font-medium opacity-95
            ${small ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'}
            drop-shadow
          `}>
            {subtitle}
          </p>
          
          <div className={`
            inline-flex items-center gap-2 mt-4 sm:mt-6
            ${small ? 'text-xs sm:text-sm' : 'text-sm sm:text-base md:text-lg'}
            font-bold px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm
            rounded-full border border-white/30
            group-hover:bg-white/30 group-hover:scale-105 
            transition-all duration-300
            shadow-md
          `}>
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
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 sm:w-48 sm:h-48 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-40 h-40 sm:w-64 sm:h-64 bg-white rounded-full blur-3xl" />
        </div>
      </div>
    </Link>
  )
}
