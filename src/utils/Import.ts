import { EaiwsSession } from "@easterngraphics/wcf/modules/eaiws";

/**
 * This function loads and OBK file.
 */
export async function loadOBK(pSession: EaiwsSession, pFile: File): Promise<void>
{
    //get upload URL from EAIWS
    const tUrl = await pSession.session.getUploadURL("Project");

    //upload file (using PUT request)
    await pSession.uploadFileToUrl(tUrl, pFile);

    //load session from uploaded obk
    await pSession.session.loadSession(tUrl);
}

export async function loadOBKFromCE(pSession: EaiwsSession): Promise<void>
{
    //get upload URL from EAIWS
    const tUrl = await pSession.session.getUploadURL("Project");

    var ceFileUrl = document.eosInfo._formContext.getAttribute("mas_obkfile").getValue().fileUrl;

    let blob = await fetch(ceFileUrl).then(r => r.blob());

    //upload file (using PUT request)
    //await gSession.uploadFileToUrl(tUrl, ceFileUrl);
    await pSession.uploadFileToUrl(tUrl, blob);

    //load session from uploaded obk
    await pSession.session.loadSession(tUrl);
}

/**
 * This function loads and OBX file. Returns the ids of the loaded items.
 */
export async function loadOBX(pSession: EaiwsSession, pFile: File): Promise<Array<string>>
{
    //get upload URL from EAIWS
    const tUrl = await pSession.session.getUploadURL("CutBuffer");

    //upload file (using PUT request)
    await pSession.uploadFileToUrl(tUrl, pFile);

    //insert obx into the session
    const tPastedItems = await pSession.basket.paste(null, null, tUrl);
    return (tPastedItems);
}