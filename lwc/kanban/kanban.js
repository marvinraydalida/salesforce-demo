import getStatus from '@salesforce/apex/CustomTaskController.getStatus';
import { LightningElement, api, wire } from 'lwc';

export default class Kanban extends LightningElement {

    @api recordId

    @wire(getStatus)
    statusList

   handleKanbanRefresh(event) {
        console.log('event handle refresh', event);
        console.log('from :>>', event.detail.from);
        console.log('to :>>', event.detail.to)
        const kanbanColumns = this.template.querySelectorAll('c-kanban-column');
        console.log('kanbanColumns :>>', kanbanColumns );
        kanbanColumns.forEach((column) => {
            if(column.kanbanStatus == event.detail.from || column.kanbanStatus == event.detail.to) {
                column.handleRefresh();
                column.isDropped = false;
            }
        })
    }

    get status() {
        return this.statusList.data;
    }

    get spanSize() {
        return `slds-size_1-of-${this.statusList.data.length}`;
    }

    get headerSpanSize() {
        return `slds-size_1-of-${this.statusList.data.length} kanban-header`;
    }
}