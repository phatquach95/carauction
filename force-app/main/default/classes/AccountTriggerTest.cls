@isTest
public class AccountTriggerTest {
    @isTest 
    public static void testCreateAccount(){
        List<Account> accList = new List<Account>();
        for(Integer i = 0; i < 200; i++){
            Account acc = new Account(Name='Name ' + i, BillingState='CA');
            accList.add(acc);
        }
        insert accList;
    }
}
