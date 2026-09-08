import {
    HostGetCustomArticleMessage,
    HostGetCustomCatalogArticlesMessage,
} from "../../libs/integration-api/HostMessages";
import {
    WbkCustomArticleMessage,
    WbkCustomCatalogArticlesMessage,
} from "../../libs/integration-api/WbkMessages";
import {
    CustomArticle,
    CustomCatalog,
    CustomCatalogArticle,
} from "../../libs/integration-api/types";
import { Application } from "../Application";

/** Returns the configuration for the custom catalogs used for the `wbk.configuration` message. */
export function getCustomCatalogConfiguration(): Array<CustomCatalog> {
    return [
        //register custom catalog
        {
            id: "ruku",
            label: "RUKU1952",
            imageUrl: "https://zingerle.group/static/images/logo-ruku1952.svg",
        },
        {
            id: "xgloo",
            label: "xgloo",
            imageUrl: "https://zingerle.group/static/images/logo-xgloo.png",
        },
    ];
}

/**
 * Send example the data of the example custom catalog to the basket.
 */
export function handleCustomCatalogArticlesMessage(
    pApp: Application,
    pMessage: HostGetCustomCatalogArticlesMessage,
): void {
    let tArticles: Array<CustomCatalogArticle> = [];
    const tQuery = pMessage.parameter;

    console.log(tQuery);

    getCatalogArticlesByCatalogId(tQuery.catalogId ?? "")
        .then((articles: []) => {
            Object.values(articles).forEach((article: any) => {
                if (
                    tQuery.baseArticleNumber !== undefined &&
                    tQuery.baseArticleNumber !== null
                ) {
                    if (article["articleNumber"] === tQuery.baseArticleNumber) {
                        tArticles.push({
                            id: article["id"],
                            label: article["shortText"],
                            articleNumber: article["articleNumber"],
                            manufacturerId: article["manufacturerId"],
                            seriesId: article["seriesId"],
                            catalogId: article["catalogId"],
                        });
                    }
                } else if (
                    tQuery.queryString == null ||
                    article["shortText"]
                        .toLowerCase()
                        .indexOf(tQuery.queryString.toLowerCase()) > -1
                ) {
                    tArticles.push({
                        id: article["id"],
                        label: article["shortText"],
                        articleNumber: article["articleNumber"],
                        manufacturerId: article["manufacturerId"],
                        seriesId: article["seriesId"],
                        catalogId: article["catalogId"],
                    });
                }
            });

            const tMessage: WbkCustomCatalogArticlesMessage = {
                type: "wbk.customCatalogArticles",
                parameter: tArticles,
            };
            pApp.sendMessageToBasket(tMessage);
        })
        .catch((error) => {
            console.log(error);
        });

    // tArticles = tArticles.filter((article) =>
    // {
    //     if (tQuery.seriesId != null && article.seriesId !== tQuery.seriesId)
    //         return (false);
    //     if (tQuery.baseArticleNumber != null && article.articleNumber !== tQuery.baseArticleNumber)
    //         return (false);
    //     return (true);
    // });
}

/**
 * Send example data of custom afticles to the basket.
 */
export function handleCustomArticleMessage(
    pApp: Application,
    pMessage: HostGetCustomArticleMessage,
): void {
    let tArticle: CustomArticle | undefined;
    const tQuery = pMessage.parameter;

    getCatalogArticlesByCatalogId(tQuery.catalogId)
        .then((articles) => {
            if (articles[tQuery.articleId]) {
                const article = articles[tQuery.articleId];
                tArticle = {
                    baseArticleNumber: article["articleNumber"],
                    finalArticleNumber: article["articleNumber"],
                    manufacturerId: article["manufacturerId"],
                    seriesId: article["seriesId"],
                    shortText: article["shortText"],
                    longText: article["longText"],
                    salesPrice: {
                        value: article["salesPrice"],
                        currency: article["currency"],
                    },
                };
            }

            if (tArticle == null) {
                throw new Error("Unknown article");
            }

            const tMessage: WbkCustomArticleMessage = {
                type: "wbk.customArticle",
                parameter: tArticle,
            };
            pApp.sendMessageToBasket(tMessage);
        })
        .catch((error) => {
            console.log(error);
        });
}

async function getCatalogArticlesByCatalogId(catalogId: string): Promise<any> {
    return fetch(
        "https://zingerle.group/custom-catalog?catalogid=" +
            catalogId +
            "&country=" +
            document.eosInfo.oData.o_legalentity_countrycode +
            "&language=" +
            document.eosInfo.oData.a_lang,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    )
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error("Failed to fetch articles");
            }
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error(error);
        });
}
