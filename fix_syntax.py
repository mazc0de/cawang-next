import re

with open("src/views/BudgetPage.tsx", "r") as f:
    content = f.read()

# Replace the specific syntax issue
old_code = """                  </SelectContent>
                </Select>
              </div>
              </div>
              <div className="space-y-2">"""

new_code = """                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">"""

content = content.replace(old_code, new_code)

# Add fragment wrapper around the !editBudget condition
content = content.replace(
    '{!editBudget && (\n              <div className="space-y-1.5">',
    '{!editBudget && (\n              <>\n                <div className="space-y-1.5">'
)

content = content.replace(
    '                </Select>\n            )}\n\n            <div className="space-y-1.5">',
    '                </Select>\n              </div>\n              </>\n            )}\n\n            <div className="space-y-1.5">'
)

with open("src/views/BudgetPage.tsx", "w") as f:
    f.write(content)

