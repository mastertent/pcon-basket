export interface SupportedAPIs
{
    /**
     * Enable this if you want to implement a custom user settings storage.
     * In this case the host has to implement the messages `wbkHost.setUserSetting` and `wbkHost.getUserSetting`.
     */
    userSettingsStorage?: boolean;

    /**
     * Enable this if you want to work with pricing conditions defined at the users pCon.login account/organization.
     * Note: You are no longer able to define pricing conditions via API if this feature is enabled.
     */
    pConPricingConditions?: boolean;
}