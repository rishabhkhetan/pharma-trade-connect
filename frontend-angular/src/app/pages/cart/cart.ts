// frontend-angular/src/app/pages/cart/cart.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'] // create minimal CSS if you want, otherwise ignore
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  loading = false;
  error = '';
  success = '';
  // For mock backend
  private ordersUrl = 'http://localhost:3000/orders';

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.items = this.cartService.getItems();
    this.error = '';
    this.success = '';
  }

  increase(item: CartItem) {
    this.cartService.updateQty(item.productId, item.qty + 1);
    this.load();
  }

  decrease(item: CartItem) {
    const next = item.qty - 1;
    if (next <= 0) {
      this.remove(item);
      return;
    }
    this.cartService.updateQty(item.productId, next);
    this.load();
  }

  remove(item: CartItem) {
    this.cartService.remove(item.productId);
    this.load();
  }

  getTotal(): number {
    return this.cartService.getTotalAmount();
  }

  placeOrderMock() {
    if (this.items.length === 0) {
      this.error = 'Cart is empty';
      return;
    }

    // Build payload compatible with TRD / backend
    const payload = {
      user_id: 1, // mock user id (json-server won't enforce auth). Later replace with real logged-in user id
      total_amount: this.getTotal(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      items: this.items.map(i => ({
        product_id: Number(i.productId),
        quantity: i.qty,
        unit_price: i.unitPrice ?? 0
      }))
    };

    this.loading = true;
    this.error = '';
    this.success = '';

    // json-server will accept POST /orders — it will add the entry to db.json
    this.http.post(this.ordersUrl, payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: any) => {
          this.success = 'Order placed successfully (mock).';
          // clear cart
          this.cartService.clear();
          this.load();
          // optional redirect to /orders after 1.5s
          setTimeout(() => this.router.navigate(['/orders']), 1400);
        },
        error: (err) => {
          console.error('Order error', err);
          this.error = 'Failed to place order (mock).';
        }
      });
  }
}