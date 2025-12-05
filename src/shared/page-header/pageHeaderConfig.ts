import type { PageHeaderInfo } from "./types";

export const pageHeaderConfig: Record<string, PageHeaderInfo> = {
  "/": {
    title: "",
    description: "",
  },
};

export const getPageHeaderByPath = (
  path: string
): PageHeaderInfo | undefined => {
  return pageHeaderConfig[path];
};
