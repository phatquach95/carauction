import { LightningElement } from "lwc";
import { wire } from "lwc";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import FUELTYPE_FIELD from "@salesforce/schema/Car__c.Fuel_Type__c";
import BODY_FIELD from "@salesforce/schema/Car__c.Body__c";
import NUMSEAT_FIELD from "@salesforce/schema/Car__c.Number_of_Seats__c";

export default class AdvancedSearchModal extends LightningElement {
  bodyPicklistValues;
  fuelTypePicklistValues;
  numSeatPicklistValues;
  plateNumber;
  brand;
  model;
  body;
  numSeat;
  fuelType;
  boughtDateFrom;
  boughtDateTo;

  searchFields = { };

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA", // Default record type Id
    fieldApiName: FUELTYPE_FIELD
  })
  getFuelTypePicklistValues({ error, data }) {
    if (data) {
      this.fuelTypePicklistValues = data.values;
    } else if (error) {
      console.log("ERROR Picklist " + error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA", // Default record type Id
    fieldApiName: BODY_FIELD
  })
  getBodyPicklistValues({ error, data }) {
    if (data) {
      this.bodyPicklistValues = data.values;
    } else if (error) {
      console.log("ERROR Picklist " + error);
    }
  }

  @wire(getPicklistValues, {
    recordTypeId: "012000000000000AAA", // Default record type Id
    fieldApiName: NUMSEAT_FIELD
  })
  getNumSeatPicklistValues({ error, data }) {
    if (data) {
      this.numSeatPicklistValues = data.values;
    } else if (error) {
      console.log("ERROR Picklist " + error);
    }
  }

  handleFieldChange(event) {
    if (event.target.name !== "kilometers") {
      if (
        event.target.name === "boughtDateFrom" ||
        event.target.name === "boughtDateTo" ||
        event.target.name === "fuelType" ||
        event.target.name === "numSeat"
      ) {
        this.searchFields[event.target.name] = event.target.value;
      } else {
        this.searchFields[event.target.name] = "%" + event.target.value + "%";
      }
    }
  }

  handleAdvancedSearch() {
    const event = new CustomEvent("advancedsearch", {
      detail: this.searchFields
    });
    this.dispatchEvent(event);
  }

  handleReset() {
    this.template.querySelectorAll("lightning-input").forEach((element) => {
      element.value = null;
    });

    this.template.querySelectorAll("lightning-combobox").forEach((element) => {
      element.value = null;
    });

    this.searchFields = {};
  }
}
