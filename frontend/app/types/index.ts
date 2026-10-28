// Tipos que reflejan las respuestas de la API Laravel (final-api)

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug?: string;
  description: string | null;
  price: string; // Laravel devuelve los decimales como string
  stock: number;
  min_stock_alert?: number;
  unit?: 'unit' | 'lb' | 'kg' | 'pack' | string;
  image_url?: string | null;
  is_featured?: boolean;
  category?: Category | null;
  brand?: Brand | null;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product?: Product;
}

// El pago ya no es una tabla: la API lo arma a partir de payment_method / payment_id de la orden
export interface Payment {
  stripe_payment_intent_id: string | null;
  status: string;
  payment_method: string | null;
}

export type OrderStatus = 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: number;
  user_id: number;
  subtotal?: string;
  delivery_fee?: string;
  discount_amount?: string;
  total: string;
  status: OrderStatus;
  items: OrderItem[];
  payment?: Payment | null;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  type_token: string;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}

// Forma del error que devuelve Laravel (validacion 422 o mensaje simple)
export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}