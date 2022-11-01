import getCarDetail from "@salesforce/apex/CarController.getCarDetail";
import { LightningElement, api, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { publish, MessageContext } from "lightning/messageService";
import CAR_CHANNEL from "@salesforce/messageChannel/carManagementChannel__c";
import DeleteModal from "c/deleteModal";
import deleteCar from "@salesforce/apex/CarController.deleteCar";

export default class CarDetail extends LightningElement {
  car;
  errors;
  loading = false;
  isEditing = false;

  _carId = undefined;
  @api get carId() {
    return this._carId;
  }

  set carId(value) {
    if (value) {
      this.loading = true;
      this._carId = value;
      this.isEditing = false;
      getCarDetail({ carId: this._carId })
        .then((carDetail) => {
          this.car = carDetail[0];
          this.loading = false;
        })
        .catch((error) => {
          this.errors = reduceErrors(error);
        });
    } else {
      this.car = null;
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  handleDelete() {
    DeleteModal.open({
      size: 'small',
      carId: this._carId
    }).then((result) => {
      if (result === "deleteSubmit") {
        try {
          deleteCar({ carId: this.carId }).then(() => {
            const payload = { recordId: this.carId };
            publish(this.messageContext, CAR_CHANNEL, payload);
            const evt = new ShowToastEvent({
              title: "Car deleted",
              message: "Record ID: " + this.carId,
              variant: "success"
            });
            this.dispatchEvent(evt);
            this.car = null;
          });
        } catch (error) {
          this.errors = reduceErrors(error);
        }
      }
    });
  }

  handleSuccessEdit(event) {
    this.loading = false;
    this.isEditing = !this.isEditing;
    const payload = { recordId: this._carId };
    publish(this.messageContext, CAR_CHANNEL, payload);
    const evt = new ShowToastEvent({
      title: "Car edited",
      message: "Record ID: " + event.detail.id,
      variant: "success"
    });
    this.dispatchEvent(evt);
  }

  handleError(event) {
    const evt = new ShowToastEvent({
      title: "Error while creating this car",
      message: "Error Message: " + event.detail.detail,
      variant: "error"
    });
    this.dispatchEvent(evt);
  }

  @wire(MessageContext)
  messageContext;
}
