import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { ajax } from "@easterngraphics/wcf/modules/utils/async";
import { joinPath } from "@easterngraphics/wcf/modules/utils/string";

import { COLUMN_EXT_ITEM_NUMBER, COLUMN_ITEM_IMAGE, PRICING_PROCEDURE_NAME, REPORT_EXPORT_TEMPLATE } from "../Config";

/**
 * This function exports the whole project/session as an OBK file.
 */
export async function exportOBK(pSession: EaiwsSession): Promise<string>
{
    //get OBK url
    const tUrl = await pSession.session.saveSession(null);
    return (tUrl);
}

/**
 * This function exports all items as an OBX file.
 */
export async function exportOBX(pSession: EaiwsSession): Promise<string>
{
    //get all basket items
    const tItems = await pSession.basket.getAllItems();

    //get url of OBX
    const tItemIdArray = tItems.map((item) => item.itemId);
    const tUrl = await pSession.basket.copy(tItemIdArray);
    return (tUrl);
}

/**
 * This function generates a pdf report.
 */
export async function exportPDF(pSession: EaiwsSession): Promise<string>
{
    interface GenerateResult
    {
        url: string;
    }

    //use EAIWS reporter plugin to generate a PDF
    const tResult = await ajax<GenerateResult>(
        "POST",
        joinPath(pSession.baseUrl, `/EAIWS/plugins/Reporter/template/${REPORT_EXPORT_TEMPLATE}/v1/generate`),
        {
            sessionId: pSession.sessionId,
            calculationScheme: PRICING_PROCEDURE_NAME,
            preferredImageColumn: COLUMN_ITEM_IMAGE,
            externalRefColumn: COLUMN_EXT_ITEM_NUMBER
        },
        {
            dataType: "json",
            timeout: 60000, //timeout after 60 seconds
            retryAttempts: 0 //do not automatically retry the generation because this is a heavy operation
        }
    );
    return (tResult.url);
}