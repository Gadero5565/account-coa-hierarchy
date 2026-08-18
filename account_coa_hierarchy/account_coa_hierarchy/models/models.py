# from odoo import models, fields, api


# class account_coa_hierarchy(models.Model):
#     _name = 'account_coa_hierarchy.account_coa_hierarchy'
#     _description = 'account_coa_hierarchy.account_coa_hierarchy'

#     name = fields.Char()
#     value = fields.Integer()
#     value2 = fields.Float(compute="_value_pc", store=True)
#     description = fields.Text()
#
#     @api.depends('value')
#     def _value_pc(self):
#         for record in self:
#             record.value2 = float(record.value) / 100

