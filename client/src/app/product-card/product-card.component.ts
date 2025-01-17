import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Product } from '../shared/models/product.model'; // Asegúrate de tener el modelo adecuado
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
})
export class ProductCardComponent implements OnInit {
  isAdmin: boolean = false;

  @Input() title: string;
  @Input() image: string;
  @Input() short_desc: string;
  @Input() category: string;
  @Input() quantity: number;
  @Input() price: string;
  @Input() id: number;
  @Input() onAdd: any;

  @Output() onEdit = new EventEmitter<Product>();
  @Output() onDelete = new EventEmitter<number>();

  editProduct() {
    const productToEdit: Product = {
      id: this.id,
      name: this.title,
      image: this.image,
      images: [],
      description: this.short_desc,
      category: this.category,
      quantity: this.quantity,
      price: parseInt(this.price, 10)
    };
    this.onEdit.emit(productToEdit);
  }

  deleteProduct() {
    this.onDelete.emit(this.id);
  }

  baseUrl: string = 'http://localhost:5000'; // Cambia a tu URL del servidor donde hostees el backend

  constructor(private _token: TokenStorageService,) { }

  ngOnInit(): void {
    this.checkIfUserIsAdmin();
  }

  checkIfUserIsAdmin(): void {
    this.isAdmin = this._token.getIsAdmin();
  }

}
