import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import {
  ListItem,
} from '../../models/list-item.model.ts';

@Component({
  selector: 'sl-list',
  templateUrl: './list.template.html',
  styleUrls: [ './list.style.scss' ],
})
export class ListComponent {

  @Input()
  public items: ListItem[] = [ ];

  @Input()
  public baseColor: string = '#0147A7';

  @Output()
  public onRemove: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  public onEdit: EventEmitter<any> = new EventEmitter<any>();

  /**
   * Removes an item from the items list
   * 
   * @param {number} index Index of element to remove
   * @returns {void}
   */
  public removeItem (index: number): void {
    this.items.splice(index, 1);
    this.onRemove.emit({});
  }

  /**
   * Generates the color string for a gradient over the items
   * 
   * @param {number} index Index of element
   * @returns {string} Hex-color-string 
   */
  public gradientColor (index: number): string {
    if (this.items.length < 1) {
      throw 'No items';
    }
    if (index < 0 || index >= this.items.length) {
      throw 'Index of of bounds';
    }

    const maxR = parseInt(this.baseColor.substr(1, 2), 16);
    const maxG = parseInt(this.baseColor.substr(3, 2), 16);
    const maxB = parseInt(this.baseColor.substr(5, 2), 16);

    const colorRatio = (this.items.length - index) / this.items.length;

    const R = Math.floor(maxR * colorRatio) << 16;
    const G = Math.floor(maxG * colorRatio) << 8;
    const B = Math.floor(maxB * colorRatio) << 0;

    let col: string = (R + G + B).toString(16);

    while (col.length < 6) {
      col = '0' + col;
    }

    return '#' + col;
  }

  public toggleEditable (
    event: MouseEvent | KeyboardEvent,
    elem: HTMLInputElement,
    index: number
  ) {
    if (elem.contentEditable !== 'true') {
      elem.contentEditable = 'true';
      elem.focus();
    } else {
      this.commitEdit(elem, index);
      elem.contentEditable = 'false';
    }
  }

  public commitEdit (elem: HTMLElement, index: number) {
    if (elem.textContent) {
      this.items[index].name = elem.textContent.replace(/[\r\n\t]/g, '');
      elem.textContent = this.items[index].name;
      this.onEdit.emit({});
    } else {
      this.removeItem(index);
    }
  }

  public onEditHandler (
    event: KeyboardEvent,
    keyCode: number,
    elem: HTMLElement,
    index: number
  ) {
    if (keyCode === 13) {
      elem.contentEditable = 'false';
      this.commitEdit(elem, index);
    }
  }

}
