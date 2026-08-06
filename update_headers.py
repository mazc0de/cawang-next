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

    header_pattern = re.compile(r'(\s*<DashboardHeader[\s\S]*?(?:/>|</DashboardHeader>)\s*)', re.MULTILINE)
    
    match = header_pattern.search(content)
    if match:
        header_block = match.group(1)
        # Remove it from content
        content = content.replace(header_block, '\n')
        
        # Insert after <main ... >
        main_pattern = re.compile(r'(<main[^>]*>)')
        main_match = main_pattern.search(content)
        if main_match:
            main_tag = main_match.group(1)
            # Insert with proper spacing. header_block already has its own spaces but let's just append it.
            content = content.replace(main_tag, main_tag + header_block)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
