import getKanbanTask from '@salesforce/apex/CustomTaskController.getKanbanTask';
import { refreshApex } from '@salesforce/apex';
import { subscribe, MessageContext } from 'lightning/messageService';
import FORM_SUCCESS_CHANNEL from '@salesforce/messageChannel/FormSuccessChannel__c';
import { NavigationMixin } from 'lightning/navigation';

import { LightningElement, api, track, wire } from 'lwc';

export default class KanbanColumn extends NavigationMixin(LightningElement) {

    @api kanbanStatus
    @api recordId

    @wire(MessageContext)
    messageContext;

    subscription;

    @wire(getKanbanTask, {kanbanStatus: "$kanbanStatus", recordId: "$recordId"})
    tasks

    connectedCallback() {
        console.log('test connected id', this.recordId);
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(this.messageContext, FORM_SUCCESS_CHANNEL, (message) => {
            this.handleMessage(message);
        });
    }

    handleMessage(message) {
        console.log('Check if subscribed 🚀🚀🚀🚀');

        refreshApex(this.tasks);
    }

    disconnectedCallback() {
        if (this.subscription) {
            // this.subscription.unsubscribe();
            this.subscription = null;
        }
    }

    handleNavigateToRecord(event) {
        event.preventDefault();

        const recordId = event.target.dataset.recordId;
        console.log('check navigationId :>>', recordId)
        console.log('check event :>> ',event.target)
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    }

    get getTasks() {
        return this.tasks ? this.tasks.data : [];
    }
}