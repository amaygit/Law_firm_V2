// src/types/google-api.d.ts

export {};

declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          clientId: string;
          scope: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        calendar: {
          events: {
            insert: (params: {
              calendarId: string;
              resource: any;
              conferenceDataVersion: number;
              sendUpdates: string;
            }) => Promise<{
              result: {
                hangoutLink?: string;
                htmlLink: string;
                id: string;
              };
            }>;
            list: (params: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
            listen: (callback: (signedIn: boolean) => void) => void;
          };
          signIn: () => Promise<void>;
          signOut: () => Promise<void>;
        };
      };
    };
  }
}
