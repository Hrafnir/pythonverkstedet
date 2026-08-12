export {};

declare global {
  interface Window {
    bjornsveenDesktop?: {
      isDesktop: boolean;
      openProject: () => Promise<{ filePath: string; name: string; code: string } | null>;
      saveProject: (payload: { filePath?: string; name: string; code: string }) => Promise<{ filePath: string; name: string } | null>;
    };
  }
}
