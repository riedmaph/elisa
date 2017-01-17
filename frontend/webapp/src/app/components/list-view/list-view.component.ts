import {
  Component,
  OnInit,
  AfterViewInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';

import { ListComponent } from '../list';
import { ConfirmComponent } from '../confirm/confirm.component';
import { ApiService } from '../../services/api';
import {
  ListItem,
  List,
  Product,
} from '../../models';

@Component({
  selector: 'sl-list-view',
  templateUrl: './list-view.template.html',
  styleUrls: [ './list-view.style.scss' ],
})
export class ListViewComponent implements OnInit, AfterViewInit {

  public list: List = null;

  public form: FormGroup;

  public MAX_LENGTH: number = 140;

  @ViewChildren(ListComponent)
  private listComponents: QueryList<ListComponent>;

  constructor (
    private apiService: ApiService,
    private route: ActivatedRoute,
    private dialog: MdDialog,
    private location: Location,
    private formBuilder: FormBuilder,
  ) {
    this.form = this.formBuilder.group({
      amount: [ '', Validators.required ],
      unit: [ '', Validators.required ],
      itemName: [ '', Validators.compose([
        Validators.maxLength(this.MAX_LENGTH),
        Validators.required,
      ]) ],

    });
  }

  /** Getter for unchecked items */
  public get items (): ListItem[] {
    return this.list.items.filter(i => !i.checked);
  }

  /** Getter for checked items */
  public get completedItems (): ListItem[] {
    return this.list.items.filter(i => i.checked);
  }

  /**
   * Load previous entries from the API
   * @memberOf OnInit
   */
  public ngOnInit (): void {
    this.route.data.subscribe((data: { list: List }) => {
      this.list = data.list;
    });
  }

  /**
   * @memberOf AfterViewInit
   */
  public ngAfterViewInit (): void {
    this.listComponents.forEach(listComp => {
      listComp.onEdit.subscribe(newItem => this.updateItem(newItem));
      listComp.onRemove.subscribe(item => this.removeItem(item));
      listComp.onReorder.subscribe((tuple: [ ListItem, number, number ]) =>
        this.reorderItems(tuple[0], tuple[1], tuple[2])
      );
    });
  }

  /**
   * Propagates input change to the FormGroup
   *
   * @param {Product} value New value
   */
  public updateValue (value: Product): void {
    this.form.controls['itemName'].setValue(value);
  }

  /**
   * Adds an item to list. Grabs the values from this.form (thus requires it to be updated)
   */
  public addItem (): void {
    if (this.form.valid) {
      const newItem: ListItem = {
        name: this.form.value.itemName,
        unit: this.form.value.unit,
        amount: this.form.value.amount,
        checked: false,
      };

      this.apiService.addItem(this.list.id, newItem).subscribe(res => {
        newItem.id = res.id;
        this.list.items.push(newItem);
        this.form.controls['itemName'].setValue('');
      });

      window.scrollTo(0, document.body.getBoundingClientRect().height);
    }
  }

  /**
   * Propagate change of an item via API
   *
   * @param {ListItem} item Item that changed in its new state
   * @return {void}
   */
  public updateItem (item: ListItem): void {
    this.apiService.updateItem(this.list.id, item.id, item)
      .subscribe(() => undefined);
  }

  /**
   * Removes items from both, the incomplete and completed section
   *
   * @param {string[]} items The items to remove
   * @return {void}
   */
  public removeItem (item: ListItem): void {
    this.apiService.removeItem(this.list.id, item).subscribe(
      () => this.list.items.splice(this.list.items.indexOf(item), 1),
    );
  }

  /**
   * Reorders the list items and
   * Propagates reordering of an item to the API
   *
   * @param {ListItem} movedItem moved item
   * @param {number} newPosition new Position porpagated to the api
   * @param {number} targetIndex array index used for moving the item in the this.list.item
   * @return {void}
   */
  public reorderItems (movedItem: ListItem, newPosition: number, targetIndex: number): void {
    const movedItemIndex = this.list.items.indexOf(movedItem);
    // insert the moved Item at new position
    this.list.items.splice(targetIndex, 0, ...this.list.items.splice(movedItemIndex, 1));
    movedItem.listUuid = this.list.id;
    this.apiService.reorderItem(movedItem, newPosition)
      .subscribe(() => console.info('moved item ' + movedItem.name + ' to ' + newPosition));
  }

  /**
   * Scope wrapper for ApiService.getAutoCompletion
   * @see ApiService.getAutoCompletion
   */
  public get autoCompletionFn (): (_: string) => Observable<Product[]> {
    return (str: string) => this.apiService.getAutoCompletion(str);
  }

  public deleteList (): void {
    let dialogRef = this.dialog.open(ConfirmComponent, {
       disableClose: false,
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
      this.apiService.deleteList(this.list.id);
      this.list.items = [ ];
      }
    });
  }

  public onEditHandler (
   event: KeyboardEvent,
   keyCode: number,
   elem: HTMLElement
   ) {
     if (keyCode === 13) {
       elem.contentEditable = 'false';
      this.commitEdit(elem);
     }
   }

  public toggleEditable (
    event: MouseEvent | KeyboardEvent,
    elem: HTMLInputElement
  ) {
    if (elem.contentEditable !== 'true') {
      elem.contentEditable = 'true';
      elem.focus();
    } else {
      this.commitEdit(elem);
      elem.contentEditable = 'false';
     }
   }

  public commitEdit (elem: HTMLElement) {
    if (elem.textContent){
      this.list.name = elem.textContent.replace(/[\r\n\t]/g, '');
      this.apiService.renameList(this.list.id, this.list.name);
    }
  }
}
