/** Current version of the message API. */
export interface MessageApiVersion
{
    /** Major version will be increased for every breaking change in the api. */
    major: 2;

    /** Minor version will be increased for ever non-breaking change in the api. */
    minor: 7;

    /** Patch version will be increased for bug-fix releases. */
    patch: 0;

    /** If not empty the pre-release tag indicates a pre-release (e.g. alpha, beta) */
    preRelease: "";
}

/** Messages to send to the host window. */
export type HostMessageType =
    "wbkHost.getConfiguration" |
    "wbkHost.updateUserAccessToken" |
    "wbkHost.getCustomArticle" |
    "wbkHost.getCustomCatalogArticles" |
    "wbkHost.getUserSetting" |
    "wbkHost.setUserSetting" |
    "wbkHost.projectTitleChanged" |
    "wbkHost.saveProject" |
    "wbkHost.sessionModifications" |
    "wbkHost.reportGenerated" |
    "wbkHost.clipboardChanged" |
    "wbkHost.executeAction" |
    "wbkHost.finishIntegrationCanceled" |
    "wbkHost.logout" |
    "wbkHost.done";

/** Messages to send to the basket window. */
export type WbkMessageType =
    "wbk.configuration" |
    "wbk.updateUserAccessToken" |
    "wbk.customArticle" |
    "wbk.customCatalogArticles" |
    "wbk.userSetting" |
    "wbk.setProjectTitle" |
    "wbk.setClipboard" |
    "wbk.saveProjectDone" |
    "wbk.lockBasketGUI" |
    "wbk.unlockBasketGUI" |
    "wbk.updateBasketGUI" |
    "wbk.getSessionModifications" |
    "wbk.finishIntegration";

/** Base message interface. */
export interface BaseMessage
{
    type: HostMessageType | WbkMessageType;
    parameter?: unknown;
}