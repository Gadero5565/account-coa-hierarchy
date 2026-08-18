/** @odoo-module **/

import { registry } from "@web/core/registry";
import { hierarchyView } from "@web_hierarchy/hierarchy_view";
import { AccountCoaHierarchyController } from "./account_coa_hierarchy_controller";
import { AccountCoaHierarchyModel } from "./account_coa_hierarchy_model";

export const accountCoaHierarchyView = {
    ...hierarchyView,
    Controller: AccountCoaHierarchyController,
    Model: AccountCoaHierarchyModel,
};

registry.category("views").add("account_coa_hierarchy_native", accountCoaHierarchyView);
