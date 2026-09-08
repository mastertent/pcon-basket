import { UpdatedItem } from "../types";

/** message parameter for `wbkHost.done` and `wbkHost.sessionModifications` */
export interface SessionModifications
{
    /**
     * the header calculation has changed
     * Note: A changed header calculation may also imply that the calculation of all items has changed if
     * some conditions depend on header conditions. In this case the items may not be included in
     * the `updatedItems` array (e.g. for indirect changes).
     */
    headerCalculation: boolean;
    /** the tax scheme has changed */
    taxScheme: boolean;
    /** the currency has changed */
    currency: boolean;
    /** the exchange rates have changed */
    exchangeRates: boolean;
    /** the project data has changed */
    projectData: boolean;
    /** array containing item ids of created items */
    createdItems: Array<string>;
    /** array containing item ids of disposed/deleted items */
    disposedItems: Array<string>;
    /** array containing updated items */
    updatedItems: Array<UpdatedItem>;
}
