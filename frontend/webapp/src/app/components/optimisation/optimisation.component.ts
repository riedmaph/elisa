import {
  Component,
  OnInit,
} from '@angular/core';
import {
  Router,
  ActivatedRoute,
  Params,
} from '@angular/router';

import { Observable } from 'rxjs';

import {
  OptimisedList,
  OptimisedListItem,
  Offer,
} from '../../models';

import { OptimisationService } from '../../services';

@Component({
  templateUrl: 'optimisation.template.html',
  styleUrls: [ 'optimisation.style.scss' ],
})
export class OptimisationComponent implements OnInit {

  public optimisedList: OptimisedList;

  public optimisationLoaded: boolean = false;

  private listUuid: string;
  private longitude: number;
  private latitude: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private optimisationService: OptimisationService,
  ) { }

  /**
   * @memberOf OnInit
   */
  public ngOnInit (): void {
    this.route.params.subscribe((params: Params) => {
      this.listUuid = params['listId'];
      navigator.geolocation.getCurrentPosition(pos => {
        this.longitude = pos.coords.longitude;
        this.latitude = pos.coords.latitude;
        this.loadOptimisedList('price');
      });
    });
  }

  /**
   * Gets the currently selected offer for a given list item.
   *
   * @param {OptimisedListItem} listItem The list item to get the offer for.
   */
  public getSelectedOfferForItem (listItem: OptimisedListItem): Offer {
    if (listItem.selectedOfferIndex >= listItem.offers.length) {
      return null;
    }
    return listItem.offers[listItem.selectedOfferIndex];
  }

  /**
   * Selects the next offer for a given list item, if it exists.
   *
   * @param {OptimisedListItem} listItem The list item to select the offer for.
   */
  public selectNextOfferForItem (listItem: OptimisedListItem) {
    if (this.existsNextOfferForItem(listItem)) {
      listItem.selectedOfferIndex += 1;
      this.updateSelectionForItem(listItem).subscribe(result =>
        this.optimisedList.amountSaved = Math.abs(result.savings)
      );
    }
  }

  /**
   * Selects the previous offer for a given list item, if it exists.
   *
   * @param {OptimisedListItem} listItem The list item to select the offer for.
   */
  public selectPreviousOfferForItem (listItem: OptimisedListItem) {
    if (this.existsPreviousOfferForItem(listItem)) {
      listItem.selectedOfferIndex -= 1;
      this.updateSelectionForItem(listItem).subscribe(result =>
        this.optimisedList.amountSaved = Math.abs(result.savings)
      );
    }
  }

  /**
   * Checks whether there exists a next offer for a given list item.
   *
   * @param {OptimisedListItem} listItem The list item to check for.
   * @return {boolean} True if a next offer exists for the list item.
   */
  public existsNextOfferForItem (listItem: OptimisedListItem): boolean {
    return listItem.selectedOfferIndex < listItem.offers.length - 1;
  }

  /**
   * Checks whether there exists a previous offer for a given list item.
   *
   * @param {OptimisedListItem} listItem The list item to check for.
   * @return {boolean} True if a previous offer exists for the list item.
   */
  public existsPreviousOfferForItem (listItem: OptimisedListItem): boolean {
    return listItem.selectedOfferIndex >= 0;
  }

  /**
   * Saves the optimised list and navigates back to the list view.
   */
  public saveOptimisedList () {
    this.optimisationService.saveOptimisedList(this.listUuid).subscribe(_ =>
      this.router.navigate([ '../' ], { relativeTo: this.route })
    );
  }

  /**
   * Loads the optimised list.
   *
   * @param {string} optimisedBy The optimisation criteria - either 'price' or 'distance'
   */
  private loadOptimisedList (optimisedBy: string) {
    this.optimisationService.getOptimisedList(
      this.listUuid, optimisedBy , this.longitude, this.latitude)
        .subscribe(optimisedList => {
        this.optimisedList = optimisedList;
        this.optimisationLoaded = true;
      });
  }

  /**
   * Updates the optimised list by choosing either a selected offer,
   * or the original list item.
   *
   * @param {OptimisedListItem} listItem The chosen list item to update.
   */
  private updateSelectionForItem (listItem: OptimisedListItem): Observable<any> {
    const selectedOffer = this.getSelectedOfferForItem(listItem);
    if (selectedOffer) {
      const updatedItem = {
        id: listItem.item.id,
        name: selectedOffer.title,
        unit: listItem.item.unit,
        amount: listItem.item.amount,
        onSale: true,
        checked: listItem.item.checked,
        offerUser: selectedOffer.id,
      };
      return this.optimisationService.updateSelectedItem(
        this.listUuid, this.longitude, this.latitude, updatedItem);
    }
    return this.optimisationService.updateSelectedItem(
      this.listUuid, this.longitude, this.latitude, listItem.item);
  }

}