import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { Category } from '../shared/models/category.model';
import { environment } from '../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const apiUrl = environment.apiUrl + 'categories';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test para obtener todas las categorías
  it('should retrieve all categories', () => {
    const mockCategories: Category[] = [
      { id: 1, title: 'Category 1' },
      { id: 2, title: 'Category 2' },
    ];

    service.getAllCategories().subscribe((categories) => {
      expect(categories.length).toBe(2);
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);
  });

  // Test para obtener una categoría por ID
  it('should retrieve a category by ID', () => {
    const mockCategory: Category = { id: 1, title: 'Category 1' };

    service.getCategoryById(1).subscribe((category) => {
      expect(category).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(apiUrl + '/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  // Test para crear una nueva categoría
  it('should create a new category', () => {
    const newCategory: Category = { id: 3, title: 'Category 3' };

    service.createCategory(newCategory).subscribe((category) => {
      expect(category).toEqual(newCategory);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(newCategory);
  });

  // Test para editar una categoría
  it('should update a category', () => {
    const updatedCategory: Category = { id: 1, title: 'Updated Category' };

    service.editCategory(1, updatedCategory).subscribe((category) => {
      expect(category).toEqual(updatedCategory);
    });

    const req = httpMock.expectOne(apiUrl + '/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updatedCategory);
  });

  // Test para eliminar una categoría
  it('should delete a category', () => {
    service.deleteCategory(1).subscribe(() => {
      expect(true).toBe(true); // Se pasa la prueba si no hay error
    });

    const req = httpMock.expectOne(apiUrl + '/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
