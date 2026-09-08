import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";
import { ajax } from "@easterngraphics/wcf/modules/utils/async";

interface GatekeeperResponse
{
    server: string;
    sessionId: string;
    keepAliveInterval: number;
}

export interface GatekeeperOptions
{
    /** pCon.login access token */
    userToken?: string;
    /** application specific id  */
    applicationId?: string;
    /** Can be used to predefined the locale of the created session */
    locale?: string;
}

/**
 * Request an EAIWS session from the Gatekeeper with fallback handling.
 * @param pSession EAIWS session object
 * @param pGatekeeperId The gatekeeper id which should be used
 * @param pOptions Addition options
 */
export async function getSessionFromGatekeeper(pSession: EaiwsSession,
    pGatekeeperId: string, pOptions: GatekeeperOptions): Promise<void>
{
    try {
        const tResponse = await ajax<GatekeeperResponse>(
            'POST',
            'https://eaiws-server.pcon-solutions.com/v3/session/' + pGatekeeperId,
            pOptions,
            {
                dataType: "json",
                retryAttempts: 0,
                timeout: 10000 //use fallback after 10 seconds
            }
        );

        //connect to the received session
        pSession.connect(tResponse.server, tResponse.sessionId, tResponse.keepAliveInterval * 1000);
    } catch (pError) {
        console.log("Failed to start gatekeeper session: " + pError);
        return (getSessionFromFallbackGatekeeper(pSession, pGatekeeperId, pOptions));
    }
}

/**
 * Function to request an EAIWS session from the fallback Gatekeeper server.
 */
async function getSessionFromFallbackGatekeeper(pSession: EaiwsSession, pGatekeeperId: string,
    pOptions: GatekeeperOptions): Promise<void>
{
    console.log("Using fallback gatekeeper server.");
    const tResponse = await ajax<GatekeeperResponse>(
        'POST',
        'https://eaiws-server.pcon-solutions.com/v3/session/' + pGatekeeperId,
        pOptions,
        {
            dataType: "json",
            retryAttempts: 0,
            timeout: 60000
        }
    );
    pSession.connect(tResponse.server, tResponse.sessionId, tResponse.keepAliveInterval * 1000);
}