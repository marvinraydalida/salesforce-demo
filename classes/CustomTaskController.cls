public with sharing class CustomTaskController {
    // public CustomTaskController() {

    // }
    @AuraEnabled(cacheable=true)
    public static List<String> getStatus() {
        List<String> picklistValues = new List<String>();
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get('CustomTask__c');
        SObject objectInstance = targetType.newSObject();
        Schema.sObjectType sObjectType = objectInstance.getSObjectType();
        Schema.DescribeSObjectResult sObjectDescribe = sObjectType.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = sObjectDescribe.fields.getMap();
        List<Schema.PicklistEntry> picklistEntries = fieldMap.get('Status__c').getDescribe().getPickListValues();
        for (Schema.PicklistEntry entry : picklistEntries) {
            picklistValues.add(entry.getValue());
        }
        return picklistValues;
    }

    @AuraEnabled(cacheable=true)
    public static List<CustomTask__c> getKanbanTask(String kanbanStatus, Id recordId) {
        System.debug('kanbanStatus: ');
        System.debug(kanbanStatus);
        System.debug('\n ####################################################');
        System.debug('recordId: ');
        System.debug(recordId);
        return [SELECT Id, Name, Description__c, Status__c, Parent_Task__c FROM CustomTask__c WHERE Status__c = :kanbanStatus AND Parent_Task__c = :recordId ORDER BY Name DESC];
    }

    @AuraEnabled
    public static CustomTask__c updateTaskStatus(String kanbanStatus, String doppedRecordId) {
        List<String> splitRecordId = doppedRecordId.split('-');
        Id recordId = Id.valueOf(splitRecordId[0]);
        CustomTask__c droppedTask = [SELECT Id, Status__c FROM CustomTask__c WHERE Id  = :recordId];
        droppedTask.Status__c = kanbanStatus;
        update droppedTask;
        return droppedTask;
    }
}