import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { AddressData, CommAddress, ContactData, ProjectData } from "@easterngraphics/wcf/modules/eaiws/project";

export async function getAndSetEosProjectData(pSession: EaiwsSession): Promise<void>
{
    var tData = await pSession.project.getProjectData() ?? new ProjectData();

    var dateValidTo = new Date();
    dateValidTo.setDate(dateValidTo.getDate() + 30); //parseInt(document.eosInfo._pcon_overdue_days)); // 30 days from creation date - to change @@@

    return pSession.project.setProjectData(tData);
}

/**
     * Fill header data with CE data
     */
    // @@@ GL - from setExampleProjectData to setEosProjectData - from opportunity or quote
export function setEosProjectData(pSession: EaiwsSession): Promise<void>
{
    const tData = new ProjectData();
    //@@@ GL - debugger
    //debugger;
    var dateValidTo = new Date();
    dateValidTo.setDate(dateValidTo.getDate() + 30); //parseInt(document.eosInfo._pcon_overdue_days)); // 30 days from creation date - to change @@@
    if (document.eosInfo._entity == "opportunity" || document.eosInfo._entity == "quote")
    {
        tData.projectNumber = document.eosInfo.oData.o_number;          // Quote number
        tData.projectName = document.eosInfo.oData.o_name;              // Name name
        tData.created = new Date().toISOString();                      // Quote Date
        tData.validToDate = dateValidTo.toISOString();                 // Quote valid until
        tData.projectState = "Undefined";                // Status
        //debugger; //@@@
        tData.languages = [document.eosInfo.oData.o_lang]; // ["IT", "DE", "EN"];                        // Quote Language/Languages // 04.04.2023 - set language from salesperson

        tData.externalReferenceNumber = document.eosInfo.oData.o_guid;      // Ext. Ref. Number - Guid from CRM
        //tData.externalReferenceText = "ext - ref - text ??";              // Ext. Ref. Text
        tData.keywords = ["MasterTent", "Zingerle"];     // Keywords
        tData.description = document.eosInfo.oData.o_descr;               // description
        tData.company = document.eosInfo.oData.a_name;                 // company name
        tData.customerNumber = document.eosInfo.oData.a_accnumber;                 // customer number
        //tData.projectId = "123456";                      // ID
        // Header text, End Text
        //tData.projectTexts = [
        //    createProjectText("This is my header text", "HeaderText"),
        //    createProjectText("This is my footer text", "FooterText")
        //;
        //tData.customerRelatedRemarks = "test crr";


        //@@@qui
        /*
                eosObj.o_legalentity = result["eoslib_legalentityid"]["eoslib_code"];
                eosObj.o_pricelist = result["pricelevelid"]["mas_code"];
                eosObj.o_currency = result["transactioncurrencyid"]["isocurrencycode"];
                eosObj.o_salesperson_code = result["eoslib_ExternalUserId"]["eoslib_code"];
                eosObj.o_salesperson_name = result["eoslib_ExternalUserId"]["eoslib_fullname"];
                eosObj.o_paymentterms = result["eoslib_paymenttermid"]["eoslib_name"];

                eosObj.a_lang = result["customerid_account"]["eos_languageid"]["eos_code"];

                eosObj.c_street = result["mas_contactid"]["address1_line1"];
                eosObj.c_city = result["mas_contactid"]["address1_city"];
                eosObj.c_zip = result["mas_contactid"]["address1_postalcode"];
                eosObj.c_email = result["mas_contactid"]["emailaddress1"];
                eosObj.c_country = result["mas_contactid"]["eos_countryid"]["eos_code"];        
        */                        
    }


    //tData.addresses array of AddressData

    return pSession.project.setProjectData(tData);
}

/**
     * Fill header data with example customer information.
     */
export function setEosCustomerAddress(pSession: EaiwsSession): Promise<void>{
    //debugger;
    //gSession.project.removeAddressData("SoldTo"); // @@@ Fabian
    // Address and contact
    const tCommAddr = new CommAddress();
    tCommAddr.scope = "Business";
    tCommAddr.type = "Mobile";
    tCommAddr.value = document.eosInfo.oData.c_phone;
    const tCommAddrEmail = new CommAddress();
    tCommAddrEmail.scope = "Business";
    tCommAddrEmail.type = "EMail";
    tCommAddrEmail.value = document.eosInfo.oData.c_email;

    const tContact = new ContactData();
    tContact.contactType = "Support";
    tContact.firstName = document.eosInfo.oData.c_firstname;
    tContact.lastName = document.eosInfo.oData.c_lastname;
    tContact.title = "Mrs./Mr.";
    // tContact.commAddresses = [tCommAddrEmail, tCommAddr]; // @@@ commented 23.05.2023
    //tContact.commAddresses = [tCommAddr];

    const tAddress = new AddressData();
    tAddress.addressType = "SoldTo";
    tAddress.name1 = document.eosInfo.oData.a_name;
    //tAddress.street = document.eosInfo.oData.a_street; // @@@ commented 23.05.2023
    //tAddress.postalCode = document.eosInfo.oData.a_zip; // @@@ commented 23.05.2023
    //tAddress.location = document.eosInfo.oData.a_city; // @@@ commented 23.05.2023
    //tAddress.countryCode = document.eosInfo.oData.a_country; // @@@ commented 23.05.2023
    tAddress.contacts = [tContact];

    return pSession.project.setAddressData(tAddress);
}