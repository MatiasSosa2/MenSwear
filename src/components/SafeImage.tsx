"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

// Un contenedor seguro para Next/Image que cae a un placeholder local si falla la carga (404/timeout)
export default function SafeImage(
  props: ImageProps & { fallbackSrc?: string }
) {
  const { src, alt, fallbackSrc = "/placeholder.svg", onError, ...rest } = props;
  const [errored, setErrored] = useState(false);

  return (
    <Image
      {...rest}
      src={errored ? fallbackSrc : src}
      alt={alt}
      onError={(e) => {
        setErrored(true);
        if (onError) onError(e);
      }}
    />
  );
}
