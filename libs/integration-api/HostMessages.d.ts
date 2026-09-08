import { HostMessageType, MessageApiVersion, BaseMessage } from "./MessageApi";
import { ClipboardData, UserSetting, GeneratedReport, SessionModifications, EaiwsConfig } from "./types";

/** Base interface for host messages. */
export interface HostMessage extends BaseMessage
{
    type: HostMessageType;
}

/**
 * Will be send during initialization of the basket to request the configuration.
 * A `wbk.configuration` message has to be send back to the basket.
 */
export interface HostGetConfigurationMessage extends HostMessage
{
    type: "wbkHost.getConfiguration";
    parameter: {
        appVersion: string;
        messageApiVersion: MessageApiVersion;
        /**
         * **(Basic integration only)**
         * Name of the logged-in user.
         */
        userName?: string;
        /**
         * **(Basic integration only)**
         * pCon.login access token which is required by certain pCon cloud services.
         * Note: The access token usually expires after 1 hour. Its important to handle the `wbkHost.updateUserAccessToken` message.
         */
        userAccessToken?: string;
        /**
         * **(Basic integration only)**
         * Configuration of the active EAIWS session.
         */
        eaiws?: EaiwsConfig;
    };
}

/**
 * Will be send to request the full article data of a custom article.
 * A `wbk.customArticle` message has to be send back to the basket.
 * Note: Will not be called for external catalogs.
 */
export interface HostGetCustomArticleMessage extends HostMessage
{
    type: "wbkHost.getCustomArticle";
    parameter: {
        /** The requested language for the article data in order of priority. */
        language: Array<string>;
        /** id of the articles catalog */
        catalogId: string;
        /** id of the article */
        articleId: string;
        /** Id of the currently active EAIWS tax scheme */
        taxScheme: string;
    };
}

/**
 * **(Basic integration only)**
 * Will be used to send a new pCon.login access token to the host before the old one expires.
 * Contains the new access token as parmater.
 */
export interface WbkHostUpdateUserAccessTokenMessage extends HostMessage
{
    type: "wbkHost.updateUserAccessToken";
    parameter: string;
}

/**
 * Will be send to request the articles of a custom catalog.
 * A `wbk.customCatalogArticles` message has to be send back to the basket.
 * Note: Will not be called for external catalogs.
 */
export interface HostGetCustomCatalogArticlesMessage extends HostMessage
{
    type: "wbkHost.getCustomCatalogArticles";
    parameter: {
        /** The requested language for the catalog data in order of priority. */
        language: Array<string>;
        /** The maxium number of results the query should return. */
        maxResults: number;
        /** Id of the catalog. If undefined articles from all available catalogs should be returned. */
        catalogId?: string;
        /** Search string for the query to perfom a full text search. */
        queryString?: string;
        /** If provided, the series id of the returned aticles should match the provided series id. */
        seriesId?: string;
        /** If provided, the base article number of the returned aticles should match the provided base article number. */
        baseArticleNumber?: string;
    };
}

/**
 * Will be send to store a user setting given as the parameter of the message.
 * If the value of the given setting is `undefined` the setting should be deleted from the storage.
 */
export interface HostSetUserSettingMessage extends HostMessage
{
    type: "wbkHost.setUserSetting";
    parameter: UserSetting;
}

/**
 * Will be send to request a stored user setting. The message parameter represents the key of the requested setting.
 * In response a `wbk.userSetting` message has to be send back to the basket. If the requested setting is unknown or has no value,
 * `undefined` has to be used as the settings value for the `wbk.userSetting` message.
 */
export interface HostGetUserSettingMessage extends HostMessage
{
    type: "wbkHost.getUserSetting";
    parameter: string;
}

/** Will be send if the project title has changed. Contains the new title as parameter. */
export interface HostProjectTitleChangedMessage extends HostMessage
{
    type: "wbkHost.projectTitleChanged";
    parameter: string;
}

/**
 * Will be send if the user clicks on the project save button. The host should then save the project.
 * The basket will be locked until the host sends the message `wbk.saveProjectDone` back to the basket.
 */
export interface HostSaveProjectMessage extends HostMessage
{
    type: "wbkHost.saveProject";
}

/**
 * Will be send as response to a `wbk.getSessionModifications` message which was send to the basket.
 * Contains a list of modifications which were made to the session as parameter.
 */
export interface HostSessionModificationsMessage extends HostMessage
{
    type: "wbkHost.sessionModifications";
    parameter: SessionModifications;
}

/**
 * Will be send every time after the user generated a report.
 */
export interface HostReportGeneratedMessage extends HostMessage
{
    type: "wbkHost.reportGenerated";
    parameter: GeneratedReport;
}

/**
 * Will be send every time the internal basket clipboard has changed.
 */
export interface HostClipboardChangedMessage extends HostMessage
{
    type: "wbkHost.clipboardChanged";
    parameter: ClipboardData | null;
}

/**
 * Will be send to execute a custom action (see `customActions` property of `wbk.configuration` message).
 */
export interface HostExecuteActionMessage extends HostMessage
{
    type: "wbkHost.executeAction";
    parameter: {
        /** key of the action to execute */
        actionKey: string;
        /** IDs of the currently selected basket items. */
        selectedItemIds: Array<string>;
    };
}

/** Will be send if finishing the integration was canceled. */
export interface HostFinishIntegrationCanceledMessage extends HostMessage
{
    type: "wbkHost.finishIntegrationCanceled";
}

/**
 * **(Basic integration only)**
 * Will be send to notify the host that the user used the `logout` function.
 * In this case the user will be logged out and the basket will restart which also restarts the integration (configuration message).
 */
export interface HostLogoutMessage extends HostMessage
{
    type: "wbkHost.logout";
}

/** Will be send if project editing is done. Contains a list of modifications which were made to the session as parameter. */
export interface HostDoneMessage extends HostMessage
{
    type: "wbkHost.done";
    parameter: SessionModifications;
}