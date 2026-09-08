/** Eaiws session configuration. */
export interface EaiwsConfig
{
    /** base url of the EAIWS server */
    baseUrl: string;
    /** id of the EAIWS session */
    sessionId: string;
    /** interval for the session keep alive message in milliseconds, 0 disables keep alive (default: 60000) */
    keepAliveInterval?: number;
}