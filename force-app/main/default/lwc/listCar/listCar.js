import { LightningElement, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";
import PLATE_FIELD from "@salesforce/schema/Car__c.Plate_No__c";
import BRAND_FIELD from "@salesforce/schema/Car__c.Brand__c";
import MODEL_FIELD from "@salesforce/schema/Car__c.Model__C";
import BODY_FIELD from "@salesforce/schema/Car__c.Body__c";
import FUELTYPE_FIELD from "@salesforce/schema/Car__c.Fuel_Type__c";
import NUMSEAT_FIELD from "@salesforce/schema/Car__c.Number_of_Seats__c";
import BOUGHTDATE_FIELD from "@salesforce/schema/Car__c.Bought_Date__c";
import getAllCar from "@salesforce/apex/CarController.getAllCar";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import CAR_CHANNEL from "@salesforce/messageChannel/carManagementChannel__c";
import { refreshApex } from "@salesforce/apex";
import IconsResource from "@salesforce/resourceUrl/iconsSource";
import globalSearch from "@salesforce/apex/CarController.globalSearch";
import searchCar from "@salesforce/apex/CarController.searchCar";

const COLUMNS = [
  {
    label: "Plate No",
    fieldName: PLATE_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Brand",
    fieldName: BRAND_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Model",
    fieldName: MODEL_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Body",
    fieldName: BODY_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Fuel Type",
    fieldName: FUELTYPE_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Num Seat",
    fieldName: NUMSEAT_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Bought Date",
    fieldName: BOUGHTDATE_FIELD.fieldApiName,
    type: "text",
    sortable: true
  }
];

export default class ListCar extends LightningElement {
  loading = false;
  columns = COLUMNS;
  selectedCar;
  searchIcon = IconsResource + "/utility-sprite/svg/symbols.svg#search";
  cars;
  wireResult;
  pageNumber;
  sortedField;
  sortDirection;
  sortType;
  pageSize;
  recordsToDisplay;
  showAdvancedSearch = false;
  advancedSearchText = "Advanced Search";
  isEmptyCar = false;

  @wire(getAllCar)
  getCars(result) {
    this.wireResult = result;
    if (result.data) {
      this.cars = result.data;
      this.isEmptyCar = this.cars.length === 0;
    } else if (result.error) {
      this.error = result.error;
    }
  }

  @wire(MessageContext)
  messageContext;

  handleSelectCar(evt) {
    if (evt.detail.selectedRows.length > 0) {
      const event = new CustomEvent("carselected", {
        detail: evt.detail.selectedRows[0]
      });
      this.dispatchEvent(event);
    }
  }

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        CAR_CHANNEL,
        (message) => this.handleMessage(message),
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  unsubscribeToMessageChannel() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  connectedCallback() {
    refreshApex(this.wireResult);
    this.subscribeToMessageChannel();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  handleMessage(message) {
    if (message) {
      refreshApex(this.wireResult);
    }
  }

  handleGlobalSearch(event) {
    this.loading = true;
    globalSearch({ searchText: event.target.value })
      .then((result) => {
        if (result.length > 0) {
          this.cars = result;
          this.isEmptyCar = false;
        } else {
          this.cars = [];
          this.recordsToDisplay = [];
          this.isEmptyCar = true;
        }
        this.loading = false;
      })
      .catch((error) => {
        this.loading = false;
        this.errors = reduceErrors(error);
      });
  }

  handlePagination(event) {
    this.recordsToDisplay = event.detail;
  }

  openAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    if (!this.showAdvancedSearch) {
      this.advancedSearchText = "Show Advanced Search";
    } else {
      this.advancedSearchText = "Close Advanced Search";
    }
  }

  handleAdvancedSearch(event) {
    this.loading = true;
    if (Object.entries(event.detail).length > 0) {
      searchCar({
        searchPlate: event.detail.plateNumber,
        searchBody: event.detail.body,
        searchModel: event.detail.model,
        searchBoughtDateFrom: event.detail.boughtDateFrom,
        searchBoughtDateTo: event.detail.boughtDateTo,
        searchNumSeat: event.detail.numSeat,
        searchFuelType: event.detail.fuelType,
        searchBrand: event.detail.brand
      })
        .then((result) => {
          console.log("OOOOO " + JSON.stringify(result));
          if (result.length > 0) {
            this.cars = result;
            this.isEmptyCar = false;
          } else {
            this.cars = [];
            this.recordsToDisplay = [];
            this.isEmptyCar = true;
          }
          this.loading = false;
        })
        .catch((error) => {
          console.log("ERROR Advanced Search " + JSON.stringify(error));
        });
    } else {
      getAllCar()
        .then((result) => {
          this.cars = result;
          this.loading = false;
          this.isEmptyCar = this.cars.length === 0;
        })
        .catch((error) => {
          this.loading = false;
          this.errors = reduceErrors(error);
        });
    }
  }

  handleSort(event) {
    this.pageNumber = 1;
    this.sortedField = event.detail.fieldName;
    this.sortDirection = event.detail.sortDirection;
    this.sortType = this.columns.find(
      (column) => this.sortedField === column.fieldName
    ).type;

    let parseData = JSON.parse(JSON.stringify(this.cars));
    let keyValue = (a) => {
      return a[this.sortedField];
    };
    let isReverse = this.sortDirection === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";

      return isReverse * ((x > y) - (y > x));
    });
    this.cars = parseData;
  }
}
