import { HierarchyController } from "@web_hierarchy/hierarchy_controller";

export class AccountCoaHierarchyController extends HierarchyController {
    async openRecord(node, mode) {
        if (node.data.coa_hierarchy_is_type_node) {
            if (node.nodes.length) {
                node.collapseChildNodes();
            } else {
                await node.showChildNodes();
            }
            return;
        }

        // Real hierarchy leaves are genuine account.account records.
        return super.openRecord(node, mode);
    }
}