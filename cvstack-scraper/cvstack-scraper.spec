# playwright_app.spec
import os
from PyInstaller.utils.hooks import collect_submodules
from PyInstaller.building.build_main import Tree

# Path to Chromium (adjust version as needed)
chromium_src = os.path.expanduser("~/Library/Caches/ms-playwright/chromium-1187")  
chromium_dst = "chromium"  # will be copied to dist/chromium

block_cipher = None

a = Analysis(
    ['cvstack-scraper.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=collect_submodules('playwright'),
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='cvstack-scraper',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas + Tree('./chromium', prefix="chromium"),
    strip=False,
    upx=True,
    upx_exclude=[],
    name='cvstack-scraper'
)
