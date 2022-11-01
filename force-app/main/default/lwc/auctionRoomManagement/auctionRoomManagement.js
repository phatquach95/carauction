import { LightningElement } from "lwc";

export default class AuctionRoomManagement extends LightningElement {
  selectedRoomId;
  toggleCreate = false;
  toggleList = true;
  isEditing = false;

  handleRoomSelected(evt){
    this.selectedRoomId = evt.detail.Id;
  }

  handleToggleCreate(){
    this.toggleCreate = !this.toggleCreate;
    this.toggleList = !this.toggleList;
    this.selectedRoomId = null;
  }

  handleToggleList(){
    this.toggleCreate = !this.toggleCreate;
    this.toggleList = !this.toggleList;
  }

}
