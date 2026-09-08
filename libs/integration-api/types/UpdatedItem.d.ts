export interface UpdatedItem
{
    /** id of the updated item */
    itemId: string;
    /**
     * List of changes made to this item stored in a bitmask.
     * Available flags:
     * - 0x00000000 - nothing changed
     * - 0x00000001 - item
     * - 0x00000002 - item properties
     * - 0x00000004 - image
     * - 0x00000008 - calculation
     * - 0x00000010 - tax
     * - 0x00000020 - configuration data (e.g. OFML properties)
     * - 0x00000040 - user image
     * - 0x00000080 - external item number
     * - 0x00000100 - user item description
     * - 0x00000200 - additional images
     * - 0x00000400 - comments
     * - 0x80000000 - child items (hierarchically) also changed
     * - 0xFFFFFFFF - everything changed
     */
    updateFlags: number;
}