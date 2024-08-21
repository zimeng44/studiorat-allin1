import Image from "next/image";
import { geLocalMedia, getStrapiMedia } from "@/lib/utils";

interface StrapiImageProps {
  src: string;
  alt?: string;
  height?: number;
  width?: number;
  className?: string;
}

export function StrapiImage({
  src,
  alt,
  height,
  width,
  className,
}: Readonly<StrapiImageProps>) {
  if (!src) return null;
  const imageUrl = geLocalMedia(src);
  const imageFallback = `https://placehold.co/${width}x${height}`;

  return (
    <Image
      src={imageUrl ?? imageFallback}
      alt={alt ?? "user image"}
      height={height ?? 50}
      width={width ?? 50}
      className={className}
    />
  );
}
