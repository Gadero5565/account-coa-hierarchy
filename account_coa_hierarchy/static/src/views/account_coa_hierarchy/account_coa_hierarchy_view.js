/** @odoo-module **/

import { registry } from "@web/core/registry";
import { hierarchyView } from "@web_hierarchy/hierarchy_view";

import { AccountCoaHierarchyController } from "./account_coa_hierarchy_controller";
import { AccountCoaHierarchyModel } from "./account_coa_hierarchy_model";

export const accountCoaHierarchyView = {
    ...hierarchyView,
    Controller: AccountCoaHierarchyController,
    Model: AccountCoaHierarchyModel,

    // Odoo 17's native hierarchy disables search menus entirely.
    // Enable Filters to match Odoo 18/19 hierarchy behavior.
    searchMenuTypes: ["filter"],
};

registry
    .category("views")
    .add("account_coa_hierarchy_native", accountCoaHierarchyView);