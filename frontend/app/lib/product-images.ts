import type { Product } from '@/app/types';

const UNSPLASH_HOST = 'https://images.unsplash.com/';

// Fotos de Unsplash elegidas buscando cada producto (por slug).
// La API todavía no trae image_url, así que el frontend las resuelve aquí.
const PRODUCT_PHOTOS: Record<string, string> = {
  'aceite-vegetal-750ml': 'photo-1552592074-ea7a91b851b3',
  'agua-purificada-5-galones': 'photo-1783309529184-75986d6e472a',
  'aguacate-hass': 'photo-1519162808019-7de1683fa2ad',
  'arroz-blanco-1kg': 'photo-1536304993881-ff6e9eefa2a6',
  'avena-hojuelas-500g': 'photo-1790676725483-6226cb102a84',
  'azucar-morena-1kg': 'photo-1634612831148-03a8550e1d52',
  'bolsas-basura-negras-30gal': 'photo-1686795517754-2bd8a2d08cec',
  'nescafe-clasico-100g': 'photo-1614767866551-fe60a95d0d19',
  'carne-molida-especial-res': 'photo-1612078894671-f11ba41d713e',
  'carton-huevos-30': 'photo-1506976785307-8732e854ad03',
  'cebolla-morada': 'photo-1760368104753-fe0994f94ff3',
  'cepillo-colgate-zigzag-pack2': 'photo-1520013573795-38516d2661e4',
  'chuleta-cerdo-ahumada': 'photo-1611059263765-f57653f3bba3',
  'cloro-blanqueador-clorox-galon': 'photo-1584813470613-5b1c1cad3d69',
  'coca-cola-original-2-5l': 'photo-1770837776918-6f60f5fe4b35',
  'coca-cola-zero-1-5l': 'photo-1624797375978-8c2f746bdd3a',
  'consome-pollo-maggi-12': 'photo-1788141554554-206bd5510910',
  'detergente-ariel-2kg': 'photo-1582735689369-4fe89db7114c',
  'doritos-nacho-atrevido-150g': 'photo-1764025248642-6b0b403ac004',
  'frijol-rojo-seda-1lb': 'photo-1765144815957-6bc44c13fc2c',
  'galletas-oreo-pack6': 'photo-1672753261221-608b9d15d597',
  'jabon-dove-original-90g': 'photo-1781080922537-7d5338f96e95',
  'jugo-naranja-natural-1l': 'photo-1600271886742-f049cd451bba',
  'lavaplatos-axion-750ml': 'photo-1590610994353-7b0e7546e681',
  'leche-deslactosada-salud-1l': 'photo-1576186726115-4d51596775d1',
  'leche-entera-salud-1l': 'photo-1550583724-b2692b85b150',
  'mantequilla-dos-pinos-115g': 'photo-1589985270826-4b7bb135bc9d',
  'manzana-gala': 'photo-1560806887-1e4cd0b6cbd6',
  'pan-blanco-bimbo-grande': 'photo-1598373182133-52452f7691ef',
  'pan-dulce-bolsa-6': 'photo-1608198093002-ad4e005484ec',
  'pan-integral-bimbo-100': 'photo-1509440159596-0249088772ff',
  'papas-lays-clasicas-150g': 'photo-1760997707695-f0b5527e5de9',
  'papas-russet': 'photo-1518977676601-b53f82aba655',
  'papel-higienico-scott-4': 'photo-1631524254770-03abe3f42a0d',
  'pasta-colgate-total-12': 'photo-1787202742502-8c1ea05638a5',
  'pasta-spaghetti-400g': 'photo-1551892374-ecf8754cf8b0',
  'pechuga-pollo-deshuesada': 'photo-1633096013004-e2cb4023b560',
  'pepsi-black-2l': 'photo-1629203849820-fdd70d49c38e',
  'platano-maduro': 'photo-1552709607-08d00227833d',
  'posta-res-asar': 'photo-1690983330536-3b0089d07cf9',
  'queso-fresco-salvadoreno': 'photo-1683314573422-649a3c6ad784',
  'shampoo-head-and-shoulders-375ml': 'photo-1747858989102-cca0f4dc4a11',
  'tomate-ensalada': 'photo-1582284540020-8acbe03f4924',
  'tortillas-maiz-12': 'photo-1693193433392-da83457dff20',
  'yogurt-griego-fresa-dos-pinos': 'photo-1488477181946-6428a0291777',
  'zanahoria-fresca': 'photo-1598170845058-32b9d6a5da37',
};

// Respaldo por pasillo para productos nuevos que aún no tengan foto propia
const CATEGORY_PHOTOS: Record<string, string> = {
  'abarrotes-y-despensa': 'photo-1536304993881-ff6e9eefa2a6',
  'bebidas-y-jugos': 'photo-1600271886742-f049cd451bba',
  'frutas-y-verduras': 'photo-1582284540020-8acbe03f4924',
  'limpieza-y-hogar': 'photo-1584813470613-5b1c1cad3d69',
  'carniceria-y-aves': 'photo-1612078894671-f11ba41d713e',
  'lacteos-y-quesos': 'photo-1550583724-b2692b85b150',
  'cuidado-personal': 'photo-1747858989102-cca0f4dc4a11',
  'snacks-y-golosinas': 'photo-1760997707695-f0b5527e5de9',
  'panaderia-y-tortilleria': 'photo-1509440159596-0249088772ff',
};

export function getProductImage(product: Product): string | null {
  if (product.image_url) return product.image_url;

  const photo =
    (product.slug && PRODUCT_PHOTOS[product.slug]) ||
    (product.category?.slug && CATEGORY_PHOTOS[product.category.slug]);

  return photo ? `${UNSPLASH_HOST}${photo}` : null;
}

export function isUnsplashImage(src: string) {
  return src.startsWith(UNSPLASH_HOST);
}
