public with sharing class CarController {
    @AuraEnabled(cacheable=true)
    public static List<Car__c> getAllCar(){
        try {
            return [SELECT Plate_No__c, Brand__c, Model__c, Fuel_Type__c, 
            Bought_Date__c, Number_of_Seats__c, Kilometers__c, Body__c
            FROM Car__c
            WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Car__c> getCarDetail(String carId){
        try {
            return [SELECT Plate_No__c, Brand__c, Model__c, Fuel_Type__c, 
            Bought_Date__c, Number_of_Seats__c, Kilometers__c, Body__c
            FROM Car__c
            WHERE Id = :carId
            WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Car__c> searchCar(String searchPlate, String searchBody, String searchModel,
    String searchBoughtDateFrom, String searchBoughtDateTo, String searchFuelType, Integer searchKilometers, 
    String searchNumSeat, String searchBrand){
        Date dateFrom = date.valueOf('1900-01-01');
        Date dateTo = date.valueOf('2999-01-01');
        if(!String.isBlank(searchBoughtDateFrom)){
           dateFrom = date.valueOf(searchBoughtDateFrom);
        }
        if(!String.isBlank(searchBoughtDateTo)){
            dateTo = date.valueOf(searchBoughtDateTo);
        }

        String searchPlateNumberQuery = '\'%%\'';
        if(searchPlate != null){
            searchPlateNumberQuery = '%' + searchPlate + '%';
        }

        String searchBodyQuery = '\'%%\'';
        if(searchBody != null){
            searchBodyQuery = '\'%' + searchBody + '%\'';
        }

        String searchModelQuery = '\'%%\'';
        if(searchModel != null){
            searchModelQuery = '\'%' + searchModel + '%\'';
        }

        String searchBrandQuery = '\'%%\'';
        if(searchBrand != null){
            searchBrandQuery = '\'%' + searchBrand + '%\'';
        }

        String searchFuelTypeQuery = ' \'%%\' OR Fuel_Type__c = NULL';
        if(searchFuelType != null){
            searchFuelTypeQuery = '\'%' + searchFuelType + '%\'';
        }

        String searchNumSeatQuery = ' \'%%\' OR Number_of_Seats__c = NULL';
        if(searchNumSeat != null){
            searchNumSeatQuery = '\'%' + searchNumSeat + '%\'';
        } 

        String dynamicQuery = 'SELECT Plate_No__c, Brand__c, Model__c, Fuel_Type__c, ' + 
        'Bought_Date__c, Number_of_Seats__c, Kilometers__c, Body__c ' +
        'FROM Car__c ' +
        'WHERE Plate_No__c LIKE ' + searchPlateNumberQuery + 
        ' AND Brand__c LIKE ' + searchBrandQuery + 
        ' AND Model__c LIKE ' + searchModelQuery + 
        ' AND Body__c LIKE ' + searchBodyQuery + 
        ' AND Bought_Date__c <= :dateTo ' + 
        ' AND Bought_Date__c >= :dateFrom ' + 
        ' AND ( Fuel_Type__c LIKE ' +  searchFuelTypeQuery + ')' +
        ' AND ( Number_of_Seats__c LIKE ' + searchNumSeatQuery + ')' +
        'WITH SECURITY_ENFORCED';
        try {
            return Database.query(dynamicQuery);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteCar(String carId){
        try {
            delete [SELECT Id
            FROM Car__c
            WHERE Id = :carId
            WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Car__c> globalSearch(String searchText){
        try {
        if(!String.isBlank(searchText)){
            String searchQuery = '%' + searchText + '%';
        
            return [SELECT Plate_No__c, Brand__c, Model__c, Fuel_Type__c, 
            Bought_Date__c, Number_of_Seats__c, Kilometers__c, Body__c
            FROM Car__c
            WHERE Plate_No__c LIKE :searchQuery OR Brand__c LIKE :searchQuery
            OR Model__c LIKE :searchQuery OR Fuel_Type__c LIKE :searchQuery
            OR Number_of_Seats__c LIKE :searchQuery OR Body__c LIKE :searchQuery
            WITH SECURITY_ENFORCED];
        } else {
            return [SELECT Plate_No__c, Brand__c, Model__c, Fuel_Type__c, 
            Bought_Date__c, Number_of_Seats__c, Kilometers__c, Body__c
            FROM Car__c
            WITH SECURITY_ENFORCED];
        }
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    private static String createWhere(String query, String columnNm, String enzanshi, String likeParam, String param) {
        String returnParam = '';
        if (String.isBlank(param)) {
            return query;
        }
        if (String.isBlank(query)) {
            returnParam = 'WHERE (';
        } else {
            returnParam = query + ' AND ';
        }
        if (''.equals(param)) {
            returnParam = returnParam + columnNm + ' ' + enzanshi + ' NULL';
        } else {
            returnParam = returnParam + columnNm + ' ' + enzanshi + ' \'' + likeParam + String.escapeSingleQuotes(param) + likeParam + '\'';
        }
        return returnParam;
    }
}
