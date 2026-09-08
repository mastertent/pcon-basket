//add core-js polyfills
import "@easterngraphics/wcf/modules/polyfill/core-js";

import { Application } from "./Application";

//extend Window type to allow event handler registration
declare global
{
    interface Window
    {
        eosInfo?: any;
        startBasket: () => void;
        loginCallback: () => void;
        savePDF: () => void;
        saveOBK: () => void;
        saveOBX: () => void;
        restart: () => void;
        clearFileInput: () => void;
    }

    interface Document {
        eosInfo?: any;
    }
}

//create the Application
const tApp = new Application();

//bind event handlers
window.startBasket = (): void => void tApp.startBasket();
window.loginCallback = (): void => void tApp.loginCallback();
window.savePDF = (): void => void tApp.savePDF();
window.saveOBK = (): void => void tApp.saveOBK();
window.saveOBX = (): void => void tApp.saveOBX();
window.restart = (): void => void tApp.restart();
window.clearFileInput = (): void =>
{
    (document.getElementById("fileInput") as HTMLInputElement).value = "";
};