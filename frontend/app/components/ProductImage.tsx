'use client';

import Image, { type ImageLoaderProps } from 'next/image';
import type { Product } from '@/app/types';
import { getProductImage, isUnsplashImage } from '@/app/lib/product-images';

interface ProductImageProps {
  product: Product;
  sizes: string;
  className?: string;
  preload?: boolean;
  eager?: boolean;
}

// El CDN de Unsplash (imgix) redimensiona y convierte el formato por URL,
// así el navegador descarga directo el tamaño justo sin pasar por el servidor de Next
function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  return `${src}?w=${width}&q=${quality ?? 75}&auto=format&fit=crop`;
}

// Imagen cuadrada del producto; el contenedor padre define el tamaño
export default function ProductImage({ product, sizes, className = '', preload = false, eager = false }: ProductImageProps) {
  const src = getProductImage(product);
  const fromUnsplash = src ? isUnsplashImage(src) : false;

  return (
    <div className={`relative overflow-hidden bg-brand-50 ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={product.name}
          fill
          sizes={sizes}
          preload={preload}
          loading={preload ? undefined : eager ? 'eager' : 'lazy'}
          loader={fromUnsplash ? unsplashLoader : undefined}
          unoptimized={!fromUnsplash}
          className="object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-4xl font-bold text-brand-600/40">
          {product.name.charAt(0)}
        </div>
      )}
    </div>
  );
}
