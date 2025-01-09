import Image from "next/image";
import { geLocalMedia } from "@/lib/utils";

interface StrapiImageProps {
  src: string | null;
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
      alt={alt ?? "studio rat image"}
      height={height ?? 100}
      width={width ?? 100}
      className={className}
    />
  );
}
