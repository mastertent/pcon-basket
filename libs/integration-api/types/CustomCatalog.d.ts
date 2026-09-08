/** Base custom catalog item */
export interface CustomCatalogItem
{
    id: string;
    label: string | { [language: string]: string };
    imageUrl?: string;
}

/** Definition of a custom catalog. */
export interface CustomCatalog extends CustomCatalogItem
{
    /**
     * If provided the catalog will be handled as an external catalog.
     * It will be embedded in the ui using the `externalUrl`.
     * More details can be found in the external catalogs documentation.
     */
    externalUrl?: string;
}

/** Definition of a custom catalog article. Used as parameter in the `wbk.customCatalogArticles` message. */
export interface CustomCatalogArticle extends CustomCatalogItem
{
    catalogId: string;
    articleNumber?: string;
    manufacturerId?: string;
    seriesId?: string;
}