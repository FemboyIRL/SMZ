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
  isProductDeleteModal: boolean = false;
  productToDelete: Product | null = null;
  editedProduct: Product | null = null;
  isEditProductModalOpen: boolean = false;

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
      image: null,
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
      this.productService.getAllProductsFromCategory(category.id, 9, this.productPageCounter).subscribe(
        (response) => {
          this.products = response.products;
          this.loading = false;
          console.log(this.products);
        },
        (error) => {
          console.error("Error loading products", error);
        }
      );
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

  openDeleteProductModal(product: Product): void {
    console.log(product)
    this.productToDelete = product;
    this.isProductDeleteModal = true;
  }

  closeDeleteProductModal(): void {
    this.isProductDeleteModal = false;
  }

  openEditProductModal(product: any) {
    console.log(product)
    this.editedProduct = { ...product };
    this.isEditProductModalOpen = true;
  }

  closeEditProductModal() {
    this.isEditProductModalOpen = false;
  }

  editProduct() {
    if (!this.editedProduct.name || !this.editedProduct.description || !this.editedProduct.price || !this.editedProduct.quantity || !this.editedProduct.category) {
      alert('Todos los campos son obligatorios');
      return;
    }

    this.productService.editProduct(this.editedProduct.id, this.editedProduct).subscribe(
      (response) => {
        console.log('Producto actualizado correctamente', response);
        this.products.push(response.product);
        this.products = this.products.filter(
          (product) => product.id !== this.editedProduct.id
        );
        this.closeEditProductModal();
      },
      (error) => {
        console.error('Error al actualizar el producto', error);
        alert('Hubo un error al actualizar el producto');
      }
    );
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

  deleteProduct(): void {
    if (this.productToDelete) {
      this.productService.deleteProduct(this.productToDelete.id).subscribe(
        (res) => {
          console.log('Producto eliminado:', res);

          this.products = this.products.filter(
            (product) => product.id !== this.productToDelete.id
          );

          this.isProductDeleteModal = false;
        },
        (err) => {
          console.error('Error al eliminar el producto', err);
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
    console.log(this.newProduct.description);

    if (this.newProduct) {
      const formData = new FormData();

      // Agregar datos básicos
      formData.append('id', this.newProduct.id.toString());
      formData.append('name', this.newProduct.name);
      formData.append('category', this.newProduct.category);
      formData.append('description', this.newProduct.description);
      formData.append('price', this.newProduct.price.toString());
      formData.append('quantity', this.newProduct.quantity.toString());

      // Agregar la imagen principal
      if (this.newProduct.image) {
        formData.append('image', this.newProduct.image);
      }

      // Agregar imágenes adicionales
      if (this.newProduct.images && this.newProduct.images.length > 0) {
        for (const image of this.newProduct.images) {
          formData.append('images', image);
        }
      }

      console.log(formData)

      this.productService.createProduct(formData).subscribe(
        (res) => {
          this.products.push(res.product);
          this.closeAddProductModal()
        },
        (err) => {
          console.error('Error al crear el producto:', err);
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
      this.newProduct.image = file;
    }
  }

  onAdditionalImagesChange(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.newProduct.images = Array.from(files);
    }
  }


}
