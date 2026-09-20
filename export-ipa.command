#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
MODE="${1:---unsigned}"
if [[ "$MODE" != "--unsigned" && "$MODE" != "--signed" ]]; then
  echo "Usage: bash export-ipa.command --unsigned"
  echo "   or: TEAM_ID=YOUR_TEAM BUNDLE_ID=your.app.id bash export-ipa.command --signed /path/ExportOptions.plist"
  exit 2
fi
if [[ "$(uname -s)" != "Darwin" ]] || ! xcrun --find xcodebuild >/dev/null 2>&1; then
  echo "Requires a Mac with full Xcode and the iOS SDK. No IPA was created."
  exit 1
fi
if ! xcodebuild -showsdks | grep -q iphoneos; then
  echo "The selected Xcode has no iPhoneOS SDK. No IPA was created."
  exit 1
fi
EXPORT_OPTIONS="${2:-}"
if [[ "$MODE" == "--signed" ]]; then
  : "${TEAM_ID:?Set TEAM_ID to your Apple development team}"
  : "${BUNDLE_ID:?Set BUNDLE_ID to your registered app identifier}"
  if [[ ! -f "$EXPORT_OPTIONS" ]]; then
    echo "Pass your Xcode-generated ExportOptions.plist as the second argument."
    exit 2
  fi
  DESTINATION=$(/usr/libexec/PlistBuddy -c "Print :destination" "$EXPORT_OPTIONS" 2>/dev/null || true)
  if [[ "$DESTINATION" == "upload" ]]; then
    echo "This script only exports locally. Use an ExportOptions.plist with destination=export."
    exit 2
  fi
fi
mkdir -p "$ROOT/build"
WORK="$(mktemp -d "$ROOT/build/ipa-export.XXXXXX")"
COMMON=(-project "$ROOT/NaiwaRunner.xcodeproj" -scheme NaiwaRunner -configuration Release -destination "generic/platform=iOS")
if [[ "$MODE" == "--unsigned" ]]; then
  xcodebuild "${COMMON[@]}" -derivedDataPath "$WORK/DerivedData" build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
  APP="$WORK/DerivedData/Build/Products/Release-iphoneos/NaiwaRunner.app"
  test -x "$APP/NaiwaRunner"
  mkdir -p "$WORK/staging/Payload"
  ditto "$APP" "$WORK/staging/Payload/NaiwaRunner.app"
  OUTPUT="$WORK/NaiwaRunner-unsigned.ipa"
  ditto -c -k --keepParent "$WORK/staging/Payload" "$OUTPUT"
  unzip -t "$OUTPUT"
  echo "Created: $OUTPUT"
  echo "UNSIGNED: requires signing before normal iPhone installation."
else
  xcodebuild "${COMMON[@]}" -archivePath "$WORK/NaiwaRunner.xcarchive" archive DEVELOPMENT_TEAM="$TEAM_ID" PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID"
  xcodebuild -exportArchive -archivePath "$WORK/NaiwaRunner.xcarchive" -exportOptionsPlist "$EXPORT_OPTIONS" -exportPath "$WORK/signed"
  shopt -s nullglob
  IPAS=("$WORK/signed/"*.ipa)
  if [[ ${#IPAS[@]} -eq 0 ]]; then echo "Export finished without an IPA."; exit 1; fi
  for IPA in "${IPAS[@]}"; do unzip -t "$IPA"; echo "Created: $IPA"; done
fi
