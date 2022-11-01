import { LightningElement, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";
import NAME_FIELD from "@salesforce/schema/Auction_Room__c.Name";
import START_FIELD from "@salesforce/schema/Auction_Room__c.Start__c";
import END_FIELD from "@salesforce/schema/Auction_Room__c.End__c";
import SLOT_FIELD from "@salesforce/schema/Auction_Room__c.Auction_Room_Slot__c";
import STATUS_FIELD from "@salesforce/schema/Auction_Room__c.Status__c";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import AUCTION_CHANNEL from "@salesforce/messageChannel/auctionManagementChannel__c";
import { refreshApex } from "@salesforce/apex";
import IconsResource from "@salesforce/resourceUrl/iconsSource";
import globalSearch from "@salesforce/apex/AuctionRoomController.globalSearch";
import searchRoom from "@salesforce/apex/AuctionRoomController.searchRoom";
import getAllAuctionRoom from "@salesforce/apex/AuctionRoomController.getAllAuctionRoom";

const COLUMNS = [
  {
    label: "Name",
    fieldName: NAME_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Start Date",
    fieldName: START_FIELD.fieldApiName,
    type: "date",
    sortable: true,
    typeAttributes: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  {
    label: "End Date",
    fieldName: END_FIELD.fieldApiName,
    type: "date",
    sortable: true,
    typeAttributes: {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  },
  {
    label: "Number of Slot",
    fieldName: SLOT_FIELD.fieldApiName,
    type: "text",
    sortable: true
  },
  {
    label: "Status",
    fieldName: STATUS_FIELD.fieldApiName,
    type: "text",
    sortable: true
  }
];

export default class auctionRoomHomeList extends LightningElement {
  loading = false;
  columns = COLUMNS;
  selectedRoom;
  searchIcon = IconsResource + "/utility-sprite/svg/symbols.svg#search";
  auctionRooms;
  wireResult;
  pageNumber;
  sortedField;
  sortDirection;
  sortType;
  pageSize;
  recordsToDisplay;
  showAdvancedSearch = false;
  advancedSearchText = "Advanced Search";
  isEmptyRoom = false;

  @wire(getAllAuctionRoom)
  getAllAuctionRooms(result) {
    this.wireResult = result;
    if (result.data) {
      this.auctionRooms = result.data;
      this.isEmptyRoom = this.auctionRooms.length === 0;
    } else if (result.error) {
      this.error = result.error;
    }
  }

  @wire(MessageContext)
  messageContext;

  handleSelectRoom(evt) {
    if (evt.detail.selectedRows.length > 0) {
      const event = new CustomEvent("roomselected", {
        detail: evt.detail.selectedRows[0]
      });
      this.dispatchEvent(event);
    }
  }

  subscribeToMessageChannel() {
    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        AUCTION_CHANNEL,
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
          this.auctionRooms = result;
          this.isEmptyRoom = false;
        } else {
          this.auctionRooms = [];
          this.recordsToDisplay = [];
          this.isEmptyRoom = true;
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
      searchRoom({
        searchName: event.detail.name,
        searchStart: event.detail.start,
        searchEnd: event.detail.end,
        searchStatus: event.detail.status
      })
        .then((result) => {
          if (result.length > 0) {
            this.auctionRooms = result;
            this.isEmptyRoom = false;
          } else {
            this.auctionRooms = [];
            this.recordsToDisplay = [];
            this.isEmptyRoom = true;
          }
          this.loading = false;
        })
        .catch((error) => {
          console.log("ERROR Advanced Search " + JSON.stringify(error));
        });
    } else {
      getAllAuctionRoom()
        .then((result) => {
          this.auctionRooms = result;
          this.loading = false;
          this.isEmptyRoom = this.auctionRooms.length === 0;
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

    let parseData = JSON.parse(JSON.stringify(this.auctionRooms));
    let keyValue = (a) => {
      return a[this.sortedField];
    };
    let isReverse = this.sortDirection === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";

      return isReverse * ((x > y) - (y > x));
    });
    this.auctionRooms = parseData;
  }
}
