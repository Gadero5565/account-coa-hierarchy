# Chart of Accounts Hierarchy

A native hierarchy view for the Odoo Chart of Accounts.

This module adds an optional **Hierarchy** view to the standard Chart of Accounts and groups accounts visually by account type while preserving Odoo's normal accounting workflow and standard views.

## Overview

Large Charts of Accounts can become difficult to navigate when all accounts are presented only as a flat list.

**Chart of Accounts Hierarchy** adds a visual hierarchy that groups real `account.account` records under their corresponding account types.

The hierarchy is an additional view only. It does not replace the standard Chart of Accounts views and does not modify accounting relationships.

## Features

- Native Odoo hierarchy experience
- Account Type → Account structure
- Fold and unfold account types
- Open real `account.account` records directly from the hierarchy
- Standard Chart of Accounts search support
- Standard filter support
- Multi-company compatible
- Account visibility follows the supported Odoo version's standard behavior
- Lazy loading of account records
- No fake accounting records
- No drag-and-drop accounting relationship changes
- Backend regression tests
- Frontend regression tests
- Preserves the standard Chart of Accounts default view

## Supported Versions

Stable implementations are available for:

- Odoo 17.0
- Odoo 18.0
- Odoo 19.0

Use the repository branch matching your Odoo version.

## Repository Branches

- `17.0` → Odoo 17
- `18.0` → Odoo 18
- `19.0` → Odoo 19

Repository:

```text
https://github.com/Gadero5565/account-coa-hierarchy
```

## Hierarchy Structure

The hierarchy contains two visual levels:

```text
Account Type
    ├── Account
    ├── Account
    └── Account
```

Example:

```text
Income
    ├── 400000 Product Sales
    ├── 401000 Consulting Services
    └── 402000 Other Revenue

Expenses
    ├── 600000 Salaries
    ├── 601000 Rent
    └── 602000 Utilities
```

Account Type nodes are virtual hierarchy nodes used only for visualization.

The child nodes are real `account.account` records.

## Odoo Integration

The module extends the standard Chart of Accounts action and adds **Hierarchy** as an additional view.

The normal Odoo List/Tree view remains the default view, depending on the Odoo version.

The standard accounting workflow is preserved.

## Search and Filters

The hierarchy follows the active Chart of Accounts search domain.

Standard searches and filters continue to work, including account-type filters, account searches, accounts with entries, and account visibility filters supported by the installed Odoo version.

Odoo versions differ slightly in how deprecated or inactive accounts are represented, and each branch follows the standard behavior of its corresponding Odoo version.

## Multi-Company

The hierarchy respects Odoo's normal company context, account visibility rules, access rights, and search domains.

Version-specific account-code behavior is handled by the corresponding branch implementation.

## Technical Approach

Odoo's hierarchy view expects a self-referencing model structure.

However, the Chart of Accounts uses `account_type` as a field rather than a parent model.

This module keeps `account.account` as the real hierarchy model and creates virtual Account Type roots for visualization.

When an Account Type is unfolded, the corresponding real account records are loaded and displayed beneath it.

This approach allows the module to reuse Odoo's native hierarchy infrastructure without creating fake accounting records or modifying accounting relationships.

## Dependencies

The module depends on:

```text
account
web_hierarchy
```

## Installation

Clone the repository:

```bash
git clone https://github.com/Gadero5565/account-coa-hierarchy.git
```

Checkout the branch matching your Odoo version.

For Odoo 19:

```bash
git checkout 19.0
```

For Odoo 18:

```bash
git checkout 18.0
```

For Odoo 17:

```bash
git checkout 17.0
```

The Odoo addon is located at:

```text
account_coa_hierarchy/
```

Make sure the **repository root** is included in your Odoo `addons_path`.

Then update the Apps list and install:

```text
Chart of Accounts Hierarchy
```

Technical module name:

```text
account_coa_hierarchy
```

## Usage

Open:

```text
Accounting → Configuration → Chart of Accounts
```

Select the **Hierarchy** view from the view switcher.

You can then:

- Browse accounts by Account Type
- Fold and unfold Account Type nodes
- Search accounts
- Apply standard Chart of Accounts filters
- Click a real account card to open the standard Odoo account form

## Screenshots

### Hierarchy Overview

![Chart of Accounts Hierarchy Overview](docs/images/account-coa-hierarchy.png)

Additional screenshots are available in the module's Odoo Apps description under:

```text
account_coa_hierarchy/static/description/
```

## Tests

The module includes backend and frontend regression tests adapted to each supported Odoo version.

The test suites cover important behaviors such as:

- Account Type grouping
- Domain filtering
- Virtual hierarchy roots
- Account visibility behavior
- Preservation of the standard Chart of Accounts default view
- Fold and unfold behavior
- Search-domain changes
- Virtual Account Type navigation
- Real account record navigation

## Version Notes

Some implementation details differ between Odoo versions because the underlying Odoo APIs changed.

Examples include:

- List vs Tree naming in the standard Chart of Accounts action
- Account company fields
- Account code behavior
- Deprecated / inactive account handling
- Frontend test framework and hierarchy APIs

Each supported branch contains the implementation appropriate for that Odoo version while keeping the user-facing behavior consistent.

## Status

Stable implementations are available for Odoo 17, Odoo 18, and Odoo 19.

## License

GNU Lesser General Public License v3.0 — LGPL-3.0.

See the repository `LICENSE` file for the full license text.

## Author

**Gadeer Mahmoud**

GitHub: `Gadero5565`

Repository:

```text
https://github.com/Gadero5565/account-coa-hierarchy
```