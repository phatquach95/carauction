import { api, LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import addCarToRoom from "@salesforce/apex/AuctionRoomController.addCarToRoom";
import AUCTION_CHANNEL from "@salesforce/messageChannel/auctionManagementChannel__c";
import { publish, MessageContext } from "lightning/messageService";

export default class createCar extends LightningElement {
  newFileWasUploaded;
  uploadedFilesUrl = [];
  uploadedCarId;
  @api
  selectedRoomId;
  @api
  startingPrice;

  @wire(MessageContext)
  messageContext;

  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: "Car created",
      message: "Car ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
    addCarToRoom({
      carId: event.detail.id,
      roomId: this.selectedRoomId,
      startingPrice: this.startingPrice
    }).then(() => {
      const payload = { roomId: this.selectedRoomId };
      publish(this.messageContext, AUCTION_CHANNEL, payload);
    });
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }

  handleError(event) {
    const evt = new ShowToastEvent({
      title: "Error while creating this car",
      message: "Error Message: " + event.detail.detail,
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

}
