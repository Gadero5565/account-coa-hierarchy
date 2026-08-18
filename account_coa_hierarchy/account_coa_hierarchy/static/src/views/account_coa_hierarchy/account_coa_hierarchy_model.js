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
        const context = { bin_size: true, ...(config.context || {}) };
        return await this.orm.call(
            this.resModel,
            "get_coa_hierarchy_roots",
            [domain],
            { context }
        );
    }

    /**
     * Account-type roots contain only child account IDs. Fetch those IDs from
     * account.account when the user unfolds a type. Leaves are real records.
     */
    async _fetchSubordinates(node, excludeResIds = null) {
        if (!node.data.coa_hierarchy_is_type_node) {
            return [];
        }

        const childFieldName = this.childFieldName || this.defaultChildFieldName;
        let childResIds = node.data[childFieldName] || [];

        if (excludeResIds?.length) {
            childResIds = childResIds.filter((id) => !excludeResIds.includes(id));
        }
        if (!childResIds.length) {
            return [];
        }

        const { records } = await this.orm.webSearchRead(
            this.resModel,
            [["id", "in", childResIds]],
            {
                specification: this._getFieldsSpec(),
                // childResIds were already produced from the current search domain.
                // Disable active_test here so inactive accounts selected by the
                // "Inactive Accounts" filter can still be lazy-loaded.
                context: {
                    ...this.context,
                    active_test: false,
                },
                order: "code, placeholder_code",
            }
        );

        for (const record of records) {
            // These values are only frontend hierarchy metadata. Nothing is
            // written to account.account.
            record.coa_hierarchy_parent_id = {
                id: node.resId,
                display_name: node.data.display_name || node.data.name,
            };
            record.coa_hierarchy_is_type_node = false;
            record.coa_hierarchy_account_count = 0;
            record[childFieldName] = [];
        }

        return records;
    }
}
