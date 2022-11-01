import { api, LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class createRoom extends LightningElement {
  newFileWasUploaded;
  uploadedFilesUrl = [];
  uploadedRoomId;
  @api
  selectedRoomId;

  handleSuccess(event) {
    const evt = new ShowToastEvent({
      title: "Auction Room created",
      message: "Auction Room ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
    const inputFields = this.template.querySelectorAll("lightning-input-field");
    if (inputFields) {
      inputFields.forEach((field) => {
        field.reset();
      });
    }
  }

  handleError(event) {
    const evt = new ShowToastEvent({
      title: "Error while creating this auction room",
      message: "Error Message: " + event.detail.detail,
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

}
