import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartData = {
    products: [],
    total: 0,
  };

  cartDataObs$ = new BehaviorSubject(this.cartData);

  constructor(
    private _notification: NzNotificationService,
    private _api: ApiService
  ) {
    let localCartData = JSON.parse(localStorage.getItem('cart'));
    if (localCartData) this.cartData = localCartData;

    this.cartDataObs$.next(this.cartData);
  }

  submitCheckout(userId, cart) {
    return this._api.postTypeRequest('orders/create', {
      userId: userId,
      cart: cart,
    });
  }

  addProduct(params): void {
    const { id, price, quantity, image, title, maxQuantity } = params;
    const product = { id, price, quantity, image, title, maxQuantity };

    if (!this.isProductInCart(id)) {
      if (quantity) this.cartData.products.push(product);
      else this.cartData.products.push({ ...product, quantity: 1 });
    } else {
      // copy array, find item index and update
      let updatedProducts = [...this.cartData.products];
      let productIndex = updatedProducts.findIndex((prod) => prod.id == id);
      let product = updatedProducts[productIndex];

      // if no quantity, increment
      if (quantity) {
        updatedProducts[productIndex] = {
          ...product,
          quantity: quantity,
        };
      } else {
        updatedProducts[productIndex] = {
          ...product,
          quantity: product.quantity + 1,
        };
      }

      console.log(updatedProducts);
      this.cartData.products = updatedProducts;
    }

    this.cartData.total = this.getCartTotal();
    this._notification.create(
      'success',
      'Producto añadido al carrito',
      `${title} Se ha añadido con éxito al carrito`
    );
    this.cartDataObs$.next({ ...this.cartData });
    localStorage.setItem('cart', JSON.stringify(this.cartData));
  }

  updateCart(id: number, quantity: number): void {
    // copy array, find item index and update
    let updatedProducts = [...this.cartData.products];
    let productIndex = updatedProducts.findIndex((prod) => prod.id == id);

    updatedProducts[productIndex] = {
      ...updatedProducts[productIndex],
      quantity: quantity,
    };

    this.cartData.products = updatedProducts;
    this.cartData.total = this.getCartTotal();
    this.cartDataObs$.next({ ...this.cartData });
    console.log(this.cartData.products);
    localStorage.setItem('cart', JSON.stringify(this.cartData));
  }

  removeProduct(id: number): void {
    let updatedProducts = this.cartData.products.filter(
      (prod) => prod.id !== id
    );
    this.cartData.products = updatedProducts;
    this.cartData.total = this.getCartTotal();
    this.cartDataObs$.next({ ...this.cartData });
    localStorage.setItem('cart', JSON.stringify(this.cartData));

    this._notification.create(
      'success',
      'Eliminado con éxito',
      'El artículo seleccionado se ha eliminado del carrito con éxito'
    );
  }

  clearCart(): void {
    this.cartData = {
      products: [],
      total: 0,
    };
    this.cartDataObs$.next({ ...this.cartData });
    localStorage.setItem('cart', JSON.stringify(this.cartData));
  }

  getCartTotal(): number {
    let totalSum = 0;
    this.cartData.products.forEach(
      (prod) => (totalSum += prod.price * prod.quantity)
    );

    return totalSum;
  }

  isProductInCart(id: number): boolean {
    return this.cartData.products.findIndex((prod) => prod.id === id) !== -1;
  }
}
