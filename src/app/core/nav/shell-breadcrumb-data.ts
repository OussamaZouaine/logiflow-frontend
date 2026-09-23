export interface ShellBreadcrumbTrailItem {
  label: string;
  path?: string;
}

export interface ShellBreadcrumbRouteData {
  trail: readonly ShellBreadcrumbTrailItem[];
  leaf?: string;
}

export const shellBreadcrumb = {
  list(label: string): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return { shellBreadcrumb: { trail: [{ label }] } };
  },

  nested(
    parentLabel: string,
    parentPath: string,
    label: string
  ): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return {
      shellBreadcrumb: {
        trail: [{ label: parentLabel, path: parentPath }, { label }],
      },
    };
  },

  create(
    moduleLabel: string,
    listPath: string
  ): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return {
      shellBreadcrumb: {
        trail: [{ label: moduleLabel, path: listPath }],
        leaf: "Nouveau",
      },
    };
  },

  detail(
    moduleLabel: string,
    listPath: string
  ): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return {
      shellBreadcrumb: {
        trail: [{ label: moduleLabel, path: listPath }],
      },
    };
  },

  createNested(
    trail: readonly ShellBreadcrumbTrailItem[]
  ): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return {
      shellBreadcrumb: {
        trail,
        leaf: "Nouveau",
      },
    };
  },

  detailNested(
    trail: readonly ShellBreadcrumbTrailItem[]
  ): { shellBreadcrumb: ShellBreadcrumbRouteData } {
    return {
      shellBreadcrumb: { trail },
    };
  },
};
