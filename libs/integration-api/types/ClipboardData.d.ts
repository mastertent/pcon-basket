export interface ClipboardData
{
    /** Url of the OBX file which contains the clipboard data. */
    obxUrl?: string;
    /** Text content of the OBX file. If `obxUrl` is specified this property will be ignored. */
    obxContent?: string;
}