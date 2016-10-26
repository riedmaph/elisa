/*
 * Angular 2 decorators and services
 */
import { Component, ViewEncapsulation } from '@angular/core';

/*
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'sl-app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    '../assets/sass/main.scss',
    '../assets/sass/font-awesome.scss',
  ],
  templateUrl: 'app.template.html',
})
export class AppComponent {

  public name: string = 'Shopping List';

}