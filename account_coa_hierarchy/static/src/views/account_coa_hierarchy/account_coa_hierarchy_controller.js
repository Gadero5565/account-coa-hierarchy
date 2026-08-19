import { HierarchyController } from "@web_hierarchy/hierarchy_controller";

export class AccountCoaHierarchyController extends HierarchyController {
    async openRecord(node, newWindow) {
        if (node.data.coa_hierarchy_is_type_node) {
            if (node.nodes.length) {
                node.collapseChildNodes();
            } else {
                await node.showChildNodes();
            }
            return;
        }

        // The hierarchy action itself is account.account now, so standard
        // record navigation opens the genuine account form directly.
        return super.openRecord(node, newWindow);
    }
}
