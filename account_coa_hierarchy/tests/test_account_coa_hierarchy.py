from odoo import Command
from odoo.tests import tagged
from odoo.tests.common import TransactionCase


@tagged("post_install", "-at_install")
class TestAccountCoaHierarchy(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        cls.Account = cls.env["account.account"]
        cls.company = cls.env.company

        def create_account(name, code, account_type, active=True):
            return cls.Account.with_company(cls.company).create({
                "name": name,
                "code": code,
                "account_type": account_type,
                "active": active,
                "company_ids": [Command.set([cls.company.id])],
            })

        cls.income_account_1 = create_account(
            "COA Hierarchy Test Income A",
            "HIER001",
            "income",
        )

        cls.income_account_2 = create_account(
            "COA Hierarchy Test Income B",
            "HIER002",
            "income",
        )

        cls.expense_account = create_account(
            "COA Hierarchy Test Expense",
            "HIER003",
            "expense",
        )

        cls.inactive_receivable_account = create_account(
            "COA Hierarchy Test Inactive Receivable",
            "HIER004",
            "asset_receivable",
            active=False,
        )

        cls.test_domain = [
            ("name", "ilike", "COA Hierarchy Test"),
        ]

    def _get_roots_by_type(self, domain=None, active_test=True):
        roots = self.Account.with_context(
            active_test=active_test,
        ).get_coa_hierarchy_roots(domain or [])

        return {
            root["account_type"]: root
            for root in roots
        }

    def test_hierarchy_groups_accounts_by_type(self):
        """Accounts matching the domain should be grouped by account type."""

        roots = self._get_roots_by_type(self.test_domain)

        self.assertEqual(
            set(roots),
            {"income", "expense"},
        )

        income_root = roots["income"]
        expense_root = roots["expense"]

        self.assertEqual(
            income_root["coa_hierarchy_account_count"],
            2,
        )
        self.assertEqual(
            expense_root["coa_hierarchy_account_count"],
            1,
        )

        self.assertEqual(
            set(income_root["__child_ids__"]),
            {
                self.income_account_1.id,
                self.income_account_2.id,
            },
        )

        self.assertEqual(
            set(expense_root["__child_ids__"]),
            {
                self.expense_account.id,
            },
        )

    def test_hierarchy_roots_are_virtual(self):
        """Account type roots must never collide with real account IDs."""

        roots = self.Account.get_coa_hierarchy_roots(
            [
                *self.test_domain,
                ("account_type", "=", "income"),
            ]
        )

        self.assertEqual(len(roots), 1)

        root = roots[0]

        self.assertLess(root["id"], 0)
        self.assertTrue(root["coa_hierarchy_is_type_node"])
        self.assertFalse(root["coa_hierarchy_parent_id"])

    def test_account_type_domain_filters_roots(self):
        """A normal account domain must also filter hierarchy roots."""

        roots = self._get_roots_by_type([
            *self.test_domain,
            ("account_type", "=", "income"),
        ])

        self.assertEqual(
            set(roots),
            {"income"},
        )

        self.assertEqual(
            set(roots["income"]["__child_ids__"]),
            {
                self.income_account_1.id,
                self.income_account_2.id,
            },
        )

    def test_empty_account_type_is_not_returned(self):
        """Types without matching accounts should not create empty roots."""

        roots = self.Account.get_coa_hierarchy_roots([
            *self.test_domain,
            ("account_type", "=", "asset_fixed"),
        ])

        self.assertFalse(roots)

    def test_inactive_accounts_can_build_hierarchy(self):
        """Inactive-filter domains must still generate hierarchy roots."""

        roots = self._get_roots_by_type(
            [
                *self.test_domain,
                ("active", "=", False),
            ],
            active_test=False,
        )

        self.assertEqual(
            set(roots),
            {"asset_receivable"},
        )

        receivable_root = roots["asset_receivable"]

        self.assertEqual(
            receivable_root["coa_hierarchy_account_count"],
            1,
        )

        self.assertEqual(
            receivable_root["__child_ids__"],
            [self.inactive_receivable_account.id],
        )

    def test_default_context_excludes_inactive_accounts(self):
        """Inactive accounts must not leak into the normal hierarchy."""

        roots = self._get_roots_by_type(self.test_domain)

        child_ids = {
            account_id
            for root in roots.values()
            for account_id in root["__child_ids__"]
        }

        self.assertNotIn(
            self.inactive_receivable_account.id,
            child_ids,
        )

    def test_chart_of_accounts_keeps_odoo_default_view(self):
        """Installing the module must not make Hierarchy the default view."""

        action = self.env.ref("account.action_account_form")
        view_modes = action.view_mode.split(",")

        self.assertEqual(
            view_modes[0],
            "list",
            "Chart of Accounts must continue opening in List view.",
        )

        self.assertEqual(
            view_modes[-1],
            "hierarchy",
            "Hierarchy should remain the last optional view.",
        )

        self.assertEqual(
            view_modes.count("hierarchy"),
            1,
        )