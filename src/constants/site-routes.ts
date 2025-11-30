export const siteRoutes = {
  home: "/",
  auth: {
    login: "/login",
    register: "/register",
    signUp: "/sign-up",
    signUpAlt: "/signup",
  },
  dashboard: {
    root: "/dashboard",
    application: {
      root: "/dashboard/application",
      new: "/dashboard/application/new",
    },
    applicationQueue: {
      root: "/dashboard/application-queue",
    },
    agents: {
      root: "/dashboard/agents",
    },
  },
  track: "/track",
} as const;

export type SiteRoutes = typeof siteRoutes;
