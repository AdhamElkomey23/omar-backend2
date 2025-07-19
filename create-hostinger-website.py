#!/usr/bin/env python3

import os
import shutil
import zipfile
from pathlib import Path

def create_hostinger_website():
    print("🚀 Converting to Hostinger-ready website...")
    
    # Create website directory
    website_dir = Path("hostinger-website")
    website_dir.mkdir(exist_ok=True)
    
    # Copy built files from dist/public
    if Path("dist/public").exists():
        print("📁 Copying built website files...")
        for item in Path("dist/public").iterdir():
            if item.is_file():
                shutil.copy2(item, website_dir)
            elif item.is_dir():
                shutil.copytree(item, website_dir / item.name, dirs_exist_ok=True)
    
    print("✅ Hostinger website created!")
    print("📁 Ready to upload: hostinger-website/ folder")
    print("🌐 Simply upload all files to your Hostinger public_html folder")

if __name__ == "__main__":
    create_hostinger_website()