import {
  Component,
  OnInit,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { Products, Product } from '../shared/models/product.model';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { Category } from '../shared/models/category.model';
import { CategoryService } from '../services/category.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isAdmin: boolean = false;
  isCategoryModalOpen: boolean = false;
  isCategoryDeleteModal: boolean = false;
  isAddProductModalOpen: boolean = false;
  newProduct: Product | null = null;
  categoryToDelete: Category | null = null;
  newCategory: string = '';
  loading = false;
  productPageCounter = 1;
  additionalLoading = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private _token: TokenStorageService,
    private cartService: CartService
  ) { }

  public screenWidth: any;
  public screenHeight: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  ngOnInit(): void {
    this.newProduct = {
      id: 0,
      name: '',
      category: '',
      description: '',
      image: '',
      price: 0,
      quantity: 0,
      images: []
    };
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.categoryService.getAllCategories().subscribe(
      (res: any) => {
        this.categories = res.data;
        console.log(this.categories)
      },
      (err) => {
        console.log(err);
        this.loading = false;
      }
    );
    this.checkIfUserIsAdmin();
    this.loading = true;
    setTimeout(() => {
      this.productService.getAllProducts(9, this.productPageCounter).subscribe(
        (res: any) => {
          console.log(res);
          this.products = res;
          this.loading = false;
        },
        (err) => {
          console.log(err);
          this.loading = false;
        }
      );
    }, 500);
  }

  //CHANGES PRODUCTS BASED ON SELECTED CATEGORY 
  changeProducts(category: Category): void {
    this.loading = true;
    setTimeout(() => {

    })
  }

  checkIfUserIsAdmin(): void {
    this.isAdmin = this._token.getIsAdmin();
  }

  openAddProductModal(): void {
    this.isAddProductModalOpen = true;
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  openCategoryModal(): void {
    this.isCategoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen = false;
  }

  openDeleteCategoryModal(category: Category): void {
    this.categoryToDelete = category;
    this.isCategoryDeleteModal = true;
  }

  closeDeleteCategoryModal(): void {
    this.isCategoryDeleteModal = false;
    this.categoryToDelete = null;
  }

  deleteCategory(): void {
    if (this.categoryToDelete) {
      this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe(
        (res) => {
          console.log('Categoría eliminada', res);
          this.categories = this.categories.filter(
            (category) => category.id !== this.categoryToDelete.id
          );
          this.closeDeleteCategoryModal();
        },
        (err) => {
          console.error('Error al eliminar la categoría', err);
        }
      );
    }
  }

  saveCategory(): void {
    if (this.newCategory.trim() === '') {
      console.log("La categoría no puede estar vacía");
      return;
    }

    const categoryData = { title: this.newCategory };
    this.categoryService.createCategory(categoryData).subscribe(
      (response) => {
        console.log("Categoría guardada:", response);
        this.categories.push(response.data);
        this.closeCategoryModal();
        this.newCategory = '';
      },
      (err) => {
        console.log("Error al guardar la categoría:", err);
      }
    );
  }

  addProduct(): void {
    console.log(this.newProduct); // Esto es solo para ver el producto en la consola

    if (this.newProduct) {
      this.productService.createProduct(this.newProduct).subscribe(
        (res) => {
          // Respuesta exitosa
          console.log('Producto creado:', res);
          // Aquí puedes agregar algún mensaje de éxito o redirigir a otra página
        },
        (err) => {
          // Manejo de errores
          console.error('Error al crear el producto:', err);
          // Puedes agregar algún mensaje de error para mostrar al usuario
        }
      );
    }
  }

  showMoreProducts(): void {
    this.additionalLoading = true;
    this.productPageCounter = this.productPageCounter + 1;
    setTimeout(() => {
      this.productService.getAllProducts(9, this.productPageCounter).subscribe(
        (res: any) => {
          console.log(res);
          this.products = [...this.products, ...res];
          this.additionalLoading = false;
        },
        (err) => {
          console.log(err);
          this.additionalLoading = false;
        }
      );
    }, 500);
  }

  onMainImageChange(event: any): void {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        this.newProduct!.image = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  onAdditionalImagesChange(event: any): void {
    const files = (event.target as HTMLInputElement).files;

    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = () => {
          this.newProduct!.images.push(reader.result as string);
        };

        reader.readAsDataURL(file);
      });
    }
  }
}
