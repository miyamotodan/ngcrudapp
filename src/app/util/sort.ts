export class Sort {

    private sortorder = 1;
    private collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base"
    });

    constructor() { }

    public startSort(property, order, type = "") {
        if (order == 'desc') {
            this.sortorder = -1;
        }
        return (a, b) => {
            if (type === "date") {
                return this.sortDate(new Date(a[property]), new Date(b[property]));
            } else {
                return this.collator.compare(a[property], b[property]) * this.sortorder;
            }
        }
    }

    private sortDate(a,b) {
        if (a<b){
            return -1*this.sortorder;
        } else if (a>b) {
            return 1*this.sortorder;
        } else {
            return 0*this.sortorder;
        }
    }
}