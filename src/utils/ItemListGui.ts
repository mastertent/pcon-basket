import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { BasketItem, Money, DisplayText, TMRow } from "@easterngraphics/wcf/modules/eaiws/basket";
import { toLocaleCurrencyString, toLocaleString } from "@easterngraphics/wcf/modules/utils/number";

import { NETVALUE_CALCLINE_LEVEL, TEXT_ID_ADDITIONAL_TEXT, TEXT_ID_SPECIAL_MODEL_INFO } from "../Config";
import { ItemInfo, fetchItemInfo } from "./ItemData";

/**
 * Helper to show an item in the item list.
 */
export function showItem(pSession: EaiwsSession, pItem: BasketItem): void
{
    function addCell(pValue: string | undefined): void
    {
        const tCell = document.createElement("td");
        tCell.innerText = pValue ?? "";
        tRow.appendChild(tCell);
    }

    const tTable = document.getElementById("itemList")!;
    const tRow = document.createElement("tr");

    addCell(pItem.positionNumber);
    addCell(pItem.label);
    addCell(pItem.itemType);

    //because we requested view items the field `itemId` represents the id of the view item
    //we have to use the `basketItemIds`in this case
    let tBasketItemId: string;
    if (pItem.basketItemIds != null) {
        tBasketItemId = pItem.basketItemIds[0];
    } else {
        tBasketItemId = pItem.itemId;
    }
    addCell(tBasketItemId);

    //add button cell
    const tCell = document.createElement("td");
    const tButton = document.createElement("button");
    tButton.innerText = "i";
    tButton.style.minWidth = "24px";
    tButton.onclick = () => fetchAndShowItemInfo(pSession, tBasketItemId, pItem.positionNumber);
    tCell.appendChild(tButton);
    tRow.appendChild(tCell);

    tTable.appendChild(tRow);
}

/**
 * This function collects information about an item from EAIWS and shows it in the item list.
 */
async function fetchAndShowItemInfo(pSession: EaiwsSession, pBasketItemId: string, pItemNumber: string | undefined): Promise<void>
{
    const tInfo = await fetchItemInfo(pSession, pBasketItemId);
    showItemInfo(pItemNumber, tInfo);
}

/**
 * Helper to show additional information for an item.
 */
function showItemInfo(
    pItemNumber: string | undefined,
    pItemInfo: ItemInfo): void
{
    function addInfo(pName: string, pValue: string | undefined, pRed: boolean = false): void
    {
        const tInfo = document.createElement("div");
        const tInfoName = document.createElement("span");
        const tInfoValue = document.createElement("span");
        tInfo.style.paddingBottom = "6px";
        if (pRed === true) {
            tInfo.style.color = "red";
        }
        tInfoName.style.fontWeight = "600";
        tInfoName.innerText = pName + ": ";
        tInfoValue.innerText = pValue ?? "";
        tInfo.appendChild(tInfoName);
        tInfo.appendChild(tInfoValue);
        tItemInfoContent.appendChild(tInfo);
    }

    function formatPrice(pValue: number | undefined, pCurrency: string | undefined): string
    {
        if (pValue == null || pCurrency == null)
            return ("");
        return (toLocaleCurrencyString(pValue, pCurrency, "en-US") ?? "");
    }

    function formatQuantity(pValue: number | undefined): string
    {
        if (pValue == null)
            return ("");
        return (toLocaleString(pValue, "en-US") ?? "");
    }

    function getDisplayText(pTexts: Array<DisplayText> | undefined): string | undefined
    {
        if (pTexts == null || pTexts.length < 1) {
            return (undefined);
        }
        return (pTexts[0].value);
    }

    function getTextById(pId: string, pTextRows?: Array<TMRow>): string | undefined
    {
        if (pTextRows == null) {
            return (undefined);
        }
        const tRow = pTextRows.find((row) => row.textId === pId);
        if (tRow != null && tRow.texts.length > 0) {
            return (tRow.texts[0].text);
        }
        return (undefined);
    }

    //clear item info
    const tItemInfoContent = document.getElementById("itemInfoContent")!;
    tItemInfoContent.innerHTML = "";

    const tItemProps = pItemInfo.itemProperties;
    const tCalculation = pItemInfo.calculation.sheet;

    addInfo("Item Number", pItemNumber);
    addInfo("Type", tItemProps.itemType);
    addInfo("Item ID", tItemProps.itemId);
    if (tItemProps.article != null) {
        addInfo("Manufacturer ID", tItemProps.article.manufacturerId);
        addInfo("Manufacturer Name", tItemProps.article.manufacturerName);
        addInfo("Series ID", tItemProps.article.seriesId);
        addInfo("Series Name", tItemProps.article.seriesName);
        if (tItemProps.article.useFinalArticleNumber === true) {
            addInfo("Article Number", tItemProps.article.finalArticleNumber);
        } else {
            addInfo("Article Number", tItemProps.article.baseArticleNumber);
        }
        addInfo("Variant Code", tItemProps.article.variantCode);

        if (tItemProps.article.productDescription != null || tItemProps.article.userDescription != null) {
            //only available for OFML articles (not for user articles)
            if (tItemProps.article.productDescription != null) {
                addInfo("Product Short Text", getDisplayText(tItemProps.article.productDescription.shortText));
                addInfo("Product Long Text", getDisplayText(tItemProps.article.productDescription.longText));
                addInfo("Product Feature Text", getDisplayText(tItemProps.article.productDescription.featureText));
            }

            //user defined description (also used for user articles)
            if (tItemProps.article.userDescription != null) {
                addInfo("User Short Text", getDisplayText(tItemProps.article.userDescription.shortText));
                addInfo("User Long Text", getDisplayText(tItemProps.article.userDescription.longText));
                addInfo("User Feature Text", getDisplayText(tItemProps.article.userDescription.featureText));
            }
        } else {
            //Fallback for legacy mode, only necessary if ItemProperties where requested using `legacy` textMode
            //Note: user defined description for OFML articles is not available in this case
            addInfo("Short Text", tItemProps.article.shortText);
            addInfo("Long Text", tItemProps.article.longText);
            addInfo("Feature Text", tItemProps.article.featureText);
        }

        addInfo("Additional Text", getTextById(TEXT_ID_ADDITIONAL_TEXT, tItemProps.tmRows));
        addInfo("Special Model Information", getTextById(TEXT_ID_SPECIAL_MODEL_INFO, tItemProps.tmRows));

        if (tItemProps.article.inconsistencyReason != null && tItemProps.article.inconsistencyReason.length > 0) {
            addInfo("Inconsistency Reason", tItemProps.article.inconsistencyReason.join("\n"), true);
        }
        addInfo("Base Purchase Price", formatPrice(tItemProps.article.purchasePrice, tItemProps.article.purchaseCurrency));
        addInfo("Base Sales Price", formatPrice(tItemProps.article.salesPrice, tItemProps.article.salesCurrency));
        addInfo("Quantity", formatQuantity(tItemProps.article.quantity));
    } else {
        addInfo("Label", tItemProps.label);
        addInfo("Additional Text", getTextById(TEXT_ID_ADDITIONAL_TEXT, tItemProps.tmRows));
        addInfo("Special Model Information", getTextById(TEXT_ID_SPECIAL_MODEL_INFO, tItemProps.tmRows));
    }

    //find net value in calculation and print it
    let tNetValueCalcLine = undefined;
    for (let i = 0; i < tCalculation.lines.length; ++i) {
        if (tCalculation.lines[i].level === NETVALUE_CALCLINE_LEVEL) {
            tNetValueCalcLine = tCalculation.lines[i];
            break;
        }
    }
    if (tNetValueCalcLine != null) {
        if (tNetValueCalcLine.amount != null && tNetValueCalcLine.amount instanceof Money) {
            addInfo("Unit Net Price", formatPrice(tNetValueCalcLine.amount.value, tNetValueCalcLine.amount.currency));
        }
        if (tNetValueCalcLine.value != null) {
            addInfo("Total Net Price", formatPrice(tNetValueCalcLine.value.value, tNetValueCalcLine.value.currency));
        }
    }

    //item image
    if (pItemInfo.imageUrl != null && pItemInfo.imageUrl != "") {
        const tImage = document.createElement("img");
        tImage.src = pItemInfo.imageUrl;
        tImage.style.maxWidth = "200px";
        tItemInfoContent.appendChild(tImage);
    }
}
