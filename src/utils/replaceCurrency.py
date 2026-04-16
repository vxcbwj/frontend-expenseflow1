import os
import re

components_dir = r"c:\Users\PC\OneDrive\Desktop\expenselfow1\frontend\src\components"

# The pattern looks for a locally defined formatCurrency function.
# It usually looks like:
# const formatCurrency = (amount: number) => { ... return new Intl.NumberFormat(...).format(amount); };
pattern1 = re.compile(r'const\s+formatCurrency\s*=\s*\([^\)]*\)\s*(?::\s*string\s*)?=>\s*\{[^}]*return\s+new\s+Intl\.NumberFormat\([^}]*\}\)\.format\([^)]*\);\s*\};', re.DOTALL)
pattern2 = re.compile(r'const\s+formatCurrency\s*=\s*\([^\)]*\)\s*(?::\s*string\s*)?=>\s*\{\s*const\s+currency\s*=\s*company\?\.currency\s*\|\|\s*"USD";\s*return\s+new\s+Intl\.NumberFormat\([^}]*\}\)\.format\([^)]*\);\s*\};', re.DOTALL)

for root, dirs, files in os.walk(components_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            if 'formatCurrency' in content and 'Intl.NumberFormat' in content:
                # Let's just manually replace "en-US" to "fr-DZ" and "USD" to company?.currency || "DZD" inside these functions
                # This doesn't involve replacing the whole function, just tweaking the inside.
                
                new_content = content.replace('"en-US"', '"fr-DZ"')
                new_content = new_content.replace('currency: "USD"', 'currency: company?.currency || "DZD"')
                new_content = new_content.replace('?\.currency || "USD"', '?\.currency || "DZD"')

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
