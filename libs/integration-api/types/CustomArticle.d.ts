/** Full article data of a custom article. Used as parameter in the `wbk.customArticle` message. */
export interface CustomArticle
{
    manufacturerId?: string;
    seriesId?: string;
    baseArticleNumber?: string;
    finalArticleNumber?: string;
    variantCode?: string;

    /**
     * Quantity of the article
     * @defaultValue 1
     */
    quantity?: number;

    /** short text as simple string or as multi language map (language code -> text) */
    shortText?: string | { [language: string]: string };
    /** long text as simple string or as multi language map (language code -> text) */
    longText?: string | { [language: string]: string };
    /** feature text as simple string or as multi language map (language code -> text) */
    featureText?: string | { [language: string]: string };

    /** Additional comments/notes for this article. */
    comments?: string;

    purchasePrice?: Money;
    salesPrice?: Money;
    packagingInfo?: PackagingInfo;

    /** Map from tax type to tax category for the active EAIWS tax scheme. */
    taxes?: { [type: string]: string };

    /**
     * Url or data-URI for the article image.
     * Currently only jpg and png images are supported.
     */
    imageUrl?: string;
}

export interface Money
{
    value: number;
    currency: string;
}

export interface Value
{
    value: number;
    unit: string;
}

export interface PackagingInfo
{
    width?: Value;
    height?: Value;
    depth?: Value;
    volume?: Value;
    tareWeight?: Value;
    netWeight?: Value;
    itemsPerPackUnit?: number;
    packUnitsPerArticle?: number;
}