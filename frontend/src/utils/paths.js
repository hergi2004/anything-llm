import { API_BASE } from "./constants";

export default {
  home: () => {
    return "/";
  },
  login: () => {
    return "/login";
  },
  onboarding: {
    home: () => {
      return "/onboarding";
    },
    survey: () => {
      return "/onboarding/survey";
    },
    llmPreference: () => {
      return "/onboarding/llm-preference";
    },
    embeddingPreference: () => {
      return "/onboarding/embedding-preference";
    },
    vectorDatabase: () => {
      return "/onboarding/vector-database";
    },
    customLogo: () => {
      return "/onboarding/custom-logo";
    },
    userSetup: () => {
      return "/onboarding/user-setup";
    },
    dataHandling: () => {
      return "/onboarding/data-handling";
    },
    createWorkspace: () => {
      return "/onboarding/create-workspace";
    },
  },
  github: () => {
    return "https://github.com";
  },
  discord: () => {
    return "https://discord.com/";
  },
  docs: () => {
    return "https://docs.google.com";
  },
  mailToMintplex: () => {
    return "mailto:info@infosedge.com";
  },
  hosting: () => {
    return "https://my.mintplexlabs.com/aio-checkout?product=anythingllm";
  },
  workspace: {
    chat: (slug) => {
      return `/workspace/${slug}`;
    },
  },
  exports: () => {
    return `${API_BASE.replace("/api", "")}/system/data-exports`;
  },
  apiDocs: () => {
    return `${API_BASE}/docs`;
  },
  settings: {
    system: () => {
      return `/settings/system-preferences`;
    },
    users: () => {
      return `/settings/users`;
    },
    invites: () => {
      return `/settings/invites`;
    },
    workspaces: () => {
      return `/settings/workspaces`;
    },
    chats: () => {
      return "/settings/workspace-chats";
    },
    llmPreference: () => {
      return "/settings/llm-preference";
    },
    embeddingPreference: () => {
      return "/settings/embedding-preference";
    },
    vectorDatabase: () => {
      return "/settings/vector-database";
    },
    exportImport: () => {
      return "/settings/export-import";
    },
    security: () => {
      return "/settings/security";
    },
    appearance: () => {
      return "/settings/appearance";
    },
    apiKeys: () => {
      return "/settings/api-keys";
    },
    dataConnectors: {
      list: () => {
        return "/settings/data-connectors";
      },
      github: () => {
        return "/settings/data-connectors/github";
      },
      youtubeTranscript: () => {
        return "/settings/data-connectors/youtube-transcript";
      },
    },
  },
};
