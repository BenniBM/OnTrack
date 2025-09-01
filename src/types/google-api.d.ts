declare global {
    interface Window {
        gapi: {
            load: (api: string, callback: () => void) => void;
            client: {
                init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
                drive: {
                    files: {
                        list: (params: { q: string; pageSize: number; fields: string; orderBy: string }) => Promise<{
                            result: {
                                files: Array<{
                                    id: string;
                                    name: string;
                                    mimeType: string;
                                    size?: string;
                                    modifiedTime?: string;
                                    webViewLink?: string;
                                    webContentLink?: string;
                                }>;
                            };
                        }>;
                    };
                };
            };
        };
    }
}

export {};
