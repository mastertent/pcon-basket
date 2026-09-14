import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { LoginHandler } from "./login/LoginHandler";
import { wcfConfig } from "@easterngraphics/wcf/modules/utils";
import {
    ItemSelectionOptions,
    GetItemPropertiesOptions,
} from "@easterngraphics/wcf/modules/eaiws/basket";

import {
    HostExecuteActionMessage,
    HostGetConfigurationMessage,
    HostGetCustomArticleMessage,
    HostGetCustomCatalogArticlesMessage,
    HostMessage,
    WbkHostUpdateUserAccessTokenMessage,
} from "../libs/integration-api/HostMessages";
import {
    WbkLockBasketGUIMessage,
    WbkMessage,
    WbkSaveProjectDoneMessage,
    WbkUnlockBasketGUIMessage,
} from "../libs/integration-api/WbkMessages";

import {
    BASKET_URL,
    GATEKEEPER_APPLICATION_ID,
    PRICING_PROCEDURE_NAME,
} from "./Config";
import { prepareAndSendConfiguration } from "./utils/BasketConfig";
import {
    handleCustomArticleMessage,
    handleCustomCatalogArticlesMessage,
} from "./utils/CustomCatalog";
import { exportOBX, exportPDF } from "./utils/Export";
import { getSessionFromGatekeeper } from "./utils/Gatekeeper";
import { handleExecuteActionMessage } from "./utils/CustomActions";

export class Application {
    public get session(): EaiwsSession {
        return this.mSession;
    }

    public get userAccessToken(): string | undefined {
        return this.mLoginHandler.accessToken;
    }

    public constructor() {
        this.mIFrame = document.getElementById(
            "basketFrame",
        ) as HTMLIFrameElement; //get basket iframe
        this.mIFrame.src = "";

        this.mSession = new EaiwsSession();
        this.mLoginHandler = new LoginHandler(this);

        wcfConfig.ajaxDefaultOptions.timeout = 60000; //set default timeout to 60 seconds, default is 30 seconds

        //register message handler to receive messages from basket
        window.addEventListener("message", this.onMessage);
    }

    public loginCallback(): void {
        this.mLoginHandler.handlePopupFinished();

        const nextLocation =
            window.location.origin + "/WebResources/mas_pconbasket_rel211";
        window.location.href = nextLocation;
    }

    public async startBasket(): Promise<void> {
        if (document.eosInfo) {
            window.parent.eosInfo = Object.assign({}, document.eosInfo);
        } else {
            document.eosInfo = Object.assign({}, window.parent.eosInfo);
        }

        // login
        const loggedIn = await this.prepareLogin();
        if (!loggedIn) await this.login();
        else {
            //create the eaiws session
            await this.createEaiwsSession();

            this.mIFrame.src = BASKET_URL;
            //hide intro ui
            document.getElementById("intro")!.style.display = "none";

            //show basket iframe
            this.mIFrame.style.display = "block";
        }
    }

    public async saveOBK(): Promise<void> {
        if (this.mSaveOBKPromise) {
            return this.mSaveOBKPromise;
        }

        this.mSaveOBKPromise = (async () => {
            //get OBK url and download it
            console.log("**Begin saveOBK");
            document.eosInfo.Xrm.Utility.showProgressIndicator(
                "Please wait: pconBasket and CE are Synchronizing...",
            );
            const tUrl = await this.mSession.session.saveSession(null);
            //save OBK - @@@GL

            //    document.eosInfo.uploadFile = false;
            //    document.eosInfo.saveOperation = false;

            const chkSaveobk: HTMLInputElement | null = document.getElementById(
                "chkSaveobk",
            ) as HTMLInputElement;

            if (document.eosInfo.entitySetname == "opportunities") {
                await this.getEosTotalAmountForOpportunity(this.mSession);
            } else if (document.eosInfo.entitySetname == "quotes") {
                await this.getEosRenewQuoteLines(this.mSession);
            }
            if (chkSaveobk && chkSaveobk.checked) {
                window.location.href = tUrl;
            }
            //debugger;
            //    var x = promiseWhen((document.eosInfo.uploadFile && document.eosInfo.saveOperation), 10000);
            document.eosInfo.Xrm.Utility.closeProgressIndicator();

            await this.uploadFile(tUrl);
            // EOS: automatic refresh of the quote lines subgrid after saving the OBK file. This is needed because the quote lines are created asynchronously in the background.
            if (document.eosInfo.entitySetname == "quotes") {
                document.eosInfo._formContext.ui.setFormNotification("Quote lines are currently being created...", "WARNING", "refreshGridNotification");
                this.pollRefreshGrid();
            }
            //refreshCE();
            console.log("**End saveOBK");

            //get OBK url and download it
            //window.location.href = await exportOBK(this.session);
        })();

        try {
            await this.mSaveOBKPromise;
            console.log("**End saveOBK - promise resolved");
        } finally {
            this.mSaveOBKPromise = null;
        }
    }

    public async saveOBX(): Promise<void> {
        //get url of OBX and download it
        window.location.href = await exportOBX(this.session);
    }

    public async savePDF(): Promise<void> {
        //get url of PDF and download it
        window.location.href = await exportPDF(this.session);
    }

    public async restart(): Promise<void> {
        //close the session if we are in advanced mode (in basic mode the session in managed by pCon.basket)
        await this.mSession.close();

        //remove iframe to close the basket (and close the eaiws sessin in basic integration mode)
        this.mIFrame.src = "";

        //reload example
        window.location.reload();
    }

    /**
     * This function is used to send messages to the basket
     */
    public sendMessageToBasket(pMessage: WbkMessage): void {
        if (this.mIFrame.contentWindow != null) {
            this.mIFrame.contentWindow.postMessage(pMessage, "*");
        }
    }

    /** Helper function to send the `wbk.lockBasketGUI` message. */
    public lockBasketUI(): void {
        const tMessage: WbkLockBasketGUIMessage = { type: "wbk.lockBasketGUI" };
        this.sendMessageToBasket(tMessage);
    }

    /** Helper function to send the `wbk.unlockBasketGUI` message. */
    public unlockBasketUI(): void {
        const tMessage: WbkUnlockBasketGUIMessage = {
            type: "wbk.unlockBasketGUI",
        };
        this.sendMessageToBasket(tMessage);
    }

    /**
     * **(Basic integration only)**
     * update the current pCon.login access token
     */
    public setUserAccessToken(pToken: string | undefined): void {
        this.mUserAccessToken = pToken;
    }

    //// private ///////////////////////////////////////////////////////////////////////////////////

    public mIFrame: HTMLIFrameElement; //the basket iframe
    public mSession: EaiwsSession; //session object to manage EAIWS session
    public mLoginHandler: LoginHandler; //pCon.login handler for advanced integration
    public mUserAccessToken: string | undefined; //pCon.login access token for basic integration
    private mSaveOBKPromise: Promise<void> | null = null;
    private mPollTimer: any = null;
    private mExpectedQuoteLineCount: number | null = null;

    private onMessage = (pEvent: MessageEvent): void => {
        //check if message is coming from basket
        if (pEvent.source !== this.mIFrame.contentWindow) return;

        //call our handler
        this.handleBasketMessage(pEvent.data);
    };
    /**
     * This function handles every message coming from pCon.basket
     */
    private handleBasketMessage(pMessage: HostMessage): void {
        console.dir(pMessage);

        switch (pMessage.type) {
            //basket requests its configuration => prepare configuration and send it to basket
            case "wbkHost.getConfiguration": {
                prepareAndSendConfiguration(
                    this,
                    pMessage as HostGetConfigurationMessage,
                );
                break;
            }

            //handle access token update (basic integration only)
            case "wbkHost.updateUserAccessToken": {
                this.setUserAccessToken(
                    (pMessage as WbkHostUpdateUserAccessTokenMessage).parameter,
                );
                break;
            }

            //basket requests the article data for a custom article
            case "wbkHost.getCustomArticle": {
                handleCustomArticleMessage(
                    this,
                    pMessage as HostGetCustomArticleMessage,
                );
                break;
            }

            //basket requests the custom articles for our custom catalog
            case "wbkHost.getCustomCatalogArticles": {
                handleCustomCatalogArticlesMessage(
                    this,
                    pMessage as HostGetCustomCatalogArticlesMessage,
                );
                break;
            }

            //user executed a custom action
            case "wbkHost.executeAction": {
                handleExecuteActionMessage(
                    this,
                    pMessage as HostExecuteActionMessage,
                );
                break;
            }

            //project title changed
            case "wbkHost.projectTitleChanged": {
                //reset project title to "unnamed" if empty
                if (pMessage.parameter === "") {
                    this.sendMessageToBasket({
                        type: "wbk.setProjectTitle",
                        parameter: "unnamed",
                    });
                }
                break;
            }

            //user clicked the save project button
            case "wbkHost.saveProject": {
                this.saveProject();
                break;
            }

            //user is finished with editing
            case "wbkHost.done": {
                this.showItemList();
                break;
            }
        }
    }

    /**
     * **(Advanced integration only)**
     * Login user using pCon.login
     */
    private async prepareLogin(): Promise<boolean> {
        //loggin with pCon.login
        const tLoggedIn = await this.mLoginHandler.parepareLogin();
        return tLoggedIn;
    }

    /**
     * **(Advanced integration only)**
     * Login user using pCon.login
     */
    private async login(): Promise<boolean> {
        if (document.eosInfo) {
            window.parent.eosInfo = Object.assign({}, document.eosInfo);
        } else {
            document.eosInfo = window.parent.eosInfo;
        }

        const nextLocation =
            window.location.origin + "/WebResources/mas_pconbasket_rel211";

        //loggin with pCon.login
        const tLoggedIn = await this.mLoginHandler.loginWithPopup(nextLocation);
        return tLoggedIn;
    }

    /**
     * **(Advanced integration only)**
     * This function creates new EAIWS session.
     */
    private async createEaiwsSession(): Promise<void> {
        let tGatekeeperId = document.eosInfo.oData.o_gatekeeperid; //replace with your gatekeeper ID - @@@ was wbk_demo

        // @@ 20.20.2024 - new parameter locale for CPQ
        var localeEos = "";
        try {
            localeEos =
                document.eosInfo.oData.a_lang != ""
                    ? document.eosInfo.oData.a_lang.toLowerCase() +
                    "_" +
                    (document.eosInfo.oData.a_country != ""
                        ? document.eosInfo.oData.a_country.toUpperCase()
                        : document.eosInfo.oData.a_lang
                            .toUpperCase()
                            .replace("EN", "US"))
                    : document.eosInfo.oData.o_lang.toLowerCase() +
                    "_" +
                    document.eosInfo.oData.o_lang
                        .toUpperCase()
                        .replace("EN", "US");
        } catch (pError) {
            console.log("getSessionFromGatekeeper - err: " + pError);
            localeEos = "en_US";
        }
        console.log("getSessionFromGatekeeper - tOptions.locale: " + localeEos);

        //option 1: create EAIWS session using gatekeeper. see gatekeeper documentation: https://eaiws-server.pcon-solutions.com/doc/v3
        await getSessionFromGatekeeper(this.mSession, tGatekeeperId, {
            userToken: this.mLoginHandler.accessToken,
            applicationId: GATEKEEPER_APPLICATION_ID,
            locale: localeEos, // @@ 20.20.2024 - new parameter locale for CPQ
        });

        //option 2: create EAIWS session using eaiws baseurl and startup (not supported in pCon.cloud)
        //await pApp.session.open("https://www.example-eaiws.com", {startup: "example-startup"});
    }

    /**
     * This function is called when the user clicks the save button in pCon.basket UI and will save an OBK file.
     */
    private async saveProject(): Promise<void> {
        //save OBK
        await this.saveOBK();

        //notify basket that saving is done
        let tMessage: WbkSaveProjectDoneMessage = {
            type: "wbk.saveProjectDone",
        };
        this.sendMessageToBasket(tMessage);
    }

    /**
     * This function collects all items and displays them in the item list.
     * commented on 2026-07-31 because it is not used anymore. The item list is now displayed in the basket iframe.
     */
    private async showItemList(): Promise<void> {
        //close/hide basket first
        this.mIFrame.src = "";
        this.mIFrame.style.display = "none";

        //show output
        const output = document.getElementById("output");
        if (output) output.style.display = "block";

        /*
        Get all items
        Because the `positionNumber` field is only supported for view items we are requesting all
        view items of the standard view. If `positionNumber` is not required  we could directly request
        basket items instead (leave `viewId` undefined).
        */
        const tOptions = new ItemSelectionOptions();
        tOptions.viewId = "5726009a-756d-11d6-9c21-00e029099a4b"; //id of the standard view

        this.saveOBK();
    }

    /**
     * EOS: This function return total amount (estimated revenue) for opportunity
     */
    private async getEosTotalAmountForOpportunity(mSession: EaiwsSession) {
        /*
        Get all items
        Because the `positionNumber` field is only supported for view items we are requesting all
        view items of the standard view. If `positionNumber` is not required  we could directly request
        basket items instead (leave `viewId` undefined).
        */
        const tCalculations = await mSession.basket.getPriceCalculationSheets(
            null,
            PRICING_PROCEDURE_NAME,
        );
        let totalAmount = tCalculations[0].sheet?.netValue?.value ?? 0;
        document.eosInfo._formContext
            .getAttribute("estimatedvalue")
            .setValue(totalAmount);
    }

    /**
     * EOS: This function return all row + price for quote
     */
    private async getEosRenewQuoteLines(mSession: EaiwsSession) {
        const DEBUG_RENEW_QUOTE_LINES = false;
        const LOG_RENEW_QUOTE_LINES_PERF = true;
        const nowMs = (): number =>
            typeof performance !== "undefined" ? performance.now() : Date.now();
        const tFunctionStart = nowMs();
        const logPerf = (
            tLabel: string,
            tStartedAt: number,
            tExtra?: string,
        ) => {
            if (!LOG_RENEW_QUOTE_LINES_PERF) {
                return;
            }

            const tDurationMs = Math.round((nowMs() - tStartedAt) * 100) / 100;
            console.log(
                `[getEosRenewQuoteLines] ${tLabel} took ${tDurationMs} ms${tExtra ? ` | ${tExtra}` : ""
                }`,
            );
        };

        /*
        Get all items
        Because the `positionNumber` field is only supported for view items we are requesting all
        view items of the standard view. If `positionNumber` is not required  we could directly request
        basket items instead (leave `viewId` undefined).
        */
        const tOptions = new ItemSelectionOptions();
        tOptions.viewId = "5726009a-756d-11d6-9c21-00e029099a4b"; //id of the standard view

        const tHeaderCalculationsStart = nowMs();
        const tCalculationsPromise = mSession.basket.getPriceCalculationSheets(
            null,
            PRICING_PROCEDURE_NAME,
        );

        const tGetViewConfigsStart = nowMs();
        const tAllViewConfigs = await mSession.basket.getBasketViewConfigs();
        logPerf(
            "getBasketViewConfigs",
            tGetViewConfigsStart,
            `count=${tAllViewConfigs.length}`,
        );
        const tEditableViewConfig = tAllViewConfigs.find((v) => v.editable);
        if (tEditableViewConfig) {
            tOptions.viewId = tEditableViewConfig.viewId;
        }
        const tFetchedViewConfigs = await mSession.basket.getBasketViewConfigs([
            tOptions.viewId,
        ]);
        const tViewConfig = tFetchedViewConfigs[0];
        tViewConfig.name = "Grouped";
        tViewConfig.mergeMode = "SubArticles";
        tViewConfig.displayMode = "Sorted";
        tViewConfig.expandBasketFolders = false;

        const [tCalculations] = await Promise.all([
            tCalculationsPromise
        ]);
        logPerf("header getPriceCalculationSheets", tHeaderCalculationsStart);

        const tChangeViewConfigStart = nowMs();
        await mSession.basket.changeBasketViewConfig(tViewConfig);
        logPerf("changeBasketViewConfig", tChangeViewConfigStart);

        const tGetAllItemsStart = nowMs();
        const tItems = await mSession.basket.getAllItems(undefined, tOptions);
        logPerf("getAllItems", tGetAllItemsStart, `itemCount=${tItems.length}`);

        // Batch item properties to avoid one request per basket item.
        const tGetPropsOptions = new GetItemPropertiesOptions();
        tGetPropsOptions.separateCurrencies = true; //enable separate purchase and sales currency support
        tGetPropsOptions.inactivePositionState = true;
        const tItemIdsForProps = tItems
            .map((item) => item.basketItemIds?.[0])
            .filter((itemId): itemId is string => !!itemId);
        const tGetItemPropertiesStart = nowMs();
        //@ts-ignore
        const tItemPropsBatched = tItemIdsForProps.length
            ? await mSession.basket.getItemProperties(
                tItemIdsForProps,
                tGetPropsOptions,
            )
            : [];
        logPerf(
            "getItemProperties",
            tGetItemPropertiesStart,
            `requestedIds=${tItemIdsForProps.length}, returnedProps=${tItemPropsBatched.length}`,
        );
        const tItemPropsByItemId = new Map(
            tItemPropsBatched
                .filter((itemProps) => !!itemProps.itemId)
                .map((itemProps) => [itemProps.itemId as string, itemProps]),
        );

        var quoteId = document.eosInfo.recordId
            .replace("{", "")
            .replace("}", "");
        // funziona multiplo!
        var changeSetIns = new Array();
        var taxRate = null;
        // 07.06.2023 - GL new total calculation
        var totalLineAmountMain = 0;
        var totalLineDiscountAmountMain = 0;

        class InsRequest {
            etn: string;
            payload: any;

            constructor(entityName: string, payload: any) {
                this.etn = entityName;
                this.payload = payload;
            }

            getMetadata() {
                return {
                    boundParameter: null,
                    parameterTypes: {},
                    operationType: 2, // This is a CRUD operation. Use '0' for actions and '1' for functions
                    operationName: "Create",
                };
            }
        }

        // Pass 1: filter to eligible items only, skipping non-articles and ignored items.
        // This reduces unnecessary per-item getPriceCalculationSheets calls in pass 2.
        const tEligibleItems: Array<{
            lineItemNumber: number;
            primaryItemId: string;
            pItemProps: any;
            groupQuantity: number;
        }> = [];
        const tFilterEligibleItemsStart = nowMs();
        for (var i = 0; i < tItems.length; ++i) {
            const tPrimaryItemId = tItems[i].basketItemIds?.[0];
            if (!tPrimaryItemId) {
                // tItemIdsForProps filtered these out, so don't advance cursor.
                continue;
            }

            const pItemProps = tItemPropsByItemId.get(tPrimaryItemId);
            if (!pItemProps || pItemProps.article === undefined) {
                continue;
            }

            // get ignore structure state
            if (
                pItemProps.article.variantCode?.indexOf("IGNORE.Ignore=1") != -1
            ) {
                if (DEBUG_RENEW_QUOTE_LINES) {
                    console.log(
                        "Item " +
                        pItemProps.article.baseArticleNumber +
                        " is ignored.",
                    );
                }
                continue;
            }

            const groupQuantity = tItems[i].basketItemIds?.length ?? 1;
            tEligibleItems.push({
                lineItemNumber: i,
                primaryItemId: tPrimaryItemId,
                pItemProps,
                groupQuantity,
            });
        }
        logPerf(
            "filter eligible items",
            tFilterEligibleItemsStart,
            `eligibleCount=${tEligibleItems.length}`,
        );

        // Batch-fetch price calculations for ALL eligible items in a single call.
        const tAllEligibleItemIds = tEligibleItems.map((e) => e.primaryItemId);
        const tBatchCalcStart = nowMs();
        const tAllItemCalculations = tAllEligibleItemIds.length
            ? await mSession.basket.getPriceCalculationSheets(
                tAllEligibleItemIds,
                PRICING_PROCEDURE_NAME,
            )
            : [];
        logPerf(
            "batch getPriceCalculationSheets (items)",
            tBatchCalcStart,
            `itemCount=${tAllEligibleItemIds.length}`,
        );

        // Pass 2: build insert rows using pre-fetched price calculations.
        // const tBuildInsertRowsStart = nowMs();
        for (var j = 0; j < tEligibleItems.length; ++j) {
            const {
                lineItemNumber: lineitemnumber,
                primaryItemId,
                pItemProps,
                groupQuantity,
            } = tEligibleItems[j];

            // Use positional indexing
            // Fallback to a single-item call if batch returned fewer results.
            let pCalculation;
            if (j < tAllItemCalculations.length) {
                //pCalculation = tAllItemCalculations[j].sheet;
                pCalculation = tAllItemCalculations.find(item => item.id === tEligibleItems[j].primaryItemId)?.sheet ?? null;
            }
            if (j >= tAllItemCalculations.length || pCalculation == null) {
                const tFallbackCalc =
                    await mSession.basket.getPriceCalculationSheets(
                        [primaryItemId],
                        PRICING_PROCEDURE_NAME,
                    );
                pCalculation = tFallbackCalc[0].sheet;
                console.log(
                    "Warning: batch getPriceCalculationSheets did not return a calculation for item " +
                    primaryItemId +
                    ", falling back to single-item call.",
                );
            }
            var cpqrowtype = 0; // Main article
            if (pItemProps.article.inactivePositionState == undefined) {
                cpqrowtype = 0;
            } else if (
                pItemProps.article.inactivePositionState[0].optional !=
                undefined &&
                pItemProps.article.inactivePositionState[0].optional == true
            ) {
                // optional article
                cpqrowtype = 1;
            } else {
                cpqrowtype = 2;
            } // Alternative

            // EOS: le righe alternative (cpqrowtype == 2) ed optional non vanno create sulla quote DC update 14/07/2026 richiesto da Stefan Z + T
            if (cpqrowtype != 0) {
                continue;
            }

            var articleNo = "";
            var description = "";
            // Article number
            if (pItemProps.article.useFinalArticleNumber === true) {
                articleNo = pItemProps.article.finalArticleNumber ?? "";
            } else {
                articleNo = pItemProps.article.baseArticleNumber ?? "";
            }
            // description
            description = pItemProps.article.shortText ?? "";
            if (description === undefined || description === "") {
                description = pItemProps.article.longText ?? "";
            }
            // specialModelInformation
            var specialModelInformation = "";

            const tmRow = pItemProps.tmRows?.find(
                (item: any) => item.textId === "71",
            );
            if (tmRow && tmRow.texts.length > 0) {
                specialModelInformation = tmRow.texts[0].text;
            }

            var quantity = (pItemProps.article.quantity ?? 1) * groupQuantity;
            // Net price per unit
            let netPricePerUnit = 0;
            let netDiscountAmount = 0;
            let netVatAmount = 0;

            let tLevelPricePerUnit = undefined;
            let tLevelDiscountAmount = undefined;
            let tLevelVatAmount = undefined;

            const gNetValueCalcLineLevel = 500;
            const eosLevelPricePerUnit = 200; // 130=Preis Brutto; 200=BruttoWert
            const eosLevelDiscountAmount = 300;
            const eosLevelVatAmount = 510;
            const eosLevelVatAmountUSA = 511;

            for (let i = 0; i < pCalculation.lines.length; ++i) {
                if (pCalculation.lines[i].level === gNetValueCalcLineLevel) {
                    //tNetValueCalcLine = pCalculation.lines[i];
                    //                break;
                } else if (
                    pCalculation.lines[i].level === eosLevelPricePerUnit
                ) {
                    tLevelPricePerUnit = pCalculation.lines[i];
                } else if (
                    pCalculation.lines[i].level === eosLevelDiscountAmount
                ) {
                    tLevelDiscountAmount = pCalculation.lines[i];
                } else if (pCalculation.lines[i].level === eosLevelVatAmount) {
                    tLevelVatAmount = pCalculation.lines[i];
                } else if (
                    pCalculation.lines[i].level === eosLevelVatAmountUSA &&
                    tLevelVatAmount == null
                ) {
                    tLevelVatAmount = pCalculation.lines[i];
                }
                if (
                    taxRate == null &&
                    (pCalculation.lines[i].level === eosLevelVatAmount ||
                        pCalculation.lines[i].level === eosLevelVatAmountUSA)
                ) {
                    taxRate = pCalculation.lines[i].amount?.value;
                }
            }

            // price per unit
            if (tLevelPricePerUnit != null) {
                if (tLevelPricePerUnit.amount != null) {
                    netPricePerUnit = tLevelPricePerUnit.amount.value ?? 0;
                } else if (tLevelPricePerUnit.value != null) {
                    netPricePerUnit = tLevelPricePerUnit.value.value ?? 0;
                }
            } else {
                netPricePerUnit = 0;
            }
            // discount amount
            if (tLevelDiscountAmount != null) {
                if (tLevelDiscountAmount.value != null) {
                    netDiscountAmount = tLevelDiscountAmount.value.value ?? 0;
                } else if (tLevelDiscountAmount.amount != null) {
                    netDiscountAmount = tLevelDiscountAmount.amount.value ?? 0;
                }
            } else {
                netDiscountAmount = 0;
            }
            netDiscountAmount = netDiscountAmount * groupQuantity * -1;
            // VAT amount
            if (tLevelVatAmount != null) {
                if (tLevelVatAmount.value != null) {
                    netVatAmount = tLevelVatAmount.value.value ?? 0;
                } else if (tLevelVatAmount.amount != null) {
                    netVatAmount = tLevelVatAmount.amount.value ?? 0;
                }
            } else {
                netVatAmount = 0;
            }

            //amount = tCalculations[0].sheet.netValue.value ?? 0;

            // *quoteid
            // manualdiscountamount -> unit * qty
            // *productdescription - product No
            // *description =
            // *priceperunit
            // *quantity = tCalculations[0].sheet.quantity.value
            // *producttypecode = 1
            // *isproductoverridden = true
            // *ispriceoverridden = true
            // ev. currencycode = tCalculations[0].sheet.currency
            var entityName = "quotedetail"; // nome entity
            var data = {
                "quoteid@odata.bind": "/quotes(" + quoteId + ")",
                productdescription: articleNo,
                description: description,
                priceperunit: netPricePerUnit,
                quantity: quantity,
                producttypecode: 1,
                isproductoverridden: true,
                ispriceoverridden: true,
                manualdiscountamount: Math.abs(netDiscountAmount),
                tax: netVatAmount,
                mas_specialmodelinformation: specialModelInformation,
                lineitemnumber: lineitemnumber,
                sequencenumber: lineitemnumber,
                mas_cpqrowtype: cpqrowtype,
            };
            // calculate totals for header update (only main articles, not optional or alternative)
            if (cpqrowtype == 0) {
                totalLineAmountMain =
                    totalLineAmountMain + netPricePerUnit * (quantity ?? 1);
                totalLineDiscountAmountMain =
                    totalLineDiscountAmountMain + netDiscountAmount;
            }

            // Construct request object from the metadata
            var insRequest = new InsRequest(entityName, data);
            changeSetIns.push(insRequest);
        }
        // logPerf(
        //     "build insert rows",
        //     tBuildInsertRowsStart,
        //     `insertCount=${changeSetIns.length}`,
        // );
        // ===== EOS: persistenza spostata su Custom API mas_SaveQuoteFromBasket =====
        // delete + create righe + update header in un'unica transazione server-side.

        // 1) calc header discount
        var discount = 0.0;
        const eosLevelHeaderDiscountAmount = 410;
        const eosLevelHeaderDiscountAmount2 = 413;
        const tHeaderTotalsStart = nowMs();
        for (var i = 0; i < tCalculations[0].sheet.lines.length; ++i) {
            if (
                tCalculations[0].sheet.lines[i].level == eosLevelHeaderDiscountAmount ||
                tCalculations[0].sheet.lines[i].level == eosLevelHeaderDiscountAmount2
            ) {
                discount =
                    discount +
                    (tCalculations[0].sheet.lines[i].value?.value ?? 0) * -1.0;
            }
        }
        logPerf("calculate header totals", tHeaderTotalsStart);

        // 2) payload for Custom API
        const tApiPayload = {
            header: {
                discountamount: discount,
                mas_taxpercentage: taxRate,
                mas_totallineamountmain: totalLineAmountMain,
                mas_totallinediscountamountmain: totalLineDiscountAmountMain,
            },
            lines: changeSetIns.map((r: any) => {
                const p = { ...r.payload };
                delete p["quoteid@odata.bind"];
                return p;
            }),
        };
        this.mExpectedQuoteLineCount = tApiPayload.lines.length;
        // 3) call customapi (delete + create + update header) server-side
        const tApiStart = nowMs();
        const tSaveQuoteRequest: any = {
            ItemsJson: JSON.stringify(tApiPayload),
            QuoteId: quoteId,
            getMetadata: () => ({
                boundParameter: null,
                parameterTypes: {
                    ItemsJson: { typeName: "Edm.String", structuralProperty: 1 },
                    QuoteId: { typeName: "Edm.String", structuralProperty: 1 },
                },
                operationType: 0, // Action (Custom API non bound)
                operationName: "mas_SaveQuoteFromBasket",
            }),
        };
        try {
            document.eosInfo.Xrm.WebApi.online.execute(tSaveQuoteRequest);
            logPerf("mas_SaveQuoteFromBasket", tApiStart, `lines=${tApiPayload.lines.length}`);
        } catch (error: any) {
            //show the error to the user
            let alertStrings = { confirmButtonLabel: 'OK', text: "There was an error with the CPQ comunication.\nTechnical details: " + (error?.message ?? error), title: "Error" };
            let alertOptions = { height: 320, width: 260 };
            document.eosInfo.Xrm.Utility.closeProgressIndicator();

            document.eosInfo.Xrm.Navigation.openAlertDialog(alertStrings, alertOptions);
            throw error; // blocca upload OBK se salvataggio righe fallisce
        }
        // Removed form.save(): header is updated by Custom API.
        // at the ENDING of the saveOBK method we have to refresh the form to view updated values.
        logPerf("total function runtime incl. custom api", tFunctionStart);
    }

    //enables/disables the "Activate Quote" button by setting the global flag "MAS.Quote.BarActions.canActivateQuote"
    private setActivateQuoteEnabled(pEnabled: boolean): void {
        try {
            (window.top as any).eosQuoteSyncBusy = !pEnabled;
            document.eosInfo._formContext.ui.refreshRibbon();
        } catch (e: any) {
            console.log("setActivateQuoteEnabled error: " + (e?.message ?? e));
        }
    }
    //function to poll the quote lines subgrid until the expected number of
    // lines is reached or a timeout occurs. Valid only if the user stays in the form.
    private pollRefreshGrid(
        subgridName: string = "quotedetailsGrid",
        totalMs: number = 120000,
        intervalMs: number = 5000,
    ): void {
        if (this.mPollTimer) {
            clearInterval(this.mPollTimer);
            this.mPollTimer = null;
        }

        const tExpected = this.mExpectedQuoteLineCount;
        const tFormContext = document.eosInfo._formContext;
        const tGrid = tFormContext.getControl(subgridName);

        if (!tGrid || tExpected == null) {
            tFormContext.data.refresh(false);
            tFormContext.ui.clearFormNotification("refreshGridNotification");
            return;
        }

        // disable "Activate Quote" while processing
        this.setActivateQuoteEnabled(false);

        const readCount = (): number => {
            const g = tGrid.getGrid();
            // getTotalRecordCount = server total
            return typeof g.getTotalRecordCount === "function"
                ? g.getTotalRecordCount()
                : g.getRows().getLength();
        };
        const readSignature = (): string => {
            try {
                const tRows = tGrid.getGrid().getRows();
                const tIds: string[] = [];
                tRows.forEach((pRow: any) => {
                    try { tIds.push(pRow.getData().getEntity().getId()); } catch { /* noop */ }
                });
                return tIds.sort().join("|");
            } catch {
                return "";
            }
        };
        // OLD rows count + signature to detect changes (IDs change on every refresh, so we need a signature)
        const tBaseline = readCount();
        const tBaselineSignature = readSignature();
        let tSawChange = false;
        let tStableMatches = 0; // fallback
        let tStopped = false;
        const tEnd = Date.now() + totalMs;

        const stop = (reason: string) => {
            if (tStopped) return;
            tStopped = true;
            if (this.mPollTimer) {
                clearInterval(this.mPollTimer);
                this.mPollTimer = null;
            }
            try { tGrid.removeOnLoad(onGridLoad); } catch { /* noop */ }
            try { tGrid.refresh(); } catch { /* noop */ }
            tFormContext.data.refresh(false); // refresh header + values
            tFormContext.ui.clearFormNotification("refreshGridNotification");
            // re-enable "Activate Quote" along with removing the notification
            this.setActivateQuoteEnabled(true);
            console.log("pollRefreshGrid: stopped (" + reason + ").");
        };

        // onLoad handler to check if the expected number of rows is reached
        const onGridLoad = () => {
            if (tStopped) return;
            const tCount = readCount();
            const tSignature = readSignature();

            // ids change on every refresh, so we need a signature to detect changes
            if (tCount !== tBaseline || tSignature !== tBaselineSignature) {
                tSawChange = true;
            }

            // fallback: correct count for N consecutive loads => accept anyway
            tStableMatches = tCount === tExpected ? tStableMatches + 1 : 0;

            console.log(
                "pollRefreshGrid: loaded=" + tCount +
                " expected=" + tExpected +
                " baseline=" + tBaseline +
                " sawChange=" + tSawChange +
                " stable=" + tStableMatches,
            );

            if (tCount === tExpected && (tSawChange || tStableMatches >= 3)) {
                stop("count reached");
            } else if (Date.now() >= tEnd) {
                stop("timeout");
            }
        };
        tGrid.addOnLoad(onGridLoad);

        this.mPollTimer = setInterval(() => {
            if (tStopped) return;
            if (Date.now() >= tEnd) {
                stop("timeout");
                return;
            }
            try {
                tGrid.refresh();
            } catch (e: any) {
                console.log("pollRefreshGrid refresh error: " + (e?.message ?? e));
            }
        }, intervalMs);
    }

    private async uploadFile(obkFileUrl: string): Promise<void> {
        console.log("**Begin upload file");
        document.eosInfo.Xrm.Utility.showProgressIndicator(
            "Please wait: pconBasket file is uploading...",
        );
        var reader = new FileReader();
        const fileName = obkFileUrl;

        /* -- GL BEGIN -- */
        var makeRequest = function (
            method: string,
            fileName: string,
            url: string,
            bytes: any,
            firstRequest: boolean,
            offset: any,
            count: any,
            fileBytes: any,
        ) {
            return new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();
                request.open(method, url);
                if (firstRequest)
                    request.setRequestHeader("x-ms-transfer-mode", "chunked");
                request.setRequestHeader("x-ms-file-name", fileName);
                if (!firstRequest) {
                    request.setRequestHeader(
                        "Content-Range",
                        "bytes " +
                        offset +
                        "-" +
                        (offset + count - 1) +
                        "/" +
                        fileBytes.length,
                    );
                    request.setRequestHeader("Content-Type", "application/octet-stream");
                }
                request.onload = resolve;
                request.onerror = reject;
                if (!firstRequest) {
                    request.send(bytes);
                } else {
                    request.send();
                }
            });
        };

        var fileChunckUpload = async function (
            response: any,
            fileName: string,
            fileBytes: any,
        ) {
            var req = response.target;
            var url = req.getResponseHeader("location");
            var chunkSize = parseInt(req.getResponseHeader("x-ms-chunk-size"));
            var offset = 0;
            while (offset <= fileBytes.length) {
                var count =
                    offset + chunkSize > fileBytes.length
                        ? fileBytes.length % chunkSize
                        : chunkSize;
                var content = new Uint8Array(count);
                for (var i = 0; i < count; i++) {
                    content[i] = fileBytes[offset + i];
                }
                response = await makeRequest(
                    "PATCH",
                    fileName,
                    url,
                    content,
                    false,
                    offset,
                    count,
                    fileBytes,
                );
                console.log(
                    "**fileChunckUpload - offset: " +
                    offset +
                    " - count: " +
                    count,
                );

                req = response.target;
                if (req.status === 206) {
                    // partial content, so please continue.
                    console.log(
                        "**fileChunckUpload 206 - offset: " +
                        offset +
                        " - count: " +
                        count,
                    );

                    offset += chunkSize;
                    if (offset >= fileBytes) {
                        //if added by GL
                        break;
                    }
                } else if (req.status === 204) {
                    // request complete.
                    // console.log("**fileChunckUpload 204 - offset: " + offset + " - count: " + count);
                    document.eosInfo.Xrm.Utility.closeProgressIndicator();
                   const formContext = document.eosInfo._formContext;
                   if (document.eosInfo.entitySetname === "opportunities") {
                    if (formContext.data.getIsDirty()) {
                        await formContext.data.save();
                    }
                    formContext.ui.refresh();
                }
                    formContext.ui.tabs.get("Summary_tab")?.setFocus();
                    break;
                } else {
                    // error happened.
                    console.log(
                        "**fileChunckUpload xxx - offset: " +
                        offset +
                        " - count: " +
                        count,
                    );
                    // log error and take necessary action.
                    break;
                }
            }
        };

        reader.onload = function () {
            var arrayBuffer = this.result;

            //@ts-ignore
            var array = new Uint8Array(arrayBuffer);
            // parent.Xrm
            var url =
                document.eosInfo.Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.1/" +
                document.eosInfo.entitySetname +
                "(" +
                document.eosInfo.recordId.substring(
                    1,
                    document.eosInfo.recordId.length - 1,
                ) +
                ")/" +
                document.eosInfo.obkFileField;
            // this is the first request. We are passing content as null.
            makeRequest(
                "PATCH",
                fileName,
                url,
                null,
                true,
                null,
                null,
                null,
            ).then(function (s: any) {
                fileChunckUpload(s, fileName, array);
            });
        };
        let blob = await fetch(fileName).then((r) => r.blob());
        reader.readAsArrayBuffer(blob);
        console.log("**End upload file");
    }
}