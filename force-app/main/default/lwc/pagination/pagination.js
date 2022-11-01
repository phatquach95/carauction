import { LightningElement, api } from "lwc";

export default class Pagination extends LightningElement {
  pageSizeOptions = [10, 25, 50, 75, 100]; 
  totalRecords = 0; 
  pageSize=10; 
  totalPages; 
  pageNumber = 1; 
  recordsToDisplay = []; 
  _records;

  // to disable first button
  get bDisableFirst() {
    return this.pageNumber === 1;
  }

  // to disable last button
  get bDisableLast() {
    return this.pageNumber === this.totalPages;
  }

  // after get record from listCar, execute this method to handle pagination
  set records(value) {
    this._records = value;
    this.totalRecords = this._records.length;
    this.handlePagination();
  }

  @api
  get records() {
    return this._records;
  }

  handleRecordsPerPage(event) {
    this.pageSize = event.target.value;
    this.handlePagination();
  }

  previousPage() {
    this.pageNumber = this.pageNumber - 1;
    this.handlePagination();
  }

  nextPage() {
    this.pageNumber = this.pageNumber + 1;
    this.handlePagination();
  }

  firstPage() {
    this.pageNumber = 1;
    this.handlePagination();
  }

  lastPage() {
    this.pageNumber = this.totalPages;
    this.handlePagination();
  }

  handlePagination() {
    this.recordsToDisplay = [];
    // calculate total pages
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    // set page number
    if (this.pageNumber <= 1) {
      this.pageNumber = 1;
    } else if (this.pageNumber >= this.totalPages) {
      this.pageNumber = this.totalPages;
    }
    // set records to display on current page
    // Ex: want to show page 5 with size 10, then i is page 4 then increase to page 5 which means record 50 
    for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
      if (i === this.totalRecords) {
        break;
      }
      this.recordsToDisplay.push(this._records[i]);
    }

    // Send event to listCar the result showing calculated record 
    if (this.recordsToDisplay.length > 0) {
      const event = new CustomEvent("pagination", {
        detail: this.recordsToDisplay
      });
      this.dispatchEvent(event);
    }
  }
}
