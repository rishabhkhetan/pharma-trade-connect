import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  manufacturer?: string;
  batchNo?: string;
  expiry?: string;        // ISO date string, e.g. "2026-06-30T00:00:00.000Z"
  price: number;
  stockQuantity: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}