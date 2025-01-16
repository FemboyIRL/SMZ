import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../shared/models/category.model';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    private url = environment.apiUrl;

    constructor(private http: HttpClient, private _api: ApiService) { }

    // Obtener todas las categorías
    getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.url + 'categories');
    }

    // Obtener una categoría por ID
    getCategoryById(id: number): Observable<any> {
        return this._api.getTypeRequest('categories/' + id);
    }

    // Crear una nueva categoría
    createCategory(category: { title: string }): Observable<any> {
        return this.http.post<any>(this.url + 'categories', category);
    }

    // Editar una categoría existente
    editCategory(id: number, category: Category): Observable<Category> {
        return this.http.put<Category>(this.url + 'categories/' + id, category);
    }

    // Eliminar una categoría
    deleteCategory(id: number): Observable<void> {
        return this.http.delete<void>(this.url + 'categories/' + id);
    }
}
