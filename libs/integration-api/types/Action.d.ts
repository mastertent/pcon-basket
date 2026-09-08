export interface Action
{
    /** Unique key of the action. Will be used as identifier for the `wbkHost.executeAction` message. */
    key: string;
    /** displayed action text */
    text?: string;
    /** tooltip used for mouse hover */
    tooltip?: string;
    /**
     * Icon name for the action (ignored if `iconUrl` is specified)
     * See `https://pictogrammers.com/library/mdi/` for list of icons.
     * Icon names have to be prefixed with `mdi-` e.g. `mdi-account`.
     */
    iconName?: string;
    /** custom icon url for the action */
    iconUrl?: string;
    /** If true the action will be disabled if the user did not select a basket item. */
    dependsOnItemSelsection?: boolean;
}

export interface MenuAction extends Action
{
    /** If provided a menu with the sub-actions will be shown. The menu action itself is not executable. */
    subActions?: ReadonlyArray<Action>;
    /** Primary actions will be shown in front of all other actions. (currently only supported for basket actions) */
    primary?: boolean;
}
