public with sharing class AccountUtils {
    public static List<Account> accountsByState(String state){
        return [SELECT Id, Name FROM Account WHERE BillingState = :state];
    }
}
