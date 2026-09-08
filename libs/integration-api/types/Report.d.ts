/** message parameter for `wbkHost.reportGenerated` */
export interface GeneratedReport
{
    /** name/id of the used report template */
    template: string;
    /** active template options */
    templateOptions?: { [key: string]: ReportTemplateOptionValue };
    /** id of the active basket view */
    basketViewId: string;
    /** Name of the generated pdf. */
    pdfName: string;
    /** Url of the generated report. */
    pdfUrl: string;
}

export type ReportTemplateOptionValue = boolean | string | number | undefined;