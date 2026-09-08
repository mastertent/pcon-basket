import { MenuAction } from "./Action";

export interface CustomActions
{
    /**
     * List of basket actions which will be available in the project editor. (e.g. in the toolbar)
     * All primary actions will be shown in front of all other actions.
     */
    basketActions?: Array<MenuAction>;

    /** Actions which will be available in the main manu. */
    mainMenuActions?: Array<MenuAction>;

    /** Item actions which will be available in the context menu. */
    itemActions?: Array<MenuAction>;
}