import { ArticleProperties, ItemProperties } from "@easterngraphics/wcf/modules/eaiws/basket";
import { HostExecuteActionMessage } from "../../libs/integration-api/HostMessages";
import { WbkUpdateBasketGUIMessage } from "../../libs/integration-api/WbkMessages";
import { CustomActions, MenuAction } from "../../libs/integration-api/types";
import { Application } from "../Application";
import { PRICING_PROCEDURE_NAME } from "../Config";

/** Returns the configuration for the custom actions used for the `wbk.configuration` message. */
export function getCustomActions(): CustomActions
{
    const tAction: MenuAction = {
        key: "exampleActionMenu",
        text: "Example Actions",
        subActions: [
            {
                key: "action-insert-userarticle",
                text: "Create User Article",
                iconName: "mdi-chair-rolling"
            }, {
                key: "action-apply-discount",
                text: "Apply Discount",
                iconName: "mdi-percent-circle-outline",
                dependsOnItemSelsection: true
            }
        ]
    }

    return {
        basketActions: [
            tAction
        ]
    };
}

/**
 * Execute the custom actions.
 */
export function handleExecuteActionMessage(pApp: Application, pMessage: HostExecuteActionMessage): void
{
    if (pMessage.parameter.actionKey === "action-insert-userarticle") {
        void createUserArticle(pApp);
    } else if (pMessage.parameter.actionKey === "action-apply-discount") {
        void applyDiscount(pApp, pMessage.parameter.selectedItemIds);
    }
}

export async function createUserArticle(pApp: Application): Promise<void>
{
    try {
        pApp.lockBasketUI();

        //create user article
        const tItemId = await pApp.session.basket.insertUserArticle(null, null, "Example Article");

        //define properties
        const tItemProps = new ItemProperties();
        tItemProps.article = new ArticleProperties();
        tItemProps.article.manufacturerId = "EXAMPLE";
        tItemProps.article.seriesId = "S1";
        tItemProps.article.shortText = "My Chair";
        tItemProps.article.salesCurrency = "EUR";
        tItemProps.article.salesPrice = 100.0;
        pApp.session.basket.setItemProperties(tItemId, tItemProps);

        //update basket UI
        const tUpdateMessage: WbkUpdateBasketGUIMessage = {
            type: "wbk.updateBasketGUI",
            parameter: {
                itemsCreated: true
            }
        }
        pApp.sendMessageToBasket(tUpdateMessage)
    } catch (pError) {
        console.error(pError);
    } finally {
        pApp.unlockBasketUI()
    }
}

export async function applyDiscount(pApp: Application, pSelectedItems: Array<string>): Promise<void>
{
    try {
        pApp.lockBasketUI();

        if (pSelectedItems.length !== 1) {
            alert("Please select a single article.");
            return;
        }

        //get selected item to check type
        const tItems = await pApp.session.basket.getAllItems([pSelectedItems[0]]);
        if (tItems[0].itemType === "Undefined" || tItems[0].itemType === "Folder" || tItems[0].itemType === "Text") {
            alert("Please select an article.");
            return;
        }

        //apply 20% discount
        await pApp.session.basket.setConditionAmount([tItems[0].itemId], PRICING_PROCEDURE_NAME, "DIP10", 0, -20, "%");

        //update basket UI
        const tUpdateMessage: WbkUpdateBasketGUIMessage = {
            type: "wbk.updateBasketGUI",
            parameter: {
                updatedItems: [
                    {
                        itemId: tItems[0].itemId,
                        updateFlags: 0x00000008 //calculation requires an update for this item
                    }
                ]
            }
        }
        pApp.sendMessageToBasket(tUpdateMessage)
    } catch (pError) {
        console.error(pError);
    } finally {
        pApp.unlockBasketUI()
    }
}