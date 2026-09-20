"""Verify the exact completed build before publishing it; never rebuild or sign."""
import hashlib
import pathlib
import plistlib
import shutil
import struct
import zipfile

expected = "979670860b0335f59cb606398b65adb5ca289468444fa58bf00968c467aec9ac"
candidates = list(pathlib.Path("downloaded").rglob("*.ipa"))
if len(candidates) != 1:
    raise RuntimeError("Expected exactly one source IPA")
source = candidates[0]
if source.stat().st_size != 14960552:
    raise RuntimeError("Unexpected IPA size")
digest = hashlib.sha256(source.read_bytes()).hexdigest()
if digest != expected:
    raise RuntimeError("IPA SHA-256 mismatch")
with zipfile.ZipFile(source) as archive:
    if archive.testzip() is not None:
        raise RuntimeError("IPA ZIP CRC validation failed")
    prefix = "Payload/NaiwaRunner.app/"
    info = plistlib.loads(archive.read(prefix + "Info.plist"))
    if info.get("CFBundleDisplayName") != "奶娃快跑":
        raise RuntimeError("Unexpected application name")
    if "iPhoneOS" not in info.get("CFBundleSupportedPlatforms", []):
        raise RuntimeError("IPA is not an iPhoneOS build")
    binary = archive.read(prefix + "NaiwaRunner")
    magic, cpu = struct.unpack("<II", binary[:8])
    if magic != 0xFEEDFACF or cpu != 0x0100000C:
        raise RuntimeError("IPA does not contain an ARM64 Mach-O executable")
    for name in ["Web/index.html", "Web/models/models-data.js"]:
        archive.getinfo(prefix + name)
    if prefix + "embedded.mobileprovision" in archive.namelist():
        raise RuntimeError("Expected unsigned build")
output = pathlib.Path("release")
output.mkdir(exist_ok=True)
target = output / "NaiwaRunner-v1.0.0-unsigned.ipa"
shutil.copyfile(source, target)
(output / "SHA256SUMS.txt").write_text(digest + "  " + target.name + "\n", encoding="utf-8")
print("Verified iPhoneOS ARM64 app and copied exact original IPA:", target)
