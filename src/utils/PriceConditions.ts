import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { ajax } from "@easterngraphics/wcf/modules/utils/async";
import { joinPath } from "@easterngraphics/wcf/modules/utils/string";

interface PriceProfilePluginRule
{
    manufacturer?: string;
    series?: string;
    baseArticleNumber?: string;
    finalArticleNumber?: string;
    itemId?: string;
    value: number;
    currency?: string;
}

/**
 * This function uses the PriceProfile plugin of the EAIWS to setup price conditions.
 */
export async function setupPriceConditions(pSession: EaiwsSession): Promise<void>
{
    //create purchase conditions
    const tPurchaseRules: Array<PriceProfilePluginRule> = [];
    const tRule1: PriceProfilePluginRule = {
        manufacturer: "EGROFFICE",
        series: "OFFICE2",
        value: -20, //20% discount
        currency: "" //empty or undefined means percantage
    };
    tPurchaseRules.push(tRule1);

    const tRule2 = {
        manufacturer: "EGROFFICE",
        series: "OFFICE2",
        baseArticleNumber: "4500", //office chair
        value: -30 //30% discount
    };
    tPurchaseRules.push(tRule2);

    //create sales conditions
    const tSalesRules = [];
    const tRule3 = {
        manufacturer: "EGROFFICE",
        series: "OFFICE2",
        value: 10 //10% add charage
    };
    tSalesRules.push(tRule3);

    //set conditions at PriceProfile-Plugin
    const tPluginUrl = joinPath(pSession.baseUrl, "EAIWS/plugins/PriceProfile/v1", pSession.sessionId) + "/";
    await ajax("PUT", tPluginUrl + "PDIP00", tPurchaseRules, { dataType: "json" }); //purchase
    await ajax("PUT", tPluginUrl + "DIP10", tSalesRules, { dataType: "json" }); //sales
}