import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Products, Product } from '../shared/models/product.model';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient, private _api: ApiService) { }

  getAllProducts(limitOfResults = 9, page): Observable<Products> {
    return this.http.get<Products>(this.url + 'products', {
      params: {
        limit: limitOfResults.toString(),
        page: page,
      },
    });
  }

  getSingleProduct(id: Number): Observable<any> {
    console.log(id);
    return this._api.getTypeRequest('products/' + id);
  }

  createProduct(product: FormData): Observable<any> {
    return this.http.post<any>(this.url + 'products', product);
  }

  editProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(this.url + 'products/' + id, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(this.url + 'products/' + id);
  }
}
