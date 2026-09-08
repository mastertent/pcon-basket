export interface ButtonOptions
{
    /** custom tooltip for the button */
    tooltip?: string;
    /**
     * custom icon name for the button (ignored if `iconUrl` is specified)
     * See `https://pictogrammers.com/library/mdi/` for list of icons.
     * Icon names have to be prefixed with `mdi-` e.g. `mdi-account`.
     */
    iconName?: string;
    /** custom icon url for the button */
    iconUrl?: string;
}