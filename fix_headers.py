import os
import re

directory = '/Users/mkp/Documents/Workspace/ai/cawang-app/cawang-next/src/views'
files = [
    'AccountsPage.tsx',
    'AnalyticsPage.tsx',
    'BudgetPage.tsx',
    'CalendarPage.tsx',
    'CategoriesPage.tsx',
    'RecurringPage.tsx',
    'SettingsPage.tsx',
    'TransactionsPage.tsx'
]

for filename in files:
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    start_idx = content.find('<DashboardHeader')
    if start_idx == -1:
        continue
        
    end_tag = '</DashboardHeader>'
    end_idx = content.find(end_tag, start_idx)
    
    if end_idx == -1:
        end_idx = content.find('/>', start_idx) + 2
    else:
        end_idx += len(end_tag)
        
    nl_idx = content.rfind('\n', 0, start_idx)
    if nl_idx != -1:
        prefix_spaces = content[nl_idx+1:start_idx]
        if prefix_spaces.isspace():
            start_idx = nl_idx + 1
            
    header_block = content[start_idx:end_idx]
    
    content = content[:start_idx] + content[end_idx:]
    
    main_pattern = re.compile(r'(<main[^>]*>)')
    main_match = main_pattern.search(content)
    if main_match:
        main_tag = main_match.group(1)
        insert_pos = main_match.end()
        # Ensure we add a newline after <main> and insert the block
        content = content[:insert_pos] + '\n' + header_block + content[insert_pos:]
        
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
