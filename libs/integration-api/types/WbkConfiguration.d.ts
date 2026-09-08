import { ButtonOptions } from "./ButtonOptions";
import { ClipboardData } from "./ClipboardData";
import { CustomActions } from "./CustomActions";
import { CustomCatalog } from "./CustomCatalog";
import { EaiwsConfig } from "./EaiwsConfig";
import { LockedItem } from "./LockedItem";
import { ProjectMetaData } from "./ProjectMetaData";
import { SupportedAPIs } from "./SupportedAPIs";
import { UserConfig } from "./UserConfig";

/**
 * Predefined set of features that enable/disable certain application features and plugins.
 * - `Full`: All features of the application are enabled. Typically used to create/edit complete article lists or quotes.
 *    Can also be used in case a customized feature set is desired. In this case additional user restrictions and disabled plugins can be configured.
 * - `Configurator`: Provides a reduced UI suitable for article/product configuration by disabling all features/plugins.
 *    All features not necessary for product configuration are disabled (e.g. ordering, reporting or calculation).
 */
export type FeatureSet = "Full" | "Configurator";

/**
 * Mode for the project editor.
 * - `Default`:  Used to create and edit a project.
 * - `Report`:  Used to send/print a report.
 * - `Order`:  Used to place an order.
 */
export type ProjectEditorMode = "Default" | "Report" | "Order";

/** Default settings for an eaiws session. */
export type DefaultSessionSetting = "PartyInCharge" | "Currency" | "ExchangeRates" | "TaxScheme" | "DataLanguage" | "ProjectValidity";

/** message parameter for `wbk.configuration` */
export interface WbkConfiguration
{
    /**
     * **(Advanced integration only)**
     * EAIWS session configuration.
     */
    eaiws?: EaiwsConfig;

    /** application related configurations */
    application?: {
        /**
         * Predefined set of features that enable/disable certain application features and plugins. (default: `Full`)
         */
        featureSet?: FeatureSet;

        /**
         * Optional APIs which need to be enabled explicitly.
         */
        supportedAPIs?: SupportedAPIs;

        /**
         * If defined, overrides the users default language used for the product data (array of languages in order of priority).
         * If the array is empty the UI language will be used as fallback.
         * The default data language is only used if `project.applySessionDefaults` is specified.
         * Otherwise the language which is currently configured in the eaiws session will be used.
         */
        dataLanguage?: Array<string>;

        /**
         * Enables/disables article price date support (default: false)
         * Note: To correctly load/preserve the price date stored in OBK/OBX files it is importent to set the
         * session property `egr.eai.basket.preserve_price_date` of the EAIWS session to `true` before loading the OBK/OBX.
         */
        priceDateSupported?: boolean;

        /** Url to the `Contact Support` document/form of the application (default: null) */
        contactSupportUrl?: string | null;

        /** Email address used to contact the support (default: null) */
        supportEmailAddress?: string | null;

        /**
         * Theme settings which will override the default application theme.
         */
        theme?: {
            /** Primary color of the theme as hex string. (default: #0078d4) */
            primaryColor?: string;
            /** Text color of the theme as hex string. (default: #333333) */
            textColor?: string;
            /** Application bar color of the theme as hex string. (default: #ffffff) */
            appBarColor?: string;
            /**
             * Logo of the application. (default: null)
             */
            logo?: string | null;
            /**
             * Background color of the logo as hex/css color string. (default: transparent)
             */
            logoBackgroundColor?: string;
        };

        /**
         * Optional list of plugins (plugin names) that will be disabled.
         */
        disabledPlugins?: Array<string>;
        /**
         * Optional list of plugins categories that will be disabled.
         */
        disabledPluginCategories?: Array<string>;
        /** If true and `user` is defined the application will show the user information. (default: false)*/
        showUser?: boolean;
        /**
         * If true the application will show a `Done` button which can be used
         * from the user to finish the integration. (default: true)
         */
        showDoneButton?: boolean;

        /** Additional options for the done button. */
        doneButtonOptions?: ButtonOptions;

        /**
         * If true the application will show a `Save` button which can be used
         * from the user to trigger the saving of the current project. (default: false)
         * The message `wbkHost.saveProject` will be send to the host after clicking the button.
         * The host should then save the project. The basket will be locked until the host sends
         * the message `wbk.saveProjectDone` back to the basket.
         */
        showProjectSaveButton?: boolean;

        /** Can be used to add custom buttons/actions to the basket GUI. */
        customActions?: CustomActions;
    };

    /** user related configurations */
    user?: UserConfig;

    /** Configuration for the project and item calculation. */
    calculation?: {
        /** name of the pricing procedure to use for the project and item calculation */
        pricingProcedure?: string;
    };

    /** project related configurations */
    project?: {
        /** initial title */
        title?: string;
        /** if true the title may be changed by the user */
        titleEditable?: boolean;
        /**
         * The editor mode defines the primary purpose of the project editor. If not defined `Default`
         * will be used.
         */
        editorMode?: ProjectEditorMode;
        /**
         *  If `true` all of the current default session settings will be assign to the session.
         *  Can be used to initialize a new project with the user defaults.
         *  An array with `DefaultSessionSetting` entries can be used to define which settings will be applied.
         */
        applySessionDefaults?: boolean | Array<DefaultSessionSetting>;
        /** Optional list of locked items which will be used to lock certain item related operations. */
        lockedItems?: Array<LockedItem>;
        /** List of item ids for items which should be initially selected. */
        selectedItems?: Array<string>;
        /**
         * If true, legacy data (e.g. header or address data) will be loaded and migrated. (default: false)
         * Should be used when loading obk files of older applications.
         */
        migrateLegacyProjectData?: boolean;
        /** Controls if the catalog should be opened automatically for empty/new projects. (default: false) */
        openCatalogForEmptyProjects: boolean;
        /**
         * Optional project related meta data which may be used by certain operations (e.g. ordering)
         */
        metaData?: ProjectMetaData;
        /**
         * Optional predefined clipboard data which can be used to fill the clipboard of the basket in advance.
         */
        clipboardData?: ClipboardData;
    };

    /** Configuration for the reporting. */
    report?: {
        /**
         * Array of template names of report templates which should be available to the user.
         */
        templates?: Array<string>;

        /** Name of the default template */
        defaultTemplate?: string;

        /**
         * Predefined attachments for each template which will be added to every report.
         * The name of the template is used as the key for the dictionary.
         * If an empty string is used as the template name the provided attachments
         * will be applied to all templates without explicitly defined attachments.
         */
        attachments?: {
            [template: string]: {
                /** List of PDF urls which should be added in front of the report. */
                prependUrls?: Array<string>;
                /** List of PDF urls which should be added at the end of the report. */
                appendUrls?: Array<string>;
            };
        };
    };

    /** Configuration for the catalog. */
    catalog?: {
        /** Custom catalog registration */
        customCatalogs?: Array<CustomCatalog>;
    };

    /** Ordering configuration. */
    order?: {
        /**
         * If defined a report using the specified template will
         * be generated and attached to the order. (default: null)
         */
        reportTemplate: string | null;
    };
}