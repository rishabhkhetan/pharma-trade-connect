// frontend-angular/src/app/services/cart.service.ts
import { Injectable } from '@angular/core';

export interface CartItem {
  productId: number | string;
  name?: string;
  unitPrice?: number;
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY = 'pt_cart_v1';

  private read(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private write(items: CartItem[]) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
  }

  getItems(): CartItem[] {
    return this.read();
  }

  addItem(product: { id: number | string; name?: string; price?: number }, qty = 1) {
    const items = this.read();
    const idx = items.findIndex(i => i.productId === product.id);
    if (idx >= 0) {
      items[idx].qty += qty;
    } else {
      items.push({ productId: product.id, name: product.name, unitPrice: product.price, qty });
    }
    this.write(items);
  }

  updateQty(productId: number | string, qty: number) {
    const items = this.read().map(i => i.productId === productId ? { ...i, qty } : i).filter(i => i.qty > 0);
    this.write(items);
  }

  remove(productId: number | string) {
    const items = this.read().filter(i => i.productId !== productId);
    this.write(items);
  }

  clear() {
    localStorage.removeItem(this.KEY);
  }

  getTotalAmount(): number {
    return this.read().reduce((s, i) => s + (i.unitPrice ?? 0) * i.qty, 0);
  }

  getTotalCount(): number {
    return this.read().reduce((s, i) => s + i.qty, 0);
  }
}