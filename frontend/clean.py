import os
import re

PAGES_DIR = r"C:\Users\Suleman\Documents\TrendHawk-v2\frontend\src\pages"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'\(\)\s*=>\s*,', r'() => {} ,', content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {os.path.basename(filepath)}")

for filename in os.listdir(PAGES_DIR):
    if filename.endswith(".jsx"):
        fix_file(os.path.join(PAGES_DIR, filename))
