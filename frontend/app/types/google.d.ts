// src/types/google.d.ts

declare namespace gapi {
  namespace client {
    function init(args: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;

    function setToken(token: { access_token: string } | null): void;
    function getToken(): { access_token: string } | null;

    namespace calendar {
      namespace events {
        function insert(params: {
          calendarId: string;
          conferenceDataVersion?: number;
          resource: any;
          sendUpdates?: string;
        }): Promise<any>;

        function list(params: {
          calendarId: string;
          timeMin?: string;
          showDeleted?: boolean;
          singleEvents?: boolean;
          maxResults?: number;
          orderBy?: string;
        }): Promise<any>;
      }
    }
  }

  function load(api: string, callback: () => void): void;
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (response: any) => void;
      }): {
        requestAccessToken: (options?: { prompt?: string }) => void;
      };

      function revoke(token: string, callback: () => void): void;
    }
  }
}

interface Window {
  gapi: typeof gapi;
  google: typeof google;
}

export {};
