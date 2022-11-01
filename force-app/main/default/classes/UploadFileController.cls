public with sharing class UploadFileController {
    @AuraEnabled
    public static void uploadFile(String carId, List<String> images) {
        // // Decoding the base64Data
        // base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
        // ContentVersion cv = new ContentVersion();
        // cv.Title = fileName;
        // cv.PathOnClient = '/' + fileName;
        // cv.FirstPublishLocationId = recordId;
        // cv.VersionData = EncodingUtil.base64Decode(base64Data);
        // cv.IsMajorVersion = true;
        // Insert cv;
        // return 'File upload successfully!';

        // List<ContentVersion> imagesList = new List<ContentVersion>();
        // for(String image : images){
        //     ContentVersion.add(new ContentVersion(Car__c= carId, Url= image));
        // }
        // if(imagesList.size() > 0){
        //     insert imagesList;
        // }
    }
}
