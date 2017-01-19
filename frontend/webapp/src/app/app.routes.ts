import { Routes } from '@angular/router';

import {
  NoContentComponent,
  LIST_VIEW_ROUTES,
  OFFERS_ROUTES,
  REGISTER_ROUTES,
  LOGIN_ROUTES,
  LIST_OVERVIEW_ROUTES,
} from './components';

export const ROUTES: Routes = [
  ...LIST_VIEW_ROUTES,
  ...OFFERS_ROUTES,
  ...REGISTER_ROUTES,
  ...LOGIN_ROUTES,
  ...LIST_OVERVIEW_ROUTES,
  { path: '**',    component: NoContentComponent },
];
