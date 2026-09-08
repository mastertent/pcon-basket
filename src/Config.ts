////////
//// main configuration options

/** url of the basket */
export const BASKET_URL =
    "https://integration.basket.pcon-solutions.com/v2.14/?mode=integration";

/** Gatekeeper application ID. If provided add your application ID here. */
export const GATEKEEPER_APPLICATION_ID: string | undefined = undefined;

/** Client ID for pCon.login. Add your client id here. */
export const PCON_LOGIN_CLIENT_ID = "W-BK_mastertent_dynamics";

/**
 * **(Advanced integration only)**
 * Scope used for pCon.login. If long term tokens are required use `create_longterm_token query_account`.
 */
export const PCON_LOGIN_SCOPE: string = "query_account";

////////
//// Calculation and pricing

/** Pricing procedure to use for pCon.basket. change this if you have a custom one. Standard was: STDB2B_WBK */
export const PRICING_PROCEDURE_NAME = "STDB2B_ZINGERLE";

/** level of the calculation line which contains the net value (depends on the used pricing procedure) */
export const NETVALUE_CALCLINE_LEVEL = 500;

/** Set to true if the OFML price date should be supported. */
export const PRICE_DATE_SUPPORTED = false;

/**
 * Enable this if you want to work with pricing conditions defined at the users pCon.login account/organization.
 * Note: You are no longer able to define pricing conditions via API if this feature is enabled.
 */
export const PCON_PRICING_CONDITIONS_SUPPORTED = false;

////////
//// Article data

/** Column which should be used for the item image */
export const COLUMN_ITEM_IMAGE = "cc080d73-88f4-4bfc-8ec1-e7e2ad30739a";

/** Column which should be used for the external item number */
export const COLUMN_EXT_ITEM_NUMBER = "c962203c-7e83-4a2f-8060-acaa4a06c921";

/** ID of the additional text */
export const TEXT_ID_ADDITIONAL_TEXT = "@add";

/** ID of the special model information */
export const TEXT_ID_SPECIAL_MODEL_INFO = "71";

////////
//// Reporting

/**
 * Report templates which will be available to the user.
 * Note: Templates which are assigned to the users pCon.login organization are always available.
 */
export const REPORT_TEMPLATES = [
    "basket-standard-pro-fop",
    "basket-standard-pro-noprices",
    "basket-standard-pro-comparison",
];

/** Report template which is initially selected in the GUI. If undefined the first available template will be used. */
export const REPORT_DEFAULT_TEMPLATE: string | undefined = undefined;

/** Report template which will be used in this example for the PDF export */
export const REPORT_EXPORT_TEMPLATE = "basket-standard-pro-fop";
