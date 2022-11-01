import LightningModal from 'lightning/modal';

export default class SelectRoomModal extends LightningModal  {
    handleCancel(){
        this.close('cancel');
    }
}