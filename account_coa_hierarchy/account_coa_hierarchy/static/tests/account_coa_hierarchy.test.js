import { defineMailModels } from "@mail/../tests/mail_test_helpers";
import { describe, expect, test } from "@odoo/hoot";
import {
    contains,
    defineModels,
    fields,
    models,
    mountView,
    toggleMenuItem,
    toggleSearchBarMenu,
} from "@web/../tests/web_test_helpers";

import "../src/views/account_coa_hierarchy/account_coa_hierarchy_view";


class Account extends models.Model {
    _name = "account.account";

    name = fields.Char();
    code = fields.Char();
    placeholder_code = fields.Char();
    account_type = fields.Char();
    deprecated = fields.Boolean();

    coa_hierarchy_parent_id = fields.Many2one({
        relation: "account.account",
    });

    coa_hierarchy_is_type_node = fields.Boolean();
    coa_hierarchy_account_count = fields.Integer();

    _records = [
    {
        id: 1,
        name: "Deprecated Test Receivable",
        code: "999001",
        placeholder_code: "999001",
        account_type: "asset_receivable",
        deprecated: true,
        coa_hierarchy_parent_id: false,
        coa_hierarchy_is_type_node: false,
        coa_hierarchy_account_count: 0,
    },
    {
        id: 2,
        name: "Active Test Income",
        code: "999002",
        placeholder_code: "999002",
        account_type: "income",
        deprecated: false,
        coa_hierarchy_parent_id: false,
        coa_hierarchy_is_type_node: false,
        coa_hierarchy_account_count: 0,
    },
];

    async get_coa_hierarchy_roots(domain = []) {
    const showDeprecated = domain.some(
        (condition) =>
            Array.isArray(condition) &&
            condition[0] === "deprecated" &&
            condition[1] === "=" &&
            condition[2] === true
    );

    if (showDeprecated) {
        return [
            {
                id: -1,
                name: "Receivable",
                display_name: "Receivable",
                account_type: "Receivable",
                coa_hierarchy_parent_id: false,
                coa_hierarchy_is_type_node: true,
                coa_hierarchy_account_count: 1,
                __child_ids__: [1],
            },
        ];
    }

    return [
        {
            id: -2,
            name: "Income",
            display_name: "Income",
            account_type: "Income",
            coa_hierarchy_parent_id: false,
            coa_hierarchy_is_type_node: true,
            coa_hierarchy_account_count: 1,
            __child_ids__: [2],
        },
    ];
}
}


defineModels([Account]);
defineMailModels();

describe.current.tags("desktop");

async function enableFilters(filterNames = []) {
    await toggleSearchBarMenu();

    for (const filter of filterNames) {
        await toggleMenuItem(filter);
    }
}

const hierarchyArch = `
    <hierarchy
        parent_field="coa_hierarchy_parent_id"
        js_class="account_coa_hierarchy_native"
        draggable="0"
        create="0"
        edit="0"
        delete="0"
    >
        <field name="name"/>
        <field name="code"/>
        <field name="placeholder_code"/>
        <field name="account_type"/>
        <field name="coa_hierarchy_parent_id"/>
        <field name="coa_hierarchy_is_type_node"/>
        <field name="coa_hierarchy_account_count"/>

        <templates>
            <t t-name="hierarchy-box">

                <t t-if="record.coa_hierarchy_is_type_node.raw_value">
                    <div class="o_coa_hierarchy_type_card">
                        <field name="account_type"/>
                    </div>
                </t>

                <t t-else="">
                    <div class="o_coa_hierarchy_account_card">
                        <div class="o_coa_hierarchy_account_name">
                            <field name="name"/>
                        </div>
                    </div>
                </t>

            </t>
        </templates>
    </hierarchy>
`;


test("deprecated account can be unfolded from account type", async () => {
    await mountView({
        type: "hierarchy",
        resModel: "account.account",
        arch: hierarchyArch,
        domain: [["deprecated", "=", true]],
    });

    expect(".o_coa_hierarchy_type_card").toHaveText("Receivable");
    expect(".o_coa_hierarchy_account_card").toHaveCount(0);

    await contains(".o_hierarchy_node_button.btn-primary").click();

    expect(".o_coa_hierarchy_account_card").toHaveText(
        "Deprecated Test Receivable"
    );
});

test("active account can be unfolded normally", async () => {
    await mountView({
        type: "hierarchy",
        resModel: "account.account",
        arch: hierarchyArch,
        domain: [["deprecated", "=", false]],
    });

    expect(".o_coa_hierarchy_type_card").toHaveText("Income");
    expect(".o_coa_hierarchy_account_card").toHaveCount(0);

    await contains(".o_hierarchy_node_button.btn-primary").click();

    expect(".o_coa_hierarchy_account_card").toHaveText(
        "Active Test Income"
    );
});

test("hierarchy reloads when search domain changes", async () => {
    const searchViewArch = `
        <search>
            <filter
                name="deprecated_accounts"
                string="Deprecated Accounts"
                domain="[('deprecated', '=', True)]"
            />
        </search>
    `;

    await mountView({
        type: "hierarchy",
        resModel: "account.account",
        arch: hierarchyArch,
        searchViewArch,
    });

    expect(".o_coa_hierarchy_type_card").toHaveCount(1);
    expect(".o_coa_hierarchy_type_card").toHaveText("Income");

    await contains(".o_hierarchy_node_button.btn-primary").click();

    expect(".o_coa_hierarchy_account_card").toHaveCount(1);
    expect(".o_coa_hierarchy_account_name").toHaveText(
        "Active Test Income"
    );

    // Use the visible filter label, not its technical name.
    await enableFilters(["Deprecated Accounts"]);

    expect(".o_coa_hierarchy_type_card").toHaveCount(1);
    expect(".o_coa_hierarchy_type_card").toHaveText("Receivable");

    // The previously expanded active account must be gone.
    expect(".o_coa_hierarchy_account_card").toHaveCount(0);

    await contains(".o_hierarchy_node_button.btn-primary").click();

    expect(".o_coa_hierarchy_account_card").toHaveCount(1);
    expect(".o_coa_hierarchy_account_name").toHaveText(
        "Deprecated Test Receivable"
    );
});

test("clicking account type expands and collapses without opening a record", async () => {
    const selectedResIds = [];

    await mountView({
        type: "hierarchy",
        resModel: "account.account",
        arch: hierarchyArch,
        selectRecord: (resId) => {
            selectedResIds.push(resId);
        },
    });

    expect(".o_coa_hierarchy_type_card").toHaveCount(1);
    expect(".o_coa_hierarchy_type_card").toHaveText("Income");

    // Clicking the Account Type card itself should unfold it.
    await contains(".o_coa_hierarchy_type_card").click();

    expect(".o_coa_hierarchy_account_card").toHaveCount(1);
    expect(".o_coa_hierarchy_account_name").toHaveText(
        "Active Test Income"
    );

    // The virtual negative node must never be passed to selectRecord().
    expect(selectedResIds).toEqual([]);

    // Clicking the type card again should collapse it.
    await contains(".o_coa_hierarchy_type_card").click();

    expect(".o_coa_hierarchy_account_card").toHaveCount(0);
    expect(selectedResIds).toEqual([]);
});

test("clicking a real account opens the account record", async () => {
    const selectedResIds = [];

    await mountView({
        type: "hierarchy",
        resModel: "account.account",
        arch: hierarchyArch,
        selectRecord: (resId) => {
            selectedResIds.push(resId);
        },
    });

    // First expose the real account.
    await contains(".o_hierarchy_node_button.btn-primary").click();

    expect(".o_coa_hierarchy_account_card").toHaveCount(1);
    expect(".o_coa_hierarchy_account_name").toHaveText(
        "Active Test Income"
    );

    // Clicking the account card should use normal Odoo navigation.
    await contains(".o_coa_hierarchy_account_card").click();

    expect(selectedResIds).toEqual([2]);
});