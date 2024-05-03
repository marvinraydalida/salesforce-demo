import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getStatus from '@salesforce/apex/CustomTaskController.getStatus';
import FORM_SUCCESS_CHANNEL from '@salesforce/messageChannel/FormSuccessChannel__c';
import { publish, MessageContext } from 'lightning/messageService';

export default class CustomTaskForm extends LightningElement {

    @wire(getStatus)
    statusList

    @wire(MessageContext)
    messageContext;

    handleReset(event) {
        const inputFields = this.template.querySelectorAll("lightning-input-field");
        if (inputFields) {
            inputFields.forEach((field) => {
                field.reset();
            });
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = {...event.detail.fields};
        console.log('Submit status :>>', this.statusList.data[0]);
        fields.Status__c = this.statusList.data[0];
        this.refs.customTaskForm.submit(fields);
    }

    handleSuccess() {
        const toastEvent = new ShowToastEvent({
            title: 'Success 🎉',
            message: "Successfully Created Task",
            variant: "success"
        })

        this.dispatchEvent(toastEvent);
        this.handleReset();
        publish(this.messageContext, FORM_SUCCESS_CHANNEL, {});
    }
}