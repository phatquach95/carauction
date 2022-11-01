import getAllAuctionRoom from "@salesforce/apex/AuctionRoomController.getAllAuctionRoom";
import { LightningElement, wire } from "lwc";
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import AUCTION_CHANNEL from "@salesforce/messageChannel/auctionManagementChannel__c";
import { getRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import SelectRoomModal from "c/selectRoomModal";

export default class AuctionRoomList extends LightningElement {
  loading = false;
  selectedRoom;
  auctionRooms;
  wireResult;
  selectedRoomId = null;
  isSelected = false;
  titleText = "Auction Room List";
  startingPrice = 0;

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, {
    recordId: "$selectedRoomId",
    fields: ["Auction_Room__c.Id"]
  })
  auctionRoom;

  @wire(getAllAuctionRoom)
  getCars(result) {
    this.wireResult = result;
    if (result.data) {
      this.auctionRooms = result.data;
      this.auctionRooms = this.auctionRooms.map((room) => ({
        ...room,
        statusStyle:
          room.Status__c === "Waiting"
            ? "background-color: brown"
            : room.Status__c === "Opening"
            ? "background-color: green"
            : room.Status__c === "Closed"
            ? "background-color: red"
            : "background-color: black"
      }));
    } else if (result.error) {
      this.error = result.error;
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
    this.subscribeToMessageChannel();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
  }

  handleMessage(message) {
    if (message) {
      refreshApex(this.auctionRoom);
    }
  }

  handleChooseRoom(event) {
    if (this.auctionRooms[event.target.value].Status__c === "Closed") {
      SelectRoomModal.open({
        size: "small"
      }).then((response) => {
        console.log("Close Modal " + response);
      });
    } else {
      const message = new CustomEvent("roomselected", {
        detail: this.auctionRooms[event.target.value].Id
      });
      this.dispatchEvent(message);
      this.titleText = "Auction Room Detail";
      this.isSelected = true;
      this.selectedRoomId = this.auctionRooms[event.target.value].Id;
    }
  }

  handleInputPrice(event) {
    this.startingPrice = event.target.value;
    const message = new CustomEvent("inputprice", {
      detail: this.startingPrice
    });
    this.dispatchEvent(message);
  }

  handleCancelSelected() {
    refreshApex(this.wireResult);
    this.titleText = "Auction Room List";
    this.isSelected = false;
    this.selectedRoomId = null;
  }
}
