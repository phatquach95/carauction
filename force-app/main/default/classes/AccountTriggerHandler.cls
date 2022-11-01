public with sharing class AccountTriggerHandler {
    public static List<Account> CreateAccounts(List<Account> accList){
        List<Account> saveList = new List<Account>();
        for(Account acc : accList){
            acc.ShippingState = acc.BillingState;
            saveList.add(acc);
        }
        return saveList;
    }
}
