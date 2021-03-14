import { Directive, Input, ElementRef, Renderer2, HostListener } from '@angular/core';
import { Sort } from './sort';

@Directive({
    selector: '[appSort]'
})
export class SortDirective {

    @Input() appSort: Array<any>;
    constructor(private renderer: Renderer2, private targetElem: ElementRef) { }

    @HostListener("click")
    sortData() {
        console.log('sortData')
        const sort = new Sort();
        const elem = this.targetElem.nativeElement;
        const order = elem.getAttribute("data-order");
        const type = elem.getAttribute("data-type");
        const property = elem.getAttribute("data-name");

        elem.parentElement.childNodes.forEach(e => {
            e.classList.remove('desc');
            e.classList.remove('asc');
        });
        if (order == "desc") {
            this.appSort.sort(sort.startSort(property, order, type));
            elem.setAttribute("data-order", "asc");
            elem.classList.add('asc');
        } else {
            this.appSort.sort(sort.startSort(property, order, type));
            elem.setAttribute("data-order", "desc");
            elem.classList.add('desc');
        }
    }

}