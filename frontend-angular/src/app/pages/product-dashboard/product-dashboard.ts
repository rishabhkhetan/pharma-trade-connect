import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-dashboard.html',
  styleUrls: ['./product-dashboard.css']
})
export class ProductDashboardComponent implements OnInit {
  products: any[] = [];
  loading = false;
  error = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    this.productService.getAllProducts().subscribe({
      next: (items) => {
        this.products = items || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load products';
        console.error('Products load error', err);
        this.loading = false;
      }
    });
  }

  addToCart(product: any): void {
    if (!product) return;
    this.cartService.addItem({ id: product.id, name: product.name, price: product.price }, 1);
    // small UI feedback - navigate to cart or show a toast; here we log
    console.log('Added to cart:', product.id);
  }

  viewProduct(product: any): void {
    // Use router to navigate to a product details page if implemented
    // If no details page exists, this function is safe to keep for future use
    if (!product || !product.id) return;
    this.router.navigate(['/products', product.id]);
  }
}