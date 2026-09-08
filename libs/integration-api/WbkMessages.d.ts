import { BasketGuiUpdates, ClipboardData, CustomArticle, CustomCatalogArticle, UserSetting, WbkConfiguration } from "./types";
import { WbkMessageType, BaseMessage } from "./MessageApi";

/** Base interface for wbk messages. */
export interface WbkMessage extends BaseMessage
{
    type: WbkMessageType;
}

/**
 * After a `wbkHost.getConfiguration` message was received, this message has to be send to the basket.
 */
export interface WbkConfigurationMessage extends WbkMessage
{
    type: "wbk.configuration";
    parameter: WbkConfiguration;
}

/**
 * **(Advanced integration only)**
 * Should be used to send a new pCon.login access token to the basket before the old one expires.
 * Has to contain the new access token as parmater.
 */
export interface WbkUpdateUserAccessTokenMessage extends WbkMessage
{
    type: "wbk.updateUserAccessToken";
    parameter: string;
}

/**
 * After a `wbkHost.getCustomArticle` message was received, this message has to be send to the basket.
 */
export interface WbkCustomArticleMessage extends WbkMessage
{
    type: "wbk.customArticle";
    parameter: CustomArticle;
}

/**
 * After a `wbkHost.getCustomCatalogArticles` message was received, this message has to be send to the basket.
 */
export interface WbkCustomCatalogArticlesMessage extends WbkMessage
{
    type: "wbk.customCatalogArticles";
    parameter: Array<CustomCatalogArticle>;
}

/**
 * Has to be sended back to the basket as an response to the `wbkHost.getUserSetting` message.
 */
export interface WbkUserSettingMessage extends WbkMessage
{
    type: "wbk.userSetting";
    parameter: UserSetting;
}

/** Can be send to change the project title. Has to contain the new title as parmater. */
export interface WbkSetProjectTitleMessage extends WbkMessage
{
    type: "wbk.setProjectTitle";
    parameter: string;
}

/**
 * Can be send to change the contents of the clipboard.
 * Note: `null` can be used to clear the clipboard.
 */
export interface WbkSetClipboardMessage extends WbkMessage
{
    type: "wbk.setClipboard";
    parameter: ClipboardData | null;
}

/**
 * Has to be sended back to the basket after receiving the `wbkHost.saveProject` message and saving the project.
 */
export interface WbkSaveProjectDoneMessage extends WbkMessage
{
    type: "wbk.saveProjectDone";
}

/**
 * Locks the basket GUI to prevent any user interaction.
 * For each `wbk.lockBasketGUI` message a `wbk.unlockBasketGUI` message has to follow to unlock the GUI.
 * It is absolutely necessary to make sure that the GUI gets unlocked in any case otherwise the user is not able to continue his work.
 */
export interface WbkLockBasketGUIMessage extends WbkMessage
{
    type: "wbk.lockBasketGUI";
}

/**
 * Unlocks the basket GUI. This message should only be send if `wbk.lockBasketGUI` was used before to lock the GUI.
 */
export interface WbkUnlockBasketGUIMessage extends WbkMessage
{
    type: "wbk.unlockBasketGUI";
}

/**
 * Triggers an update of the basket GUI. Should be used after changes were made to the EAIWS session while pCon.basket is opened.
 * Note: To avoid conflicts and confusion updating the basket GUI should only be done in
 * response to a direct user interaction (e.g user executed a custom action).
 */
export interface WbkUpdateBasketGUIMessage extends WbkMessage
{
    type: "wbk.updateBasketGUI";
    parameter: BasketGuiUpdates;
}

/**
 * Can be used to request the current session modifications. A `wbkHost.sessionModifications`
 * message will be send to the host in response.
 * Note: Everytime the modifications will be requested the internal modifications state will be reset.
 */
export interface WbkGetSessionModificationsMessage extends WbkMessage
{
    type: "wbk.getSessionModifications";
}

/**
 * Can be used to finish the integration programmatically (without using the "Done" button of the application).
 * After receiving the `wbk.finishIntegration` message, the basket will finish all pending tasks
 * and will send a `wbkHost.done` message back to the host afterwards.
 * The basket window can then savely be closed by the host.
 */
export interface WbkFinishIntegrationMessage extends WbkMessage
{
    type: "wbk.finishIntegration";
}