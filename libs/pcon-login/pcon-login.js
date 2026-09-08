(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PConLogin = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCodeVerifierAndChallenge = exports.generateCodeChallenge = exports.generateCodeVerifier = exports.generateRandomState = void 0;
/** Generate random bytes buffer */
// const generateRandomBytes = (length = 32): Buffer => {
const generateRandomBytes = (length = 32) => {
    let randomBytes = new Uint8Array(length);
    randomBytes = window.crypto.getRandomValues(randomBytes);
    return randomBytes;
};
/**
 * Generate string base64 encoded.
 * Substitute reservered special characters with URL safe unreserved characters
 * As recommended in RFC7636:
 * https://tools.ietf.org/html/rfc7636#section-4.1
 *
 * @param {Buffer} from - Buffer to encode to Base64URL
 * @returns {string} Base64URL encoded string
 */
const base64URLEncode = (from) => {
    return btoa(String.fromCharCode.apply(null, Array.from(from)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};
/**
 * Calculate sha256 from string
 *
 * @param {string} from - String to calculate hash from
 * @returns {Buffer} Hash of string
 */
const sha256 = (from) => __awaiter(void 0, void 0, void 0, function* () {
    const encoder = new TextEncoder();
    const data = encoder.encode(from);
    const hash = crypto.subtle.digest('SHA-256', data);
    return hash;
});
/**
 * Generate random state for PKCE for CSRF prevention
 *
 * @param {number} length - Target length of state
 * @returns {string} Random state
 */
const generateRandomState = (length = 32) => {
    return base64URLEncode(generateRandomBytes(length)).slice(0, length);
};
exports.generateRandomState = generateRandomState;
/**
 * Generate code verifier for PKCE following the recommendation in RFC7636:
 * https://tools.ietf.org/html/rfc7636#section-4.1
 *
 * @param {number} length - Number of bytes used for generation. Will result in longer string, due to base64 encoding
 * @returns {string} The code verifier
 */
const generateCodeVerifier = (verifierLength = 32) => {
    return base64URLEncode(generateRandomBytes(verifierLength));
};
exports.generateCodeVerifier = generateCodeVerifier;
/**
 * Generate code challenge for PKCE following the recommendation in RFC7636:
 * https://tools.ietf.org/html/rfc7636#section-4.2
 *
 * @param {string} verifier - Code verifier to generate the challenge from
 * @returns {string} The code challenge
 */
const generateCodeChallenge = (verifier) => __awaiter(void 0, void 0, void 0, function* () {
    return sha256(verifier).then((hash) => base64URLEncode(new Uint8Array(hash)));
});
exports.generateCodeChallenge = generateCodeChallenge;
/** Generate Code Verifier and Code Challenge for PKCE */
const generateCodeVerifierAndChallenge = () => __awaiter(void 0, void 0, void 0, function* () {
    const codeVerifier = exports.generateCodeVerifier();
    const codeChallenge = yield exports.generateCodeChallenge(codeVerifier);
    return { codeVerifier: codeVerifier, codeChallenge: codeChallenge };
});
exports.generateCodeVerifierAndChallenge = generateCodeVerifierAndChallenge;

},{}],2:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PConLoginClient = void 0;
/**
 * Author: EasternGraphics GmbH
 * Version: 1.1.0
 *
 */
const oauth = __importStar(require("./oauth2"));
/** Error thrown if there was an error handling OAuth */
class OAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OAuthError';
    }
}
const EmptyPKCEValues = {
    codeVerifier: '',
    codeChallenge: '',
    state: '',
    authCode: '',
};
/** Provides production defaults for the OAuth server */
const OAuthOptionsDefaults = {
    client_id: '',
    redirect_uri: '',
    scope: '',
    want_refresh_token: true,
    refresh_token_app_infos: 'pcon-login-js',
    persist_tokens: true,
    force_login: undefined,
};
/** Provides defaults for pCon.login URLS */
const PConLoginURLsDefaults = {
    base_url: 'https://login.pcon-solutions.com',
    authorize_endpoint: '/api/oauth2/authorize',
    request_token_endpoint: '/api/oauth2/request_token',
    revoke_token_endpoint: '/api/oauth2/revoke_token',
    logout_endpoint: '/logout',
};
/**
 * Client for the PCon Login OAuth API
 */
class PConLoginClient {
    /**
     * Constructor for the login client.
     *
     * @param oauthOptions - Contains the parameters provided to the OAuth API
     */
    constructor(oauthOptions, pconLoginURLS) {
        /** Code challenge method, always "S256" here */
        this.code_challenge_method = 'S256';
        /** Authorization response type, always "code" here */
        this.response_type = 'code';
        /** Access Token Grant Type, always "authorization_code" here */
        this.grant_type = 'authorization_code';
        /** Key to store OAuth variables in session or localStorage */
        this.accessTokenStorageKey = 'pcon_login_oauth_access_token';
        this.pkceStorageKey = 'pcon_login_oauth_pkce';
        this.nextStorageKey = 'pcon_login_oauth_next';
        /** Safety margin for expiration of access token */
        this.accessTokenExpirationSafetyMarginMs = 5 * 60 * 1000;
        /** Access token information */
        this.accessTokenInformation = null;
        /** Route to redirect to after login */
        this.next = null;
        this.options = Object.assign(Object.assign({}, OAuthOptionsDefaults), oauthOptions);
        this.urls = Object.assign(Object.assign({}, PConLoginURLsDefaults), pconLoginURLS);
        this.pkceValues = EmptyPKCEValues;
        this.loadAccessTokenInformation();
    }
    /**
     * Generate values necessary for PKCE.
     * Async because of SHA256.
     */
    initPKCEValues() {
        return __awaiter(this, void 0, void 0, function* () {
            return oauth.generateCodeVerifierAndChallenge().then((res) => {
                this.pkceValues = {
                    codeVerifier: res.codeVerifier,
                    codeChallenge: res.codeChallenge,
                    state: oauth.generateRandomState(),
                    authCode: '',
                };
            });
        });
    }
    /**
     * Generate Authorization URI for login.
     * Can be used to create your own URI to redirect to or to open in Popup.
     *
     * @returns {URL}
     */
    getAuthorizationURI() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initPKCEValues();
            const url = new URL(this.urls.authorize_endpoint, this.urls.base_url);
            url.searchParams.set('response_type', this.response_type);
            url.searchParams.set('client_id', this.options.client_id);
            url.searchParams.set('redirect_uri', this.options.redirect_uri);
            url.searchParams.set('state', this.pkceValues.state);
            url.searchParams.set('code_challenge', this.pkceValues.codeChallenge);
            url.searchParams.set('code_challenge_method', this.code_challenge_method);
            if (this.options.scope) {
                url.searchParams.set('scope', this.options.scope);
            }
            if (this.options.force_login) {
                url.searchParams.set('force_login', '1');
            }
            return url;
        });
    }
    /**
     * Parse access token information from response
     */
    parseAccessTokenInformation(res) {
        const now = new Date();
        const accessToken = res['access_token'] || '';
        const refreshToken = res['refresh_token'] || '';
        const accessTokenExpiresIn = res['expires_in'] || 0;
        const accessTokenExpiresAt = new Date(now.getTime() + accessTokenExpiresIn * 1000 - this.accessTokenExpirationSafetyMarginMs);
        const accessTokenScope = res['scope'] || '';
        if (!accessToken) {
            this.accessTokenInformation = null;
        }
        this.accessTokenInformation = {
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiresIn: accessTokenExpiresIn,
            accessTokenExpiresAt: accessTokenExpiresAt,
            accessTokenScope: accessTokenScope,
            accessTokenLastRetrievedAt: new Date(),
        };
        this.storeAccessTokenInformation();
    }
    /**
     * Obtain access token from OAuth API
     */
    obtainAccessToken() {
        const url = new URL(this.urls.request_token_endpoint, this.urls.base_url);
        const params = new URLSearchParams();
        params.set('grant_type', this.grant_type);
        params.set('client_id', this.options.client_id);
        params.set('code', this.pkceValues.authCode);
        params.set('redirect_uri', this.options.redirect_uri);
        params.set('code_verifier', this.pkceValues.codeVerifier);
        if (this.options.want_refresh_token) {
            params.set('wam_want_refresh_token', '1');
            params.set('wam_refresh_token_app_infos', this.options.refresh_token_app_infos);
        }
        localStorage.removeItem(this.pkceStorageKey);
        return fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        })
            .then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.status >= 400) {
                const text = yield res.text();
                throw new Error(`Request failed: ${text}`);
            }
            return res.json();
        }))
            .then((res) => {
            this.parseAccessTokenInformation(res);
        })
            .catch((err) => {
            console.error(err);
            throw err;
        });
    }
    /**
     * Start login process by redirecting the browser to the authorization endpoint.
     *
     * NOTE: This means the current state of the page will be lost!
     *
     * @param next - The page you want to redirect to using [[redirectToNext]]. If this parameter is not provided,
     * the library will set the "next" location to the current window.location
     */
    loginWithRedirect(next) {
        return __awaiter(this, void 0, void 0, function* () {
            //Save PKCE values as we need them after the redirect
            const redirect_uri = yield this.getAuthorizationURI();
            localStorage.setItem(this.pkceStorageKey, JSON.stringify(this.pkceValues));
            if (next) {
                localStorage.setItem(this.nextStorageKey, next);
            }
            else {
                const nextPage = window.location;
                localStorage.setItem(this.nextStorageKey, nextPage.toString());
            }
            window.location.replace(redirect_uri.toString());
        });
    }
    /**
     * NEW
     * Open popup and redirect to the authorization endpoint.
     * 
     * @param next - The page you want to redirect to using [[redirectToNext]]. If this parameter is not provided,
     * the library will set the "next" location to the current window.location
     */
    loginWithPopup(next) {
        return __awaiter(this, void 0, void 0, function* () {
            let popup = window.open("about:blank");

            //Save PKCE values as we need them after the redirect
            const redirect_uri = yield this.getAuthorizationURI();
            localStorage.setItem(this.pkceStorageKey, JSON.stringify(this.pkceValues));
            if (next) {
                localStorage.setItem(this.nextStorageKey, next);
            }
            else {
                const nextPage = window.location;
                localStorage.setItem(this.nextStorageKey, nextPage.toString());
            }
            popup.location = redirect_uri.toString();
        });
    }
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
    handleRedirect(authCode, state) {
        const storedPKCEValues = localStorage.getItem(this.pkceStorageKey);
        localStorage.removeItem(this.pkceStorageKey);
        if (!storedPKCEValues) {
            throw new OAuthError('No PKCE values available');
        }
        this.pkceValues = JSON.parse(storedPKCEValues);
        // const queryParams = new URLSearchParams(window.location.search);
        // const authCode = queryParams.get('code');
        // const state = queryParams.get('state');
        // if (!authCode) {
        //     throw new OAuthError('No code in server response');
        // }
        // if (!state) {
        //     throw new OAuthError('No state in server response');
        // }
        // else if (state != this.pkceValues.state) {
        //     throw new OAuthError('Mismatching state in server response');
        // }
        if (state != this.pkceValues.state) {
            throw new OAuthError('Mismatching state in server response');
        }
        this.pkceValues.authCode = authCode;
        this.next = localStorage.getItem(this.nextStorageKey);
        localStorage.removeItem(this.nextStorageKey);
        return this.obtainAccessToken();
    }
    /**
     * Obtain a valid access token.
     * Unless the optional parameter "force_new" is true, this may be a previously cached token.
     * If the returned Promise resolves to null, the application should display the user an
     * appropriate error dialog and restart the login process to obtain valid tokens again.
     *
     * @param force_new - If true, always refreshes token beforehand
     * @returns {string | null } Access token, if available, else null
     */
    getAccessToken(force_new = false) {
        // Reload access token information, in case the token was refreshed in another tab
        this.loadAccessTokenInformation();
        if (!this.isAccessTokenValid() || force_new) {
            return this.refreshAccessToken();
        }
        else {
            return Promise.resolve(this.accessTokenInformation.accessToken);
        }
    }
    /**
     * Request token using refresh token
     */
    refreshAccessToken() {
        if (!this.accessTokenInformation || !this.accessTokenInformation.refreshToken) {
            return Promise.resolve(null);
        }
        const url = new URL(this.urls.request_token_endpoint, this.urls.base_url);
        const params = new URLSearchParams();
        params.set('grant_type', 'refresh_token');
        params.set('client_id', this.options.client_id);
        params.set('scope', this.options.scope);
        params.set('refresh_token', this.accessTokenInformation.refreshToken);
        return fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        })
            .then((res) => __awaiter(this, void 0, void 0, function* () {
            if (res.status >= 400) {
                const text = yield res.text();
                throw new Error(`Request failed: ${text}`);
            }
            return res.json();
        }))
            .then((res) => {
            this.parseAccessTokenInformation(res);
            return this.accessTokenInformation.accessToken;
        })
            .catch((err) => {
            this.accessTokenInformation = null;
            this.removeAccessTokenInformation();
            console.error(err);
            return null;
        });
    }
    /**
     * This should be called after [[handleRedirect]] finished, i.e. the returned
     * promise resolved without error.
     * This will make the access token available in your application.
     *
     * */
    handlePopupFinished() {
        this.loadAccessTokenInformation();
        if (!this.options.persist_tokens) {
            this.removeAccessTokenInformation();
        }
    }
    /**
     * Revoke access token. Unlike [[logout]], this will only revoke the token, and not logout
     * the user session.
     *
     * NOTE: Usually you will want to call [[logout]] instead of this function.
     *
     * @returns Promise returned by the fetch call to /revoke_tokens
     */
    revokeToken() {
        if (!this.accessTokenInformation || !this.accessTokenInformation.accessToken) {
            return Promise.resolve();
        }
        const url = new URL(this.urls.revoke_token_endpoint, this.urls.base_url);
        const params = new URLSearchParams();
        params.set('token', this.accessTokenInformation.accessToken);
        params.set('token_type_hint', 'access_token');
        params.set('client_id', this.options.client_id);
        return fetch(url.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
        }).then();
    }
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
    logout(next) {
        this.revokeToken().then(() => {
            this.removeAccessTokenInformation();
            this.accessTokenInformation = null;
            const logoutUrl = new URL(this.urls.logout_endpoint, this.urls.base_url);
            if (next) {
                logoutUrl.searchParams.set('next', next);
            }
            window.location.replace(logoutUrl.toString());
        });
    }
    /** Load access token information from localStorage */
    loadAccessTokenInformation() {
        var _a;
        const accessTokenInformationStored = localStorage.getItem(this.accessTokenStorageKey);
        if (accessTokenInformationStored) {
            this.accessTokenInformation = JSON.parse(accessTokenInformationStored);
            // Date doesn't get parsed correctly from storage, but gets parsed as string, thus we convert it back here
            if ((_a = this.accessTokenInformation) === null || _a === void 0 ? void 0 : _a.accessTokenExpiresAt) {
                this.accessTokenInformation.accessTokenExpiresAt = new Date(this.accessTokenInformation.accessTokenExpiresAt);
            }
        }
        if (!this.options.persist_tokens) {
            this.removeAccessTokenInformation();
        }
    }
    /** Store access token information into localStorage */
    storeAccessTokenInformation() {
        if (this.options.persist_tokens && this.accessTokenInformation) {
            localStorage.setItem(this.accessTokenStorageKey, JSON.stringify(this.accessTokenInformation));
        }
    }
    /** Remove access token information from localStorage */
    removeAccessTokenInformation() {
        localStorage.removeItem(this.accessTokenStorageKey);
    }
    /**
     * Checks if an access token is available and if it has expired.
     *
     * This is only deducted from information locally available, without a call to the server.
     * It is possible the access token has been invalidated externally,
     * e.g. if the user logs out from elsewhere or by changing password.
     *
     * @returns true, if access token is valid, false if not
     */
    isAccessTokenValid() {
        return !!(this.accessTokenInformation &&
            this.accessTokenInformation.accessToken &&
            new Date() < this.accessTokenInformation.accessTokenExpiresAt);
    }
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
    fetchWithAuth(resource, init) {
        return this.getAccessToken().then((accessToken) => {
            if (!accessToken) {
                return null;
            }
            const authorizationHeader = {
                Authorization: `Bearer ${accessToken}`,
            };
            const headers = init ? Object.assign(Object.assign({}, init.headers), authorizationHeader) : authorizationHeader;
            const initWithAuth = Object.assign(Object.assign({}, init), { headers: headers });
            return window.fetch(resource, initWithAuth);
        });
    }
    /**
     * Redirects to next parameter, if next parameter was specified in [[loginWithRedirect]]
     */
    redirectToNext() {
        if (this.next)
            window.location.replace(this.next);
    }
}
exports.PConLoginClient = PConLoginClient;

},{"./oauth2":1}]},{},[2])(2)
});
