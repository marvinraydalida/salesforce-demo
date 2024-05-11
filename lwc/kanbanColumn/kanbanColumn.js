import getKanbanTask from '@salesforce/apex/CustomTaskController.getKanbanTask';
import updateTaskStatus from '@salesforce/apex/CustomTaskController.updateTaskStatus';
import { refreshApex } from '@salesforce/apex';
import { subscribe, MessageContext } from 'lightning/messageService';
import FORM_SUCCESS_CHANNEL from '@salesforce/messageChannel/FormSuccessChannel__c';
import { NavigationMixin } from 'lightning/navigation';

import { LightningElement, api, track, wire } from 'lwc';

export default class KanbanColumn extends NavigationMixin(LightningElement) {

    @api kanbanStatus
    @api recordId
    @api isDropped = false

    @wire(MessageContext)
    messageContext;

    subscription;

    @wire(getKanbanTask, {kanbanStatus: "$kanbanStatus", recordId: "$recordId"})
    tasks

    @wire(updateTaskStatus)
    updateTaskStatus

    @api
    handleRefresh() {
        refreshApex(this.tasks);
    }

    renderedCallback() {
        console.log('hey rendered');
        const unorederedList = this.template.querySelector("ul");
        console.log("unorederedList:>>",unorederedList);

        unorederedList.addEventListener('dragover', this.dragOver.bind(this));
        unorederedList.addEventListener('drop', this.drop.bind(this));
        console.log('added listener');

        const items = unorederedList.querySelectorAll("li");
        console.log('items :>>', items);

        items.forEach((item) => {
            item.addEventListener('dragstart', this.dragStart.bind(this));
            console.log('item added listener')
        })
    }

    dragStart(event) {
        event.stopPropagation();
        console.log("start drag event :>>", event);
        console.log("dragged id :>>", event.target.id)
        event.dataTransfer.setData('itemId', event.target.id);
        event.dataTransfer.setData('status', this.kanbanStatus);
    }

    dragOver(event) {
        event.preventDefault();
        console.log('dragging over');
    }

    async drop(event) { 
        const id = event.dataTransfer.getData('itemId');
        const status = event.dataTransfer.getData('status');
        if(this.kanbanStatus != status && !this.isDropped) {
            console.log(`dropped at ${this.kanbanStatus}`);
            console.log('id :>>', id);
            //Prevents multiple drop event and update
            this.isDropped = true;

            try {
                await updateTaskStatus({ kanbanStatus: this.kanbanStatus, doppedRecordId: id });
                let refreshKanban = CustomEvent(
                    'refresh',
                    {
                        detail: {
                            from: status,
                            to: this.kanbanStatus
                        }
                    }
                );
                this.dispatchEvent(refreshKanban);
            }
            catch(e) {

            }
        }
    }

    connectedCallback() {
        console.log('test connected id sadsa', this.recordId);
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        this.subscription = subscribe(this.messageContext, FORM_SUCCESS_CHANNEL, (message) => {
            this.handleMessage(message);
        });
    }

    handleMessage(message) {
        console.log('Check if subscribed 🚀🚀🚀🚀');
        this.handleRefresh();
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