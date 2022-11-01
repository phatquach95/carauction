public with sharing class AuctionRoomController {
    @AuraEnabled(cacheable=true)
    public static List<Auction_Room__c> getAllAuctionRoom(){
        try {
            return [SELECT Name, Start__c, End__c, Status__c, 
            Auction_Room_Slot__c
            FROM Auction_Room__c
            WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void addCarToRoom(String carId, String roomId, Integer startingPrice){
        try {
            Auction_Slot__c auctionSlot = new Auction_Slot__c();
            auctionSlot.Auction_Room__c = roomId;
            auctionSlot.CarId__c = carId;
            auctionSlot.HighestBid__c = startingPrice;
            insert auctionSlot;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Auction_Room__c> getRoomDetail(String roomId){
        try {
            return [SELECT Id, Name, Start__c, End__c, Auction_Room_Slot__c, Status__c
                    FROM Auction_Room__c
                    WHERE Id = :roomId
                    WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Auction_Room__c> searchRoom(String searchName, String searchStart, String searchEnd, String searchStatus){
        Date dateFrom = date.valueOf('1900-01-01');
        Date dateTo = date.valueOf('2999-01-01');
        if(!String.isBlank(searchStart)){
           dateFrom = date.valueOf(searchStart);
        }
        if(!String.isBlank(searchEnd)){
            dateTo = date.valueOf(searchEnd);
        }

        String searchNameQuery = '\'%%\'';
        if(searchName != null){
            searchNameQuery = '\'%' + searchName + '%\'';
        }

        String searchStatusQuery = '\'%%\'';
        if(searchStatus != null){
            searchStatusQuery = '\'%' + searchStatus + '%\'';
        }

        String dynamicQuery = 'SELECT Name, Start__c, End__c, Status__c, ' + 
        'FROM Auction_Room__c ' +
        'WHERE Name LIKE ' + searchNameQuery + 
        ' AND Status__c LIKE ' + searchStatusQuery + 
        ' AND Bought_Date__c <= :dateTo ' + 
        ' AND Bought_Date__c >= :dateFrom ' + 
        'WITH SECURITY_ENFORCED';
        try {
            return Database.query(dynamicQuery);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Auction_Room__c> globalSearch(String searchText){
        try {
        if(!String.isBlank(searchText)){
            String searchQuery = '%' + searchText + '%';
            return [SELECT Name, Start__c, End__c, Auction_Room_Slot__c, 
            Status__c
            FROM Auction_Room__c
            WHERE Name LIKE :searchQuery 
            WITH SECURITY_ENFORCED];
        } else {
            return [SELECT Name, Start__c, End__c, Auction_Room_Slot__c, 
            Status__c
            FROM Auction_Room__c
            WITH SECURITY_ENFORCED];
        }
    } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
    }
    }

    @AuraEnabled
    public static List<Auction_Slot__c> getAuctionSlot(String roomId){
        try {
            return [SELECT Id, Auction_Room__c, 
                    CarId__r.Brand__c, CarId__r.Model__c, CarId__r.Body__c, 
                    CarId__r.Fuel_Type__c, CarId__r.Number_of_Seats__c, CarId__r.Plate_No__c,
                    CarId__r.Bought_Date__c, HighestBid__c, Auction_Room__r.End__c
                    FROM Auction_Slot__c
                    WHERE Auction_Room__c = :roomId
                    WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Auction_Slot__c> placeBid(String slotId, Integer bidStep, String roomId){
        try {
            Auction_Slot__c slot =  [SELECT Id, HighestBid__c
                    FROM Auction_Slot__c
                    WHERE Id = :slotId
                    WITH SECURITY_ENFORCED];
            slot.HighestBid__c += bidStep;
            update slot;
            return [SELECT Id, Auction_Room__c, 
            CarId__r.Brand__c, CarId__r.Model__c, CarId__r.Body__c, 
            CarId__r.Fuel_Type__c, CarId__r.Number_of_Seats__c, CarId__r.Plate_No__c,
            CarId__r.Bought_Date__c, HighestBid__c
            FROM Auction_Slot__c
            WHERE Auction_Room__c = :roomId
            WITH SECURITY_ENFORCED];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void expireRoom(String roomId){
        try {
            Auction_Room__c room =  [SELECT Id
                    FROM Auction_Room__c
                    WHERE Id = :roomId
                    WITH SECURITY_ENFORCED];
                    room.Status__c = 'Closed';
            update room;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
