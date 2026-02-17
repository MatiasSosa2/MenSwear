"use client";

export default function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const hasImages = Array.isArray(images) && images.length > 0;
  const main = hasImages ? images[0] : null;
  const thumbs = hasImages ? images.slice(0, 4) : [];

  return (
    <div className="grid grid-cols-1 items-start gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-foreground/[0.03] shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
        {main ? (
          <img src={main} alt={title} className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-foreground/60">Imágenes no disponibles</span>
          </div>
        )}
      </div>

      {thumbs.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {thumbs.map((t, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded bg-foreground/[0.04]">
              <img src={t} alt={`${title} ${i + 1}`} className="absolute inset-0 h-full w-full object-contain" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
