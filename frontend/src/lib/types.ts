export type User = { id: string; name: string; email: string; role: "customer" | "admin" };

export type Medicine = {
  _id: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  mrp: number;
  stockQty: number;
  requiresPrescription: boolean;
  /** First entry may be https URL from auto-fetch or a local path starting with `/`. */
  images?: string[];
  company?: { _id?: string; name: string };
  category?: { _id?: string; name: string };
};

export type Offer = { _id: string; title: string; description?: string; discountPercent: number; couponCode?: string };

export type Company = { _id: string; name: string; website?: string };

export type Cart = {
  _id: string;
  items: Array<{ medicine: Medicine; qty: number; unitPrice: number }>;
  couponCode?: string;
};

export type Order = {
  _id: string;
  invoiceNo: string;
  items: Array<{ name: string; qty: number; unitPrice: number; requiresPrescription: boolean }>;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: "ONLINE" | "COD";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: string;
  createdAt: string;
};

