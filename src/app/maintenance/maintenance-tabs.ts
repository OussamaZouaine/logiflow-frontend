import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-maintenance-tabs",
  templateUrl: "./maintenance-tabs.html",
})
export class MaintenanceTabs {}
