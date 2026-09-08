import { UpdatedItem } from "./UpdatedItem";

/** message parameter for `wbkHost.updateBasketGUI` */
export interface BasketGuiUpdates
{
    /** the header calculation has changed */
    headerCalculation?: boolean;
    /** the tax scheme has changed */
    taxScheme?: boolean;
    /** the currency has changed */
    currency?: boolean;
    /** the exchange rates have changed */
    exchangeRates?: boolean;
    /** the project data has changed */
    projectData?: boolean;
    /** one or more basket items were created/inserted */
    itemsCreated?: boolean;
    /** one or more basket items were deleted */
    itemsDeleted?: boolean;
    /** array containing updated items */
    updatedItems?: Array<UpdatedItem>;
}
