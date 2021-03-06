import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { exhaustMap, map, take, tap } from 'rxjs/operators';

import { Recipe } from '../recipes/recipe.model';
import { RecipeService } from '../recipes/recipe.service';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' }) // providedIn optionını kullandıgında app.moduleda provideda eklemene gerek kalmıyor
export class DataStorageService {
  constructor(private http: HttpClient, private recipeService: RecipeService, private authService: AuthService) {}

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.http
      .put(
        'https://ng-course-recipe-book-d3d1d-default-rtdb.firebaseio.com/recipes.json',
        recipes
      )
      .subscribe(response => {
        console.log(response);
      });
  }
 
  fetchRecipes() {
    return this.http.get<Recipe[]>('https://ng-course-recipe-book-d3d1d-default-rtdb.firebaseio.com/recipes.json')
    .pipe(
      map(recipes => {
        return recipes.map(recipe => {
          return {
            ...recipe,
            ingredients: recipe.ingredients ? recipe.ingredients : []
          }
        })
      }),
      tap(recipies => {
        this.recipeService.setRecipes(recipies);
      })
    )
    // return this.authService.user.pipe(take(1),
     //).subscribe( // what take tells Rxjs is that I only want to take one value 
    // from that observable and thereafter it should automatically unsubscribe, so this manages the subscription for me
    // gives me the latest user and unsubscribes and Im nor getting future users because I just want to get
    // them on demand when fetch recipies called
    // so whenever this code executes. i dont want to set up an ongoing subscription which gives me users at a point of time 
    // I dont need them anymore
    // user => )  // so thereafter here in subscribe, I get my user object but only once and we dont need to manually  unsubscribe 
    // exhaustMap(user => {
    //   return this.http
    //     .get<Recipe[]>(
    //       'https://ng-course-recipe-book-d3d1d-default-rtdb.firebaseio.com/recipes.json',
    //       {
    //         params: new HttpParams().set('auth', user.token)
    //       }
    //     )
    //   }),
    // map(recipes => {
    //   return recipes.map(recipe => {
    //     return {
    //       ...recipe,
    //       ingredients: recipe.ingredients ? recipe.ingredients : []
    //     };
    //   });
    //   }),
    // tap(recipes => {
    //   this.recipeService.setRecipes(recipes);
    // })
    //   // .subscribe(response => {
    //   //   this.recipeService.setRecipes(response);
    //   // })
    // )
  }
}
