import { provideIcons } from "@ng-icons/core";
import {
  lucideArrowRight,
  lucideBuilding2,
  lucideClipboardList,
  lucideContainer,
  lucideFolderOpen,
  lucideFuel,
  lucideMapPin,
  lucidePackage,
  lucideRoute,
  lucideTruck,
  lucideUsers,
  lucideWrench,
} from "@ng-icons/lucide";

export { DESTINATION_NAV_ICON } from "../../core/nav/nav-icon";

/** Registers module row icons + list row action arrow for list tables. */
export const LIST_TABLE_ROW_ICON_PROVIDERS = provideIcons({
  lucideArrowRight,
  lucideBuilding2,
  lucideClipboardList,
  lucideContainer,
  lucideFolderOpen,
  lucideFuel,
  lucideMapPin,
  lucidePackage,
  lucideRoute,
  lucideTruck,
  lucideUsers,
  lucideWrench,
});
