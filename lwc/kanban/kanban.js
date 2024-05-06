import getStatus from '@salesforce/apex/CustomTaskController.getStatus';
import { LightningElement, wire } from 'lwc';

export default class Kanban extends LightningElement {

    @wire(getStatus)
    statusList

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