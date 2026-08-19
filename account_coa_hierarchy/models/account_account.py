from odoo import api, fields, models


class AccountAccount(models.Model):
    _inherit = "account.account"

    # Technical field used only so Odoo's hierarchy arch parser accepts
    # account.account as a hierarchy model. The real relationship is virtual
    # and is supplied by the custom hierarchy model in JavaScript.
    coa_hierarchy_parent_id = fields.Many2one(
        "account.account",
        string="Hierarchy Parent",
        compute="_compute_coa_hierarchy_technical_fields",
    )
    coa_hierarchy_is_type_node = fields.Boolean(
        compute="_compute_coa_hierarchy_technical_fields",
    )
    coa_hierarchy_account_count = fields.Integer(
        compute="_compute_coa_hierarchy_technical_fields",
    )

    def _compute_coa_hierarchy_technical_fields(self):
        for account in self:
            account.coa_hierarchy_parent_id = False
            account.coa_hierarchy_is_type_node = False
            account.coa_hierarchy_account_count = 0

    @api.model
    def get_coa_hierarchy_roots(self, domain=None):
        """Return virtual account-type roots for the current account domain.

        The leaves are always real ``account.account`` records.  We only
        return their IDs here so the hierarchy frontend can lazy-load account
        cards when a type is unfolded.

        ``domain`` is the domain coming from the normal Chart of Accounts
        search model. Using _read_group means record rules, active_test,
        allowed companies, and the current context are respected by the ORM.
        """
        domain = list(domain or [])

        type_selection = self._fields["account_type"]._description_selection(self.env)
        type_labels = dict(type_selection)
        type_sequence = {
            account_type: sequence
            for sequence, (account_type, _label) in enumerate(type_selection, start=1)
        }

        grouped = self._read_group(
            domain,
            ["account_type"],
            ["id:array_agg"],
        )

        roots = []
        for account_type, account_ids in grouped:
            if not account_type or not account_ids:
                continue

            sequence = type_sequence.get(account_type, 999)
            label = type_labels.get(account_type, account_type)

            # Virtual IDs are negative so they can never collide with real
            # account.account database IDs.
            virtual_id = -100000 - sequence

            roots.append({
                "id": virtual_id,
                "display_name": label,
                "name": label,
                "code": False,
                "placeholder_code": False,
                "account_type": account_type,
                "currency_id": False,
                "reconcile": False,
                "coa_hierarchy_parent_id": False,
                "coa_hierarchy_is_type_node": True,
                "coa_hierarchy_account_count": len(account_ids),
                "__child_ids__": account_ids,
            })

        roots.sort(key=lambda root: type_sequence.get(root["account_type"], 999))
        return roots
