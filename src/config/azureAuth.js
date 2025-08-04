import { LogLevel } from "@azure/msal-browser";

// Azure AD Configuration
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID || "8104d14d-25d6-4df7-851a-3a87d051eb5b", // Your Azure AD App Registration Client ID
    authority: process.env.REACT_APP_AZURE_TENANT_ID 
      ? `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`
      : "https://login.microsoftonline.com/22fde68e-d975-441b-a414-73ff55b29824", // Your tenant ID
    redirectUri: window.location.origin, // Redirects to your app after login
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      }
    }
  }
};

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest = {
  scopes: ["User.Read"]
};

// Add the endpoints here for Microsoft Graph API services you'd like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
}; 