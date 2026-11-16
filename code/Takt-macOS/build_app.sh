#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v swiftc >/dev/null 2>&1; then
  echo "Ошибка: не найден компилятор swiftc."
  echo "Установите инструменты разработчика Apple командой: xcode-select --install"
  exit 1
fi

APP_NAME="Takt"
BUILD_DIR="./build"
APP_BUNDLE="$BUILD_DIR/$APP_NAME.app"
CONTENTS="$APP_BUNDLE/Contents"
MACOS_DIR="$CONTENTS/MacOS"
RESOURCES_DIR="$CONTENTS/Resources"
ICONSET="$BUILD_DIR/AppIcon.iconset"
ARCH="$(uname -m)"

echo "1/4 Подготовка структуры $APP_NAME.app ($ARCH)..."
rm -rf "$APP_BUNDLE" "$ICONSET"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR" "$ICONSET"

echo "2/4 Генерация минималистичной иконки для macOS..."
cat << 'EOF' > "$BUILD_DIR/make_icon.swift"
import AppKit

func renderIcon(size: Int, to path: String) {
    let s = CGFloat(size)
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: size,
        pixelsHigh: size,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)

    let rect = NSRect(x: 0, y: 0, width: s, height: s)
    let inset = s * 0.08
    let cardRect = rect.insetBy(dx: inset, dy: inset)
    let pathBg = NSBezierPath(roundedRect: cardRect, xRadius: s * 0.22, yRadius: s * 0.22)

    NSColor(calibratedRed: 0.08, green: 0.09, blue: 0.11, alpha: 1.0).setFill()
    pathBg.fill()

    NSColor(calibratedWhite: 1.0, alpha: 0.12).setStroke()
    pathBg.lineWidth = max(1.0, s * 0.015)
    pathBg.stroke()

    let center = NSPoint(x: s / 2, y: s / 2)
    let radius = s * 0.26
    let lineWidth = s * 0.065

    let track = NSBezierPath()
    track.appendArc(withCenter: center, radius: radius, startAngle: 0, endAngle: 360)
    track.lineWidth = lineWidth
    NSColor(calibratedWhite: 1.0, alpha: 0.12).setStroke()
    track.stroke()

    let arc = NSBezierPath()
    arc.appendArc(withCenter: center, radius: radius, startAngle: 90, endAngle: -195, clockwise: true)
    arc.lineWidth = lineWidth
    arc.lineCapStyle = .round
    NSColor(calibratedRed: 0.19, green: 0.82, blue: 0.35, alpha: 1.0).setStroke()
    arc.stroke()

    let dropSize = s * 0.12
    let dotRect = NSRect(x: center.x - dropSize / 2, y: center.y - dropSize / 2, width: dropSize, height: dropSize)
    let dot = NSBezierPath(ovalIn: dotRect)
    NSColor(calibratedRed: 0.04, green: 0.52, blue: 1.0, alpha: 1.0).setFill()
    dot.fill()

    NSGraphicsContext.restoreGraphicsState()
    if let data = rep.representation(using: .png, properties: [:]) {
        try? data.write(to: URL(fileURLWithPath: path))
    }
}

let dir = CommandLine.arguments[1]
let sizes = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024),
]
for (name, px) in sizes {
    renderIcon(size: px, to: "\(dir)/\(name)")
}
EOF

swift "$BUILD_DIR/make_icon.swift" "$ICONSET"
iconutil -c icns "$ICONSET" -o "$RESOURCES_DIR/AppIcon.icns"
rm -rf "$ICONSET" "$BUILD_DIR/make_icon.swift"

echo "3/4 Компиляция нативного Swift-бинарника (минимальное потребление ОЗУ)..."
swiftc -O -whole-module-optimization \
  -target "${ARCH}-apple-macosx13.0" \
  -framework AppKit \
  -framework SwiftUI \
  -framework IOKit \
  -framework CoreGraphics \
  -framework UserNotifications \
  NotificationManager.swift \
  BatteryMonitor.swift \
  ActivityTracker.swift \
  TaktApp.swift \
  -o "$MACOS_DIR/$APP_NAME"

cp Info.plist "$CONTENTS/Info.plist"
codesign --force --deep --sign - --entitlements Takt.entitlements "$APP_BUNDLE" 2>/dev/null || true

echo "4/4 Готово! Приложение собрано: $APP_BUNDLE"
echo "Установка в /Applications..."
rm -rf "/Applications/$APP_NAME.app"
cp -R "$APP_BUNDLE" "/Applications/$APP_NAME.app"
echo "Готово! Запускаю Takt..."
open "/Applications/$APP_NAME.app"
