import { ClientMessage, StringPair } from "@easterngraphics/wcf/modules/eaiws/session";

import { WbkUpdateUserAccessTokenMessage } from "../../libs/integration-api/WbkMessages";
import { PConLoginClient } from "../../libs/pcon-login/pcon-login";

import { Application } from "../Application";
import { PCON_LOGIN_CLIENT_ID, PCON_LOGIN_SCOPE } from "../Config";

/**
 * **(Advanced integration only)**
 * Used in advanced mode for user login and license handling.
 */
export class LoginHandler
{
    public get accessToken(): string | undefined
    {
        return (this.mAccesToken ?? undefined);
    }

    public constructor(pApp: Application)
    {
        this.mApp = pApp;
        this.mAccesToken = null;

        //create an instance of PConLoginClient
        this.mLoginClient = new PConLoginClient({
            client_id: PCON_LOGIN_CLIENT_ID,
            scope: PCON_LOGIN_SCOPE,
            //redirect_uri: window.location.origin + window.location.pathname + POPUP_URL,
            redirect_uri: "https://zingerle.group/pcon-redirect?rel=" + window.location.origin + "/WebResources/mas_cpq_r2_redirect.html",
        });
    }

    public async handlePopupFinished(): Promise<void>
    {
        this.mLoginClient.handlePopupFinished();
        this.mAccesToken = await this.mLoginClient.getAccessToken();

        //keep license live (IMPORTANT: check error handling in this function)
        this.startLicenseKeepAlive();

        //make sure the basket ui always has a valid access token
        this.startBasketAccessTokenUpdate();
    }

    public async parepareLogin(): Promise<boolean>
    {
        try {
            const tPConLoginToken = await this.mLoginClient.getAccessToken();
            if (this.mLoginClient.isAccessTokenValid()) {
                const url = new URL('/api/v1/account/user', "https://login.pcon-solutions.com");
                const response = await fetch(url.toString(), {
                    headers: {
                        Authorization: `Bearer ${tPConLoginToken}`,
                    },
                });
    
                if (response.status !== 200) {
                    console.error(response.status.toString());
                    return false;
                } else {
                    const accessTokenValid = this.mLoginClient.isAccessTokenValid();
                    if(accessTokenValid) {
                        this.mAccesToken = await this.mLoginClient.getAccessToken();
                    }
                    return accessTokenValid;
                }
            }
            return false;
        } catch (error) {
            console.log("access token not valid: " + error);
            this.mLoginClient.removeAccessTokenInformation();
            this.mLoginClient.accessTokenInformation = null;
            return false;
        }
    }

    /**
     * Function which starts the pCon.login process using a popup.
     */
    public async loginWithPopup(nextLocation: string): Promise<boolean>
    {
        this.mLoginClient.loginWithPopup(nextLocation);

        return (true);
    }

    //// private ///////////////////////////////////////////////////////////////////////////////////

    private mApp: Application;
    private mLoginClient: PConLoginClient;
    private mAccesToken: string | null;

    /** get current access token from pCon.login and notify basket if it changed  */
    private async updateAccessToken(pForceRefresh = false): Promise<void>
    {
        const tPreviousToken = this.mAccesToken;
        this.mAccesToken = await this.mLoginClient.getAccessToken(pForceRefresh);

        //send new token to basket
        if (this.mAccesToken != null && this.mAccesToken !== tPreviousToken) {
            const tMessage: WbkUpdateUserAccessTokenMessage = {
                type: "wbk.updateUserAccessToken",
                parameter: this.mAccesToken
            };
            this.mApp.sendMessageToBasket(tMessage);
        }
    }

    /** Makes sure the license will not expire. */
    private startLicenseKeepAlive(): void
    {
        //trigger license update every 30 seconds to keep the license alive
        setTimeout(async () =>
        {
            let tSessionAlive = true;
            try {
                await this.updateAccessToken(); //make sure a valid access token is used

                //prepare message and send it to the EAIWS session guard plugin
                const tMessage = new ClientMessage();
                tMessage.target = "plugin:eaiws::plugin::session_guard";
                tMessage.messageId = "updateToken";
                tMessage.data = [
                    new StringPair("accessToken", this.accessToken),
                    new StringPair("licenseType", "user")
                ];
                const tResult = await this.mApp.session.session.sendMessage([tMessage]);
                tSessionAlive = tResult.sessionAlive;

                //check if token update was successfull
                let tUpdateFailed = true;
                if (tSessionAlive) {
                    tUpdateFailed = tResult.messages.length > 0 && tResult.messages[0].statusCode !== "OK";

                    // restart timeout if update was successfull
                    if (!tUpdateFailed) this.startLicenseKeepAlive();
                }
                if (tUpdateFailed) {
                    throw new Error("Failed to update token:\n" + JSON.stringify(tResult, undefined, 2));
                }
            } catch (pError) {
                /*
                IMPORTANT: You have to handle this error.
                The license keep alive failed. That means the current EAIWS session is no longer licensed.
                The session will be closed automatically after 15 minutes without a license.
                To prevent data loss you should notify the user that he should save his work and restart the basket.
                */
                if (tSessionAlive) {
                    alert("Please save your work. License keep alive failed:\n" + pError);
                } else {
                    alert("Your session has expired.:\n" + pError);
                }
            }
        }, 30000);
    }

    /** Ensures that the basket ui always has a valid access token */
    private startBasketAccessTokenUpdate(): void
    {
        /*
        Access tokens are valid for one hour. To make sure that the basket UI is using a valid
        token we send a new token every 30 minuten to the basket.
        */
        setInterval(async () =>
        {
            await this.updateAccessToken(true); //request a new token using the "force" option
        }, 1800000);
    }
}