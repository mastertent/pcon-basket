/**
 * Contains options for OAuth API.
 *
 * Usually, it is enough to specify your client_id and your redirect_uri registered for your application.
 * Appropriate defaults are set for the remaining parameters, though they can be set by your application
 * if necessary.
 *
 * For more information about the properties, please refer to:
 * https://login.pcon-solutions.com/doc/api/oauth2.html
 */
export interface OAuthOptions {
    /** The registered client id for the application */
    client_id: string;
    /** URL that should be redirected to on success */
    redirect_uri: string;
    /** Space delimited list of required scopes */
    scope?: string;
    /** Set to 1 to indicate the application wants to use refresh tokens, 0 if not */
    want_refresh_token?: boolean;
    /** Provide text that helps identify where this token originated from/is used (e.g. a hostname/useragent ) */
    refresh_token_app_infos?: string;
    /** Set to true to persist tokens in localStorage */
    persist_tokens?: boolean;
    /** Set this parameter to true, if you want to force the user to login again */
    force_login?: boolean;
}
/**
 * Defines the Base URL and the endpoints for the pCon.login OAuth API.
 * By default, appropriate defaults for https://login.pcon-solutions.com will be set.
 */
export interface PConLoginURLs {
    /** URL of the OAuth server */
    base_url: string;
    /** Authorize endpoint path */
    authorize_endpoint: string;
    /** Request token endpoint path */
    request_token_endpoint: string;
    /** Revoke token endpoint path */
    revoke_token_endpoint: string;
    /** Logout endpoint path */
    logout_endpoint: string;
}
/**
 * Client for the PCon Login OAuth API
 */
export declare class PConLoginClient {
    /** Code challenge method, always "S256" here */
    private readonly code_challenge_method;
    /** Authorization response type, always "code" here */
    private readonly response_type;
    /** Access Token Grant Type, always "authorization_code" here */
    private readonly grant_type;
    /** Key to store OAuth variables in session or localStorage */
    private readonly accessTokenStorageKey;
    private readonly pkceStorageKey;
    private readonly nextStorageKey;
    /** Safety margin for expiration of access token */
    private readonly accessTokenExpirationSafetyMarginMs;
    /** OAuth Options set for the client */
    options: OAuthOptions;
    /** pCon.login URLS for OAuth API */
    private urls;
    /** Values necessary for PKCE */
    private pkceValues;
    /** Access token information */
    accessTokenInformation: any;
    /** Route to redirect to after login */
    private next;
    /**
     * Constructor for the login client.
     *
     * @param oauthOptions - Contains the parameters provided to the OAuth API
     */
    constructor(oauthOptions: OAuthOptions, pconLoginURLS?: PConLoginURLs);
    /**
     * Generate values necessary for PKCE.
     * Async because of SHA256.
     */
    private initPKCEValues;
    /**
     * Generate Authorization URI for login.
     * Can be used to create your own URI to redirect to or to open in Popup.
     *
     * @returns {URL}
     */
    getAuthorizationURI(): Promise<URL>;
    /**
     * Parse access token information from response
     */
    private parseAccessTokenInformation;
    /**
     * Obtain access token from OAuth API
     */
    private obtainAccessToken;
    /**
     * Start login process by redirecting the browser to the authorization endpoint.
     *
     * NOTE: This means the current state of the page will be lost!
     *
     * @param next - The page you want to redirect to using [[redirectToNext]]. If this parameter is not provided,
     * the library will set the "next" location to the current window.location
     */
    loginWithRedirect(next?: string): Promise<void>;
    loginWithPopup(next?: string): Promise<void>;
    /**
     * This should be called from your redirect URI, after the authorization API endpoint has redirected you
     * to your redirect_uri you set in the constructor.
     * If you
     *
     * This will handle the parameters provided by the authorization API and obtain the access token.
     *
     * The returned promise will resolve, after the access token has been obtained.
     *
     * @throws {OAuthError} Will throw an error if:
     * - No values for PKCE are available in session storage
     * - Authorization Code is not available in query params from redirect
     * - State is not available in query params
     * - State doesn't match the randomly generated state
     * @returns {Promise<void>} Returns the Promise received by the fetch call after parsing the access token
     */
    handleRedirect(): Promise<void>;
    /**
     * Obtain a valid access token.
     * Unless the optional parameter "force_new" is true, this may be a previously cached token.
     * If the returned Promise resolves to null, the application should display the user an
     * appropriate error dialog and restart the login process to obtain valid tokens again.
     *
     * @param force_new - If true, always refreshes token beforehand
     * @returns {string | null } Access token, if available, else null
     */
    getAccessToken(force_new?: boolean): Promise<string | null>;
    /**
     * Request token using refresh token
     */
    private refreshAccessToken;
    /**
     * This should be called after [[handleRedirect]] finished, i.e. the returned
     * promise resolved without error.
     * This will make the access token available in your application.
     *
     * */
    handlePopupFinished(): void;
    /**
     * Revoke access token. Unlike [[logout]], this will only revoke the token, and not logout
     * the user session.
     *
     * NOTE: Usually you will want to call [[logout]] instead of this function.
     *
     * @returns Promise returned by the fetch call to /revoke_tokens
     */
    revokeToken(): Promise<void>;
    /**
     * Revokes access/refresh tokens and logs the user out from pCon.
     *
     * NOTE: As the logout process involves a redirect, the page state will be lost.
     *
     * If you want the user to return to your application after the logout you can pass
     * an appropriate URL as the "next" parameter.
     *
     * @param next - Page to redirect to after logging out
     */
    logout(next?: string): void;
    /** Load access token information from localStorage */
    private loadAccessTokenInformation;
    /** Store access token information into localStorage */
    private storeAccessTokenInformation;
    /** Remove access token information from localStorage */
    removeAccessTokenInformation(): void;
    /**
     * Checks if an access token is available and if it has expired.
     *
     * This is only deducted from information locally available, without a call to the server.
     * It is possible the access token has been invalidated externally,
     * e.g. if the user logs out from elsewhere or by changing password.
     *
     * @returns true, if access token is valid, false if not
     */
    isAccessTokenValid(): boolean;
    /**
     * Thin wrapper around the built-in browser function fetch(), that adds the appropriate "Authorization" header necessary for
     * calls to pCon.login
     *
     * Please refer to the documentation of fetch() for more details on parameters and the return value.
     * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
     *
     * @param resource - The resource you want to fetch.
     * Either the URL as string, or a Request object
     * @param init - An object containing any custom settings that you want
     * to apply to the request.
     * @returns Promise, resolves to null if there is no valid access token and login process should be triggered.
     * else returns Promise returned by fetch
     */
    fetchWithAuth(resource: string | Request, init?: RequestInit | undefined): Promise<Response | null>;
    /**
     * Redirects to next parameter, if next parameter was specified in [[loginWithRedirect]]
     */
    redirectToNext(): void;
}
