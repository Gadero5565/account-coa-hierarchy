/** @odoo-module **/

import { HierarchyModel } from "@web_hierarchy/hierarchy_model";

export class AccountCoaHierarchyModel extends HierarchyModel {
    /**
     * Load virtual account-type roots instead of calling hierarchy_read().
     *
     * config.domain is the domain produced by the existing account.account
     * search model, so normal Chart of Accounts searches and filters are
     * preserved.
     */
    async _loadData(config, reload = false) {
        const domain = config.domain || [];
        const context = {
            bin_size: true,
            ...(config.context || {}),
        };

        return await this.orm.call(
            this.resModel,
            "get_coa_hierarchy_roots",
            [domain],
            { context }
        );
    }

    /**
     * Account-type roots contain only child account IDs.
     * Fetch those real account.account records when a type is unfolded.
     *
     * Odoo 18 hierarchy uses searchRead() + fieldsToFetch rather than the
     * webSearchRead()/field-spec API used by Odoo 19.
     */
    async _fetchSubordinates(node, excludeResIds = null) {
        if (!node.data.coa_hierarchy_is_type_node) {
            return [];
        }

        const childFieldName =
            this.childFieldName || this.defaultChildFieldName;

        let childResIds = node.data[childFieldName] || [];

        if (excludeResIds?.length) {
            childResIds = childResIds.filter(
                (id) => !excludeResIds.includes(id)
            );
        }

        if (!childResIds.length) {
            return [];
        }

        const records = await this.orm.searchRead(
            this.resModel,
            [["id", "in", childResIds]],
            this.fieldsToFetch,
            {
                context: this.context,
                order: "code",
            }
        );

        for (const record of records) {
            /*
             * Odoo 18 represents Many2one values as:
             *
             *     [id, display_name]
             *
             * whereas Odoo 19 uses an object containing id/display_name.
             */
            record.coa_hierarchy_parent_id = [
                node.resId,
                node.data.display_name || node.data.name,
            ];

            record.coa_hierarchy_is_type_node = false;
            record.coa_hierarchy_account_count = 0;
            record[childFieldName] = [];
        }

        return records;
    }
}