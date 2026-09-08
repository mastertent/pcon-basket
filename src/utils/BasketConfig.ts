import { ItemSelectionOptions, UpdateBasketArticlesOptions, GetItemPropertiesOptions } from "@easterngraphics/wcf/modules/eaiws/basket";
import { HostGetConfigurationMessage } from "../../libs/integration-api/HostMessages";
import { MessageApiVersion } from "../../libs/integration-api/MessageApi";
import { WbkConfigurationMessage } from "../../libs/integration-api/WbkMessages";
import { EaiwsConfig } from "../../libs/integration-api/types";

import { Application } from "../Application";
import { PRICING_PROCEDURE_NAME } from "../Config";
import { getCustomCatalogConfiguration } from "./CustomCatalog";
import { getAndSetEosProjectData, setEosCustomerAddress, setEosProjectData } from "./HeaderData";
import { loadOBK, loadOBKFromCE } from "./Import";
//import { setupPriceConditions } from "./PriceConditions";

interface PrepareEaiwsSessionResult
{
    applySessionDefaults: boolean;
    selectedItems?: Array<string>;
}

/**
 * This function prepares the configuration of pCon.basket including the EAIWS session and sends it to the basket.
 */
export async function prepareAndSendConfiguration(pApp: Application, pMessage: HostGetConfigurationMessage): Promise<void>
{
    //show debug info
    console.log("Basket version: " + pMessage.parameter.appVersion);
    console.log("Api version: " + getApiVersionString(pMessage.parameter.messageApiVersion));
    console.log("User: " + pMessage.parameter.userName);

    //EAIWS session config
    let tAdvancedEaiwsConfig: EaiwsConfig | undefined;
    tAdvancedEaiwsConfig = {
        baseUrl: pApp.session.baseUrl,
        sessionId: pApp.session.session.sessionId,
        keepAliveInterval: 0, //disable keep alive, its already handled on our side
    };

    //prepare/intialize the session
    const tPrepareResult = await prepareEaiwsSession(pApp);

    let prjRestrictions = ["report","order","project.calculation.purchaseCalculation","item.userArticle.create","item.setArticle.create","project.customer.edit","project.terms","project.partyInCharge","project.calculation.margin","item.calculation.purchaseCalculation","item.calculation.conditionType","item.calculation.margin","item.calculation.updateConditionAmounts","item.additionalImages"];
    if (document.eosInfo.oData.o_displayProjectReadOnly)
    {
        prjRestrictions = ["edit","report","order","project.calculation.purchaseCalculation","item.userArticle.create","item.setArticle.create","project.customer.edit","project.terms","project.partyInCharge","project.calculation.margin","item.calculation.purchaseCalculation","item.calculation.conditionType","item.calculation.margin","item.calculation.updateConditionAmounts","item.additionalImages"];
    }

    //build the configuration message and send it to pCon.basket
    let tMessage: WbkConfigurationMessage = {
        type: "wbk.configuration",
        parameter: {
            application: {
                dataLanguage: [document.eosInfo.oData.o_lang], // ["de", "it", "fr", "en"], - 04/04/2023 - language from salespersons
                theme: { //use custom application colors
                    primaryColor: "#00A000",
                    appBarColor: "#505050"
                },
                //featureSet: "Configurator", //enable configurator mode
                showUser: true,
                showProjectSaveButton: true //see handling of `wbkHost.saveProject` message

                //featureSet: "Configurator", //enable configurator mode
                // priceDateSupported: PRICE_DATE_SUPPORTED, //configure price date support
                // supportedAPIs: {
                //     pConPricingConditions: PCON_PRICING_CONDITIONS_SUPPORTED
                // },
                //customActions: getCustomActions(), //register custom actions/buttons
                //disabledPlugins: ["projectExport-oexDealer"] //disable specific plugins
            },
            user: {
                /*
                    * **(Advanced integration only)**
                    * The pCon.login access token should be provided here, to activate all application features.
                    * e.g. accessing protected PIM article information or to access user/organization preferences
                    * Note: The access token usually expires after 1 hour. Its important to request a new token before that happens and send it
                    * to the basket using the `wbk.updateUserAccessToken` message.
                    */
                //accessToken: pApp.userAccessToken,
                restrictions: prjRestrictions
            },
            eaiws: tAdvancedEaiwsConfig, //EAIWS configuration for advanced mode
            calculation: {
                pricingProcedure: PRICING_PROCEDURE_NAME //use different pricing procedure (optional)
            },
            project: {
                title: document.eosInfo.oData.o_projectname,
                titleEditable: true,
                //applySessionDefaults: tPrepareResult.applySessionDefaults, //start new project with defaults
                applySessionDefaults: true, //start new project with defaults
                selectedItems: tPrepareResult.selectedItems, //define initially selected items
                openCatalogForEmptyProjects: true //start in catalog
            },
            // report: {
            //     templates: REPORT_TEMPLATES,
            //     defaultTemplate: REPORT_DEFAULT_TEMPLATE
            // },
            catalog: {
                customCatalogs: getCustomCatalogConfiguration()
            }
        }
    }

    //const listTaxSchemes = await pApp.session.basket.listTaxSchemes(true, "");
    var nCountryFound = 0;
    await pApp.session.basket.setCurrency(document.eosInfo.oData.o_currency);
    if(document.eosInfo.oData.a_country != "") {
        try{
            const listTaxSchemes = await pApp.session.basket.listTaxSchemes(true, document.eosInfo.oData.a_country);
            nCountryFound = listTaxSchemes.length;
        } catch(err){
            nCountryFound = 0;
        }
        if (nCountryFound > 0) {
            await pApp.session.basket.selectCurrentTaxScheme(document.eosInfo.oData.a_country);
        } else {
            await pApp.session.basket.selectCurrentTaxScheme("ZZ");
        }
    }
    else if(document.eosInfo.oData.c_country != "") {
        try{
            const listTaxSchemes = await pApp.session.basket.listTaxSchemes(true, document.eosInfo.oData.c_country);
            nCountryFound = listTaxSchemes.length;
        } catch(err){
            nCountryFound = 0;
        }
        
        if (nCountryFound > 0) {
            await pApp.session.basket.selectCurrentTaxScheme(document.eosInfo.oData.c_country);
        } else {
            await pApp.session.basket.selectCurrentTaxScheme("ZZ");
        }
    }

    pApp.sendMessageToBasket(tMessage);

    var basketViewId = "5726009a-756d-11d6-9c21-00e029099a4b";
    // var basketViews = await pApp.session.basket.getBasketViewConfigs();
    // if(basketViews) {
    //     const editableViews = (basketViews as Array<{ viewId: string; editable: boolean }>).filter(basketView => basketView.editable);
    //     if (editableViews.length > 0) {
    //         basketViewId = editableViews[0].viewId;
    //         const basketViewConfig = new BasketViewConfig();
    //         basketViewConfig.viewId = basketViewId;
    //         basketViewConfig.name = "flat List";
    //         basketViewConfig.mergeMode = "SubArticles";
    //         basketViewConfig.displayMode = "Sorted";
    //         basketViewConfig.expandBasketFolders = true;
    //         await pApp.session.basket.changeBasketViewConfig(basketViewConfig);
    //     }
    // }

    // 24.04.2023 - update from prices @@@ GL
    const tOptions = new ItemSelectionOptions();
    tOptions.viewId = basketViewId; //id of the standard view
    //tOptions.subItems = true; //load subitems
    const mainArticles = await pApp.session.basket.getAllItems(undefined, tOptions);

    // get update basket article options
    const tUpdateBasketArticleOptions = new UpdateBasketArticlesOptions();
    tUpdateBasketArticleOptions.update = true;
    tUpdateBasketArticleOptions.migrate = false;
    tUpdateBasketArticleOptions.recalculate = false;
    //tUpdateBasketArticleOptions.subItems = true;

    //get item properties options
    const tGetPropsOptions = new GetItemPropertiesOptions();
    tGetPropsOptions.separateCurrencies = true; //enable separate purchase and sales currency support

    const basketItemIds = mainArticles
        .flatMap(article => article.basketItemIds || []);

    if (basketItemIds.length > 0) {
        pApp.session.basket.updateBasketArticles(basketItemIds, null, tUpdateBasketArticleOptions);
    }
}

/**
 * This function is used to initailize the EAIWS session.
 */
async function prepareEaiwsSession(pApp: Application): Promise<PrepareEaiwsSessionResult>
{
    // //enable loading and storing of price dates
    // if (PRICE_DATE_SUPPORTED) {
    //     await pApp.session.session.setSessionProperty("egr.eai.basket.preserve_price_date", "true");
    // }

    //get selected file
    //get selected file
    let tInputField = document.getElementById("fileInput") as HTMLInputElement;
    let tSelectedFile = tInputField.files != null ? tInputField.files[0] : null;
    let tApplySessionDefaults = true;
    let tSelectedItems: Array<string> | undefined;

    if (!(document.eosInfo._formContext.getAttribute("mas_obkfile").getValue() == null)) {
        await loadOBKFromCE(pApp.session);
        tApplySessionDefaults = false; //do not apply session defaults, keep settings stored in obk

        await getAndSetEosProjectData(pApp.session);
    } else if (tSelectedFile != null && (tSelectedFile.name).toLowerCase().endsWith(".obk")) {
        //OBK selected -> load OBK
        await loadOBK(pApp.session, tSelectedFile);
        tApplySessionDefaults = false; //do not apply session defaults, keep settings stored in obk
    } else {
        //no file -> create new/empty project with prefilled header data
        await setEosProjectData(pApp.session);
        await setEosCustomerAddress(pApp.session);
    }

    //setup our price conditions
    // if (!PCON_PRICING_CONDITIONS_SUPPORTED) {
    //     await setupPriceConditions(pApp.session);
    // }

    return ({
        applySessionDefaults: tApplySessionDefaults,
        selectedItems: tSelectedItems
    });
}

function getApiVersionString(pVersion: MessageApiVersion): string
{
    let tVersion = `${pVersion.major}.${pVersion.minor}.${pVersion.patch}`;
    if (pVersion.preRelease as string !== "") {
        tVersion += `-${pVersion.preRelease}`;
    }
    return (tVersion);
}