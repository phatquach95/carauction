import { LightningElement } from "lwc";

export default class carManagement extends LightningElement {
  selectedCarId;
  selectedRoomId;
  startingPrice;
  toggleCreate = false;
  toggleList = true;
  isEditing = false;

  handleCarSelected(evt) {
    this.selectedCarId = evt.detail.Id;
  }

  handleRoomSelected(evt){
    this.selectedRoomId = evt.detail;
  }

  handleInputPrice(evt){
    this.startingPrice = evt.detail;
  }

  handleToggleCreate(){
    this.toggleCreate = !this.toggleCreate;
    this.toggleList = !this.toggleList;
    this.selectedCarId = null;
  }

  handleToggleList(){
    this.toggleCreate = !this.toggleCreate;
    this.toggleList = !this.toggleList;
  }

}
