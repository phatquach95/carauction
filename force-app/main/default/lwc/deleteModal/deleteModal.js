import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class DeleteModal extends LightningModal  {
    @api carId;

    handleOkay() {
        this.close('deleteSubmit');
    }

    handleCancel(){
        this.close('cancel');
    }
}