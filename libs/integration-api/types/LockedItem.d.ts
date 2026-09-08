export interface LockedItem
{
    /** id of the locked item */
    itemId: string;
    /**
     * List of locked operations for this item stored in a bitmask.
     * Available flags:
     * - 0x00000000 - nothing is locked
     * - 0x00000001 - Delete: locks the delete operation => item can't be deleted
     * - 0x00000002 - Configuration: locks the configuration of an ofml article => article can't be configured
     * - 0x00000004 - Calculation: locks the calculation of an item => item can't be calculated
     * - 0x00000008 - ItemProperties: locks the item properties => properties like texts or article number can't be changed
     * - 0x00000010 - Image: locks the item image => the image of an item can't be changed
     * - 0x00000020 - Quantity: locks the article quantity => the quantity of an article can't be changed
     * - 0x00000040 - OfmlArticleUpdate: locks the ofml article update => updating an ofml article is not possible
     * - 0xFFFFFFFF - locks all operations
     */
    lockFlags: number;
}