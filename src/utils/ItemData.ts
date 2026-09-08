import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { BasketItem, GetItemFieldsOptions, GetItemPropertiesOptions, ItemCalculationSheet, ItemProperties, ItemSelectionOptions } from "@easterngraphics/wcf/modules/eaiws/basket";
import { COLUMN_ITEM_IMAGE, PRICING_PROCEDURE_NAME } from "../Config";

export interface ItemInfo
{
    itemProperties: ItemProperties;
    calculation: ItemCalculationSheet;
    imageUrl: string | undefined;
};

/**
 * This functions returns a list of all basket items .
 */
export async function getAllItems(pSession: EaiwsSession, pIncludePositionNumbers: boolean): Promise<Array<BasketItem>>
{
    let tOptions: ItemSelectionOptions | undefined;
    if (pIncludePositionNumbers) {
        /*
        Get all items
        Because the `positionNumber` field is only supported for view items we are requesting all
        view items of the standard view. If `positionNumber` is not required  we could directly request
        basket items instead (leave `viewId` undefined).
        */
        tOptions = new ItemSelectionOptions();
        tOptions.viewId = "5726009a-756d-11d6-9c21-00e029099a4b" //id of the standard view
    }
    const tItems = await pSession.basket.getAllItems(undefined, tOptions);
    return (tItems)
}

/**
 * This function collects information about an item from EAIWS.
 */
export async function fetchItemInfo(pSession: EaiwsSession, pBasketItemId: string): Promise<ItemInfo>
{
    //get item properties
    const tGetPropsOptions = new GetItemPropertiesOptions();
    tGetPropsOptions.separateCurrencies = true; //enable separate purchase and sales currency support
    tGetPropsOptions.textMode = "Simple"; //use `Simple` instead of `Legacy` to support user defined descriptions
    const tItemProps = await pSession.basket.getItemProperties([pBasketItemId], tGetPropsOptions);

    //get item calculation
    const tCalculations = await pSession.basket.getPriceCalculationSheets([pBasketItemId], PRICING_PROCEDURE_NAME);

    //get default item image from the default image column
    const tGetFieldsOptions = new GetItemFieldsOptions();
    tGetFieldsOptions.useDefault = true;
    tGetFieldsOptions.resolveURI = true;
    tGetFieldsOptions.generateImages = true;
    const tFields = await pSession.basket.getItemFields([pBasketItemId], [COLUMN_ITEM_IMAGE], tGetFieldsOptions);
    let tImageUrl = undefined;
    if (tFields.length > 0) {
        tImageUrl = tFields[0].data;
    }

    return {
        itemProperties: tItemProps[0],
        calculation: tCalculations[0],
        imageUrl: tImageUrl
    }
}