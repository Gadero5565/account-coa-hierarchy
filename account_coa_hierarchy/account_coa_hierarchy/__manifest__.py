{
    "name": "Chart of Accounts Hierarchy",
    "version": "17.0.1.0.0",
    "category": "Accounting/Accounting",
    "summary": "Native hierarchy view for Chart of Accounts grouped by account type",
    "description": (
        "Adds an optional hierarchy view to the standard Chart of Accounts. "
        "Accounts are grouped by account type while preserving Odoo's "
        "standard Chart of Accounts behavior."
    ),
    "author": "Gadeer Mahmoud",
    "website": "https://github.com/Gadero5565/account-coa-hierarchy",
    "depends": ["account", "web_hierarchy"],
    "data": [
        "views/account_account_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "account_coa_hierarchy/static/src/views/account_coa_hierarchy/**/*",
        ],
        "web.qunit_suite_tests": [
            "account_coa_hierarchy/static/tests/**/*",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}