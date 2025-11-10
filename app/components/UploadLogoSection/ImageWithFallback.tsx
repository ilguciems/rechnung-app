import Image from "next/image";
import { useEffect, useState } from "react";

type ImageWithFallbackProps = {
  src: string;
  alt: string;
  fallBackSrc: string;
  className?: string;
  width?: number;
  height?: number;
};

function ImageWithFallback({
  src,
  alt,
  className,
  width = 112,
  height = 112,
  fallBackSrc,
}: ImageWithFallbackProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (src) {
      setImageError(false);
    }
  }, [src]);

  return (
    <Image
      className={className}
      src={imageError ? fallBackSrc : src}
      alt={alt}
      width={width}
      height={height}
      onError={() => setImageError(true)}
      priority
    />
  );
}

export default ImageWithFallback;
