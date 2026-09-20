"""Validate a completed v2 unsigned IPA without rebuilding or signing it."""
import pathlib
import plistlib
import struct
import sys
import zipfile

source = pathlib.Path(sys.argv[1])
with zipfile.ZipFile(source) as archive:
    if archive.testzip() is not None:
        raise RuntimeError("IPA ZIP CRC validation failed")
    prefix = "Payload/NaiwaRunner.app/"
    info = plistlib.loads(archive.read(prefix + "Info.plist"))
    if info.get("CFBundleDisplayName") != "奶娃快跑":
        raise RuntimeError("Unexpected application name")
    if info.get("CFBundleShortVersionString") != "2.0":
        raise RuntimeError("Unexpected application version")
    if "iPhoneOS" not in info.get("CFBundleSupportedPlatforms", []):
        raise RuntimeError("IPA is not an iPhoneOS build")
    binary = archive.read(prefix + "NaiwaRunner")
    magic, cpu = struct.unpack("<II", binary[:8])
    if magic != 0xFEEDFACF or cpu != 0x0100000C:
        raise RuntimeError("IPA does not contain an ARM64 Mach-O executable")
    required = [
        "Web/index.html", "Web/style.css", "Web/core.js", "Web/scene.js",
        "Web/app.js", "Web/models/three.min.js", "Web/models/models-data.js"
    ]
    for name in required:
        archive.getinfo(prefix + name)
    page = archive.read(prefix + "Web/index.html").decode("utf-8")
    if "奶娃快跑 v2" not in page or "scene.js" not in page or "app.js" not in page:
        raise RuntimeError("IPA does not contain the v2 web game")
    if prefix + "embedded.mobileprovision" in archive.namelist():
        raise RuntimeError("Expected unsigned build")
print(f"Verified unsigned iPhoneOS ARM64 IPA: {source} ({source.stat().st_size} bytes)")
