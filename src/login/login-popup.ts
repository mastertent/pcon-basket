///////
// This file contains the login logic which runs inside the login popup
///////

//add core-js polyfills
import "@easterngraphics/wcf/modules/polyfill/core-js";

import { PConLoginClient } from "../../libs/pcon-login/pcon-login";
import { PCON_LOGIN_CLIENT_ID, PCON_LOGIN_SCOPE } from "../Config";

const loginClient = new PConLoginClient({
    client_id: PCON_LOGIN_CLIENT_ID,
    scope: PCON_LOGIN_SCOPE,
    redirect_uri: window.location.origin + window.location.pathname //use current location, we want to redirect back to this page
});

//get `code` url parameter
const queryParams = new URLSearchParams(window.location.search);
const authCode = queryParams.get("code");
const error = queryParams.get("error");

if (authCode != null) {
    //redirect detected
    loginClient.handleRedirect().then(() =>
    {
        //notify the main window that the login process is finished
        window.opener.postMessage("login-popup-finished", window.origin);
    });
} else {
    if (error != null) {
        alert("Login failed. Error: " + error);
    } else {
        //start login process
        loginClient.loginWithRedirect();
    }
}