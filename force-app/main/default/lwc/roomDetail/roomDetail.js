import { LightningElement, api, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from "lightning/messageService";
import AUCTION_CHANNEL from "@salesforce/messageChannel/auctionManagementChannel__c";
import getRoomDetail from "@salesforce/apex/AuctionRoomController.getRoomDetail";
import AuctionSlotListModal from "c/auctionSlotListModal";
import getAuctionSlot from "@salesforce/apex/AuctionRoomController.getAuctionSlot";

export default class roomDetail extends LightningElement {
  room;
  errors;
  loading = false;
  isEditing = false;

  _roomId = undefined;
  @api get roomId() {
    return this._roomId;
  }

  set roomId(value) {
    if (value) {
      this.loading = true;
      this._roomId = value;
      this.isEditing = false;
      getRoomDetail({ roomId: this._roomId })
        .then((result) => {
          this.room = result[0];
          this.loading = false;
        })
        .catch((error) => {
          this.errors = reduceErrors(error);
        });
    } else {
      this.room = null;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  openRoomModal(){
    getAuctionSlot({roomId: this.roomId}).then((result) => {
      AuctionSlotListModal.open({
        size: "small",
        auctionSlots: result,
        roomId: this.roomId,
        roomEnd: result[0].Auction_Room__r.End__c
      }).then((response) => {
        console.log("Response Modal " + response)
      })
    })
  }

  handleSuccessEdit(event) {
    this.loading = false;
    this.isEditing = !this.isEditing;
    const payload = { recordId: this._roomId };
    publish(this.messageContext, AUCTION_CHANNEL, payload);
    const evt = new ShowToastEvent({
      title: "Auction Room edited",
      message: "Record ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
  }

  handleError(event) {
    const evt = new ShowToastEvent({
      title: "Error while creating this auction room",
      message: "Error Message: " + event.detail.detail,
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

  @wire(MessageContext)
  messageContext;
}
