{
    "name": "Chart of Accounts Hierarchy",
    "version": "19.0.1.0.0",
    "category": "Accounting/Accounting",
    "summary": "Native hierarchy view for Chart of Accounts grouped by account type",
    "depends": ["account", "web_hierarchy"],
    "data": [
        "views/account_account_views.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "account_coa_hierarchy_native_poc/static/src/views/account_coa_hierarchy/**/*",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}
