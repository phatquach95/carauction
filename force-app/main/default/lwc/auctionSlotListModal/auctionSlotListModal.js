import { api } from "lwc";
import LightningModal from "lightning/modal";
import placeBid from "@salesforce/apex/AuctionRoomController.placeBid";
import getAuctionSlot from "@salesforce/apex/AuctionRoomController.getAuctionSlot";
import expireRoom from "@salesforce/apex/AuctionRoomController.expireRoom";

export default class AuctionSlotListModal extends LightningModal {
  bidStepOptions = [50, 100, 200, 500, 1000];
  slots;
  @api
  set auctionSlots(value) {
    this.slots = value;
  }

  get auctionSlots() {
    return getAuctionSlot({ roomId: this.roomId }).then((rslt) => {
      this.slots = rslt;
    });
  }

  @api
  roomId;
  @api
  roomEnd;
  selectedBidStep = 50;
  timer;
  expired = false;

  connectedCallback() {
    this.timer = setInterval(() => {
      let deadline = new Date(this.roomEnd);

      let ddate = deadline.getTime();

      let currentDateTime = new Date().getTime();

      let distance = ddate - currentDateTime;
      if (distance < 0) {
        clearInterval(this.timer);
        this.timer = "EXPIRED";
        this.expired = true;
        expireRoom({ roomId: this.roomId });
      } else {
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        this.timer =
          days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
      }
    }, 1000);
  }

  disconnectedCallback() {
    clearInterval(this.timer);
  }

  handleCancel() {
    this.close("cancel");
  }
  handleBidStep(event) {
    this.selectedBidStep = event.target.value;
  }

  handleBid(event) {
    placeBid({
      slotId: this.slots[event.target.value].Id,
      bidStep: this.selectedBidStep,
      roomId: this.roomId
    })
      .then((result) => {
        console.log("SUCCESS BID " + JSON.stringify(result));
        this.slots = result;
      })
      .catch((error) => {
        console.log("ERROR" + JSON.stringify(error));
      });
  }
}
