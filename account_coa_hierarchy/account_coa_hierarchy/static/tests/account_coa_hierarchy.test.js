/** @odoo-module **/

import {
    click,
    getFixture,
    nextTick,
} from "@web/../tests/helpers/utils";
import { makeView, setupViewRegistries } from "@web/../tests/views/helpers";

import "../src/views/account_coa_hierarchy/account_coa_hierarchy_view";

let serverData;
let target;

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

const deprecatedSearchViewArch = `
    <search>
        <filter
            name="deprecated_accounts"
            string="Deprecated Accounts"
            domain="[('deprecated', '=', True)]"
        />
    </search>
`;

function getHierarchyRoots(domain = []) {
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

async function mockRPC(route, args) {
    if (
        args.model === "account.account" &&
        args.method === "get_coa_hierarchy_roots"
    ) {
        const domain = args.args?.[0] || [];
        return getHierarchyRoots(domain);
    }
}

QUnit.module("Chart of Accounts Hierarchy", (hooks) => {
    hooks.beforeEach(() => {
        setupViewRegistries();
        target = getFixture();

        serverData = {
            models: {
                "account.account": {
                    fields: {
                        name: {
                            string: "Account Name",
                            type: "char",
                        },
                        code: {
                            string: "Code",
                            type: "char",
                        },
                        account_type: {
                            string: "Account Type",
                            type: "char",
                        },
                        deprecated: {
                            string: "Deprecated",
                            type: "boolean",
                        },
                        coa_hierarchy_parent_id: {
                            string: "Hierarchy Parent",
                            type: "many2one",
                            relation: "account.account",
                        },
                        coa_hierarchy_is_type_node: {
                            string: "Is Account Type Node",
                            type: "boolean",
                        },
                        coa_hierarchy_account_count: {
                            string: "Account Count",
                            type: "integer",
                        },
                    },
                    records: [
                        {
                            id: 1,
                            name: "Deprecated Test Receivable",
                            code: "999001",
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
                            account_type: "income",
                            deprecated: false,
                            coa_hierarchy_parent_id: false,
                            coa_hierarchy_is_type_node: false,
                            coa_hierarchy_account_count: 0,
                        },
                    ],
                },
            },
            views: {},
        };
    });

    hooks.afterEach(() => {
        document
            .querySelector("#x-odoo-technical-list-shadow-host")
            ?.remove();
    });

    QUnit.test(
        "deprecated account can be unfolded from account type",
        async function (assert) {
            await makeView({
                type: "hierarchy",
                resModel: "account.account",
                serverData,
                arch: hierarchyArch,
                domain: [["deprecated", "=", true]],
                mockRPC,
            });

            assert.containsOnce(target, ".o_coa_hierarchy_type_card");
            assert.strictEqual(
                target.querySelector(".o_coa_hierarchy_type_card").textContent.trim(),
                "Receivable"
            );
            assert.containsNone(target, ".o_coa_hierarchy_account_card");

            await click(target, ".o_hierarchy_node_button.btn-primary");

            assert.containsOnce(target, ".o_coa_hierarchy_account_card");
            assert.strictEqual(
                target.querySelector(".o_coa_hierarchy_account_name").textContent.trim(),
                "Deprecated Test Receivable"
            );
        }
    );

    QUnit.test("active account can be unfolded normally", async function (assert) {
        await makeView({
            type: "hierarchy",
            resModel: "account.account",
            serverData,
            arch: hierarchyArch,
            domain: [["deprecated", "=", false]],
            mockRPC,
        });

        assert.containsOnce(target, ".o_coa_hierarchy_type_card");
        assert.strictEqual(
            target.querySelector(".o_coa_hierarchy_type_card").textContent.trim(),
            "Income"
        );
        assert.containsNone(target, ".o_coa_hierarchy_account_card");

        await click(target, ".o_hierarchy_node_button.btn-primary");

        assert.containsOnce(target, ".o_coa_hierarchy_account_card");
        assert.strictEqual(
            target.querySelector(".o_coa_hierarchy_account_name").textContent.trim(),
            "Active Test Income"
        );
    });

    QUnit.test("hierarchy reloads when search domain changes", async function (assert) {
        const view = await makeView({
            type: "hierarchy",
            resModel: "account.account",
            serverData,
            arch: hierarchyArch,
            searchViewArch: deprecatedSearchViewArch,
            mockRPC,
        });

        assert.containsOnce(target, ".o_coa_hierarchy_type_card");
        assert.strictEqual(
            target
                .querySelector(".o_coa_hierarchy_type_card")
                .textContent.trim(),
            "Income"
        );

        await click(
            target,
            ".o_hierarchy_node_button.btn-primary"
        );

        assert.containsOnce(
            target,
            ".o_coa_hierarchy_account_card"
        );

        assert.strictEqual(
            target
                .querySelector(".o_coa_hierarchy_account_name")
                .textContent.trim(),
            "Active Test Income"
        );

        const deprecatedFilter =
            view.env.searchModel.getSearchItems(
                (item) =>
                    item.type === "filter" &&
                    item.name === "deprecated_accounts"
            )[0];

        view.env.searchModel.toggleSearchItem(
            deprecatedFilter.id
        );

        await nextTick();

        assert.containsOnce(
            target,
            ".o_coa_hierarchy_type_card"
        );

        assert.strictEqual(
            target
                .querySelector(".o_coa_hierarchy_type_card")
                .textContent.trim(),
            "Receivable"
        );

        // Previously expanded active account must disappear
        // after the search domain changes.
        assert.containsNone(
            target,
            ".o_coa_hierarchy_account_card"
        );

        await click(
            target,
            ".o_hierarchy_node_button.btn-primary"
        );

        assert.containsOnce(
            target,
            ".o_coa_hierarchy_account_card"
        );

        assert.strictEqual(
            target
                .querySelector(".o_coa_hierarchy_account_name")
                .textContent.trim(),
            "Deprecated Test Receivable"
        );
    });

    QUnit.test("clicking account type expands and collapses without opening a record", async function (assert) {
            const selectedResIds = [];

            await makeView({
                type: "hierarchy",
                resModel: "account.account",
                serverData,
                arch: hierarchyArch,
                mockRPC,
                selectRecord: (resId) => {
                    selectedResIds.push(resId);
                },
            });

            assert.containsOnce(target, ".o_coa_hierarchy_type_card");
            assert.strictEqual(
                target.querySelector(".o_coa_hierarchy_type_card").textContent.trim(),
                "Income"
            );

            await click(target, ".o_coa_hierarchy_type_card");

            assert.containsOnce(target, ".o_coa_hierarchy_account_card");
            assert.deepEqual(selectedResIds, []);

            await click(target, ".o_coa_hierarchy_type_card");

            assert.containsNone(target, ".o_coa_hierarchy_account_card");
            assert.deepEqual(selectedResIds, []);
        });

    QUnit.test("clicking a real account opens the account record", async function (assert) {
        const selectedResIds = [];

        await makeView({
            type: "hierarchy",
            resModel: "account.account",
            serverData,
            arch: hierarchyArch,
            mockRPC,
            selectRecord: (resId) => {
                selectedResIds.push(resId);
            },
        });

        await click(target, ".o_hierarchy_node_button.btn-primary");

        assert.containsOnce(target, ".o_coa_hierarchy_account_card");
        assert.strictEqual(
            target.querySelector(".o_coa_hierarchy_account_name").textContent.trim(),
            "Active Test Income"
        );

        await click(target, ".o_coa_hierarchy_account_card");

        assert.deepEqual(selectedResIds, [2]);
    });
});