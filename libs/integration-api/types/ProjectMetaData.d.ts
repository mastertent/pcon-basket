export interface ProjectMetaData
{
    /** Sales group (SGR) as defined in the OEX specification. */
    salesGroup?: string;
    /** Sales organization (SOR) as defined in the OEX specification. */
    salesOrganization?: string;
    /** project number (PJN) as defined in the OEX specification. */
    externalProjectNumber?: string;
    /** Predefined order number of the project */
    orderNumber?: string;
    /** Predefined vendor number of the project */
    vendorNumber?: string;
}