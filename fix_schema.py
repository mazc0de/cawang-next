import re

with open("supabase/schema.sql", "r") as f:
    content = f.read()

def replace_enum(match):
    enum_statement = match.group(0)
    return f"do $$ begin\n  {enum_statement}\nexception when duplicate_object then null;\nend $$;"

content = re.sub(r"create type \w+ as enum \([^)]+\);", replace_enum, content)

with open("supabase/schema.sql", "w") as f:
    f.write(content)

