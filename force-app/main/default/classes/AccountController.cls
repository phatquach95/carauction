public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        try {
            return [
                SELECT Name, AnnualRevenue, Industry
                FROM Account
                WITH SECURITY_ENFORCED
                ORDER BY Name
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
  
}
