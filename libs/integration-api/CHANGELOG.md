## 2.7.0 (Basket 2.13.0)

### New features
 - added new option `contactSupportUrl` to `wbk.configuration` message
 - added `basic integration` as an alternative and simpler way to integrate the basket
 - added support for pCon pricing conditions (see `SupportedAPIs.pConPricingConditions`)
 - added `ProjectMetaData.externalProjectNumber`
 - added new user restriction `project.calculation.purchaseCalculation.edit`
 - added new user restriction `item.calculation.purchaseCalculation.edit`
 - added new user restriction `item.quantity.negative` and `item.quantity.zero` 
 - added new user restrictions for item geometry export, see `item.geometryExport...`

### Breaking changes
 - the deprecated scripts `libs/wcf/bundles/eaiws.js` and `libs/wcf/libs/core-js/minified.js` are moved 
 to `libs/wcf-deprecated/bundles/eaiws.js` and `libs/wcf-deprecated/libs/core-js/minified.js` 
 because they are no longer maintained and do no longer receive updates, the ES6 modules provided by 
 the `@easterngraphics/wcf` NPM package should be used instead

## 2.6.0 (Basket 2.12.0)

### New features
 - added new messages `wbkHost.clipboardChanged` and `wbk.setClipboard` for clipboard handling
 - added new messages `wbk.lockBasketGUI` and `wbk.unlockBasketGUI`, can be used to lock/unlock the basket GUI
 - added new message `wbk.updateBasketGUI`, used to update the basket GUI after changes were made to the EAIWS session
 - added new message `wbkHost.executeAction`, used to execute a custom action
 - added new option `customActions` to `wbk.configuration` message, can be used to to add custom buttons/actions to the basket GUI
 - added new option `clipboardData` to `wbk.configuration` message, can be used to predefine the clipboard content
 - added new option `selectedItems` to `wbk.configuration` message, can be used to predefine the item selection
 - added new option `supportEmailAddress` to `wbk.configuration` message, can be used to set the Email address used to contact the support
 - added new flag `exchangeRates` to `SessionModifications` interface
 - added new user restrictions to prevent user from changing certain default settings
 - the host application may now implement a custom user settings storage (see `User Settings` chapter in documentation)

### Breaking changes (compile time only)
 - refactored file structure of typescript typings 

## 2.5.0 (Basket 2.11.0)

### New features
 - added new user restriction `item.splitUpCompositeArticles`

### Changes
 - the `eaiws` and `core-js` W-CF bundles are now deprecated, the ES6 modules provided by the `@easterngraphics/wcf` NPM package should be used instead
 - integration example is now using the `@easterngraphics/wcf` NPM package instead of the `eaiws` bundle
 - integration example is now written in TypeScript

## 2.4.0 (Basket 2.10.0)

### New features
 - added support for external catalogs (see `CustomCatalog.externalUrl` property)
 - report attachments can be specified as part of the `wbk.configuration` message (see `report.attachments` property)
 - report template for ordering can be specified as part of the `wbk.configuration` message (see `order.reportTemplate` property)
 - added `wbkHost.reportGenerated` message to notify host about generated reports
 - `quantity` may be specified for `CustomArticle`
 - `comments` may be specified for `CustomArticle`
 - added user login using `pCon.login` to integration example

## 2.3.0

### New features
 - added new user restriction `item.ofmlArticle.update`
 - added new user restrictions for hiding individual project data fields

### Changes
 - updated to W-CF 8.4.1

## 2.2.0

### New features
 - added `ProjectValidity` as a valid `DefaultSessionSetting` flag

### Changes
 - updated to W-CF 8.3.0

## 2.1.0

### New features
 - integration example now shows how to save a pdf report
 - pCon.login access token can be provided with the `wbk.configuration` message (see `user.accessToken` property)
 - added optional `doneButtonOptions` to `wbk.configuration` message, can be used to specify a custom icon for the done button 
 - added `wbk.updateUserAccessToken` message to update the pCon.login access token before it expires
 - added new user restriction `item.comments` and `item.comments.edit`
 - added new user restriction `item.markAsOptional`
 - added optional parameter `seriesId` and `baseArticleNumber` to `wbkHost.getCustomCatalogArticles` message which are used to insert custom articles by article number
 - added new item lock flag for the ofml article update `0x00000040`

### Changes
 - updated to W-CF 8.1.0

## 2.0.0

### New features
 - added new item lock flag for the article quantity `0x00000020` (see breaking changes)
 - added new user restriction `item.additionalImages`

### Changes
 - improved integration example

### Breaking Changes
 - the calculation item lock flag `0x00000004` no longer locks the article quantity, use the new quantity flag `0x00000020` instead

### W-CF - Breaking Changes
 - updated to W-CF 8.0.0
 - js scripts (`libs/wcf/scripts`) are no longer available, the wcf-eaiws bundle (`libs/wcf/bundles/eaiws.js`) which bundles the `eaiws` and `utils` modules of W-CF has to be used instead (see `Integration-example.html`)
 - W-CF namespace `egr.wcf` was renamed to `egrWcf` (see `Integration-example.html`)

## 1.1.0

### New features  
 - added support for custom catalogs
 - added new user restriction `project.data.defaultPriceDate.edit`
 - price date support for the application can be enabled in the `wbk.configuration` message (see `application.priceDateSupported`)
 - a project save button for the basket UI can be enabled in the `wbk.configuration` message (see `application.showProjectSaveButton`)

### Breaking Changes (TypeScript compile time only)
 - removed `ItemLockFlags` and `ItemUpdateFlags` type definitions to prevent errors if compiled with `isolatedModules` compiler option

## 1.0.0

### New features  
 - added `wbk.finishIntegration` message
 - added `wbkHost.finishIntegrationCanceled` message
 - added `openCatalogForEmptyProjects` configuration to `wbk.configuration` message (see `project.openCatalogForEmptyProjects`)
 - added new user restriction `item.extraTexts`
 - added new user restriction `item.extraTexts.edit`
 - added new user restriction `item.ofmlArticle.userDescription`
 - added new user restriction `item.ofmlArticle.userDescription.edit`
 - added new user restriction `project.customer.general.company.edit`
 - added new user restriction `project.customer.general.externalCustomerId.edit`
 - added new user restriction `project.customer.general.customerNumber.edit`
 - added new user restriction `project.customer.general.generalAgreementNumber.edit`
 - added new user restriction `project.customer.general.customerRelatedRemarks.edit`
 - added new user restriction `project.data.projectDate.edit`
 - added new user restriction `project.data.projectValidToDate.edit`
 - added new user restriction `project.data.externalReferenceNumber.edit`
 - added new user restriction `project.data.externalReferenceText.edit`
 - added new user restriction `project.data.description.edit`
 - added new user restriction `project.data.keywords.edit`
 - added new user restriction `project.data.headerText.edit`
 - added new user restriction `project.data.footerText.edit`

## 1.0.0-beta.3

### New features
 - a predefined feature set (e.g. `Configurator`) can be configured as part of the `wbk.configuration` message (see `application.featureSet`)
 - the pricing procedure for the calculation can be configured as part of the `wbk.configuration` message (see `calculation.pricingProcedure`)
 - the available report templates can be configured as part of the `wbk.configuration` message (see `report.templates`)
 - additional `metaData` can be defined for the project as part of the `wbk.configuration` message (see `project.metaData`)
 - plugin categories can be disabled as part of the `wbk.configuration` message (see `application.disabledPluginCategories`)
 - added `accountUrl` as new user configuration option to `WbkConfiguration`
 - added new user restriction `project.customer.search.edit`
 - added new user restriction `project.customer.general.edit`
 - added new user restriction `project.customer.mainAddress`
 - added new user restriction `project.customer.mainAddress.edit`
 - added new user restriction `project.customer.billingAddress`
 - added new user restriction `project.customer.billingAddress.edit`
 - added new user restriction `project.calculation.margin`
 - added new user restriction `project.data.textFormatting`
 - added new user restriction `item.calculation.margin`
 - added new user restriction `item.calculation.updateConditionAmounts`
 - added new user restriction `item.folder.subTotal`
 - added new user restriction `order.orderNumber.edit`
 - added new user restriction `order.vendorNumber.edit`
 - added new user restriction `order.billingAddress.edit`

### Breaking Changes
 - The data/project language is now stored (and restored) as part of the project OBK file. The `applySessionDefaults` 
   configuration option can be used to initialize a session/project with the default language. 
   The `dataLanguage` configuration option is now used to change the default language and only works in combination with `applySessionDefaults`.
   Alternatively the Project-Soap interface of the EAIWS can be used direclty to configure the project language (see `ProjectData.langauges`).

## 1.0.0-beta.2

### New features
 - added `companyLogo` as new user configuration option to `WbkConfiguration`
 - added `DataLanguage` as new setting to `DefaultSessionSetting` type

## 1.0.0-beta.1

### New features
 - added `migrateLegacyProjectData` as new configuration option to `WbkConfiguration`
 - added `showUser` as new configuration option to `WbkConfiguration`
 - added `showDoneButton` as new configuration option to `WbkConfiguration`

### Breaking Changes
 - default value for `appBarColor` configuration option is now `#ffffff`

## 1.0.0-alpha.3

### New features
 - added `lockedItems` as new configuration option to `WbkConfiguration`

## 1.0.0-alpha.2

### New features
 - the application theme can be defined as part of the `wbk.configuration` message
 - added `disabledPlugins` as new configuration option to `WbkConfiguration`
 - added `editorMode` as new configuration option to `WbkConfiguration`
 - added `applySessionDefaults` as new configuration option to `WbkConfiguration`
 - the `wbkHost.done` message now contains a list of modifications which were made to the session as parameter
 - added `wbk.getSessionModifications` and `wbkHost.sessionModifications` message

## 1.0.0-alpha.1

### New features
 - added `patch` and `preRelease` properties to `MessageApiVersion`
 - added `dataLanguage` as new configuration option to `WbkConfiguration`
 - added `user` as new configuration option to `WbkConfiguration`