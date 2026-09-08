/** User configuration used for the `wbk.configuration` message.  */
export interface UserConfig
{
    /**
     * **(Advanced integration only)**
     * Login name of the user.
     */
    name?: string;
    /**
     * **(Advanced integration only)**
     * Optional full name of the user (e.g. first name + last name).
     */
    fullName?: string;
    /** Optional url to the company logo. */
    companyLogo?: string;
    /**
     * **(Advanced integration only)**
     * Optional url for user account management.
     */
    accountUrl?: string;
    /**
     * Optional set of restrictions for this user. If not defined the
     * default restrictions of the application will be used.
     * See basket integration manual for a list of available restrictions.
     */
    restrictions?: Array<string>;
    /**
     * **(Advanced integration only)**
     * Optional pCon.login access token.
     * Some basket operations are only available for logged in users
     * e.g. accessing protected PIM article information or to access user/organization preferences
     * Note: The access token usually expires after 1 hour. Its important to request a new token before that happens and send it
     * to the basket using the `wbk.updateUserAccessToken` message.
     */
    accessToken?: string;
}