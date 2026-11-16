import SwiftUI
import AppKit

@main
struct TaktApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup("Takt") {
            ContentView(
                batteries: appDelegate.batteryMonitor,
                activity: appDelegate.activityTracker
            )
            .frame(width: 360)
            .fixedSize()
        }
        .windowResizability(.contentSize)
        .windowStyle(.hiddenTitleBar)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    let batteryMonitor = BatteryMonitor()
    let activityTracker = ActivityTracker()

    private var statusItem: NSStatusItem?
    private let popover = NSPopover()

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Приложение отображается и среди приложений в Dock/Launchpad, и в строке меню
        NSApp.setActivationPolicy(.regular)

        NotificationManager.shared.configure()
        batteryMonitor.start()
        activityTracker.start()

        setupMenuBar()
    }

    func applicationWillTerminate(_ notification: Notification) {
        batteryMonitor.stop()
        activityTracker.stop()
    }

    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
        if !flag {
            NSApp.windows.first?.makeKeyAndOrderFront(nil)
        }
        return true
    }

    private func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem?.button {
            if let img = NSImage(systemSymbolName: "battery.100", accessibilityDescription: "Takt") {
                img.isTemplate = true
                button.image = img
            } else {
                button.title = "Takt"
            }
            button.action = #selector(togglePopover(_:))
            button.target = self
        }

        popover.behavior = .transient
        popover.contentSize = NSSize(width: 340, height: 420)
        popover.contentViewController = NSHostingController(
            rootView: ContentView(batteries: batteryMonitor, activity: activityTracker)
        )
    }

    @objc private func togglePopover(_ sender: AnyObject?) {
        guard let button = statusItem?.button else { return }
        if popover.isShown {
            popover.performClose(sender)
        } else {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
        }
    }
}

struct ContentView: View {
    @ObservedObject var batteries: BatteryMonitor
    @ObservedObject var activity: ActivityTracker
    @State private var showSettings = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("Takt")
                    .font(.system(size: 14, weight: .semibold))
                Spacer()
                Button(action: { batteries.refresh() }) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 12))
                }
                .buttonStyle(.plain)
                .help("Обновить заряды")

                Button(action: { showSettings.toggle() }) {
                    Image(systemName: showSettings ? "checkmark" : "slider.horizontal.3")
                        .font(.system(size: 12))
                }
                .buttonStyle(.plain)
                .padding(.leading, 8)
                .help("Настройки")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)

            Divider().opacity(0.25)

            if showSettings {
                settingsView
            } else {
                dashboardView
            }
        }
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private var dashboardView: some View {
        VStack(alignment: .leading, spacing: 0) {
            if batteries.devices.isEmpty {
                Text("Поиск подключённых устройств...")
                    .font(.system(size: 12))
                    .foregroundColor(.secondary)
                    .padding(16)
            } else {
                ForEach(Array(batteries.devices.enumerated()), id: \.element.id) { index, device in
                    HStack(spacing: 12) {
                        Image(systemName: symbolName(for: device.kind))
                            .font(.system(size: 15))
                            .frame(width: 22)
                            .foregroundColor(.primary)

                        Text(device.name)
                            .font(.system(size: 13))
                            .lineLimit(1)

                        Spacer()

                        Text("\(device.level)%")
                            .font(.system(size: 13, design: .monospaced))
                            .foregroundColor(.secondary)

                        BatteryGlyph(level: device.level, isCharging: device.isCharging, threshold: batteries.lowBatteryThreshold)
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 10)

                    if index < batteries.devices.count - 1 {
                        Divider().opacity(0.2).padding(.leading, 50)
                    }
                }
            }

            Divider().opacity(0.25)

            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("За ПК непрерывно")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(formatDuration(activity.continuousSittingSeconds))
                        .font(.system(size: 13, weight: .medium, design: .monospaced))
                }

                HStack {
                    Text("Всего сегодня")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    Spacer()
                    Text(formatDuration(activity.dailyWorkSeconds))
                        .font(.system(size: 13, weight: .medium, design: .monospaced))
                }

                HStack {
                    Text("До воды")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                    Spacer()
                    let remaining = max(0, activity.waterIntervalHours * 3600 - activity.waterSeconds)
                    Text(formatDuration(remaining))
                        .font(.system(size: 13, weight: .medium, design: .monospaced))
                }

                HStack(spacing: 8) {
                    Button("Размялся") {
                        activity.markStretchDone()
                    }
                    .controlSize(.small)

                    Button("Выпил воды") {
                        activity.markWaterDrunk()
                    }
                    .controlSize(.small)

                    Spacer()

                    Button("Выход") {
                        NSApp.terminate(nil)
                    }
                    .controlSize(.small)
                }
                .padding(.top, 4)
            }
            .padding(16)
        }
    }

    private var settingsView: some View {
        VStack(alignment: .leading, spacing: 12) {
            Stepper("Порог заряда: \(batteries.lowBatteryThreshold)%", value: $batteries.lowBatteryThreshold, in: 5...50, step: 5)
                .font(.system(size: 12))
            Stepper("Разминка каждые: \(activity.sittingLimitMinutes) мин", value: $activity.sittingLimitMinutes, in: 15...120, step: 5)
                .font(.system(size: 12))
            Stepper("Лимит работы: \(activity.dailyWorkLimitHours) ч", value: $activity.dailyWorkLimitHours, in: 1...12, step: 1)
                .font(.system(size: 12))
            Stepper("Вода каждые: \(activity.waterIntervalHours) ч", value: $activity.waterIntervalHours, in: 1...8, step: 1)
                .font(.system(size: 12))
            Stepper("Сброс паузы: \(activity.idleResetMinutes) мин", value: $activity.idleResetMinutes, in: 2...15, step: 1)
                .font(.system(size: 12))
        }
        .padding(16)
    }

    private func symbolName(for kind: DeviceKind) -> String {
        let preferred = kind.sfSymbol
        if NSImage(systemSymbolName: preferred, accessibilityDescription: nil) != nil {
            return preferred
        }
        switch kind {
        case .mac: return "laptopcomputer"
        case .airpods: return "headphones"
        case .airpodsCase: return "case"
        case .peripheral: return "keyboard"
        }
    }

    private func formatDuration(_ seconds: Int) -> String {
        let h = seconds / 3600
        let m = (seconds % 3600) / 60
        let s = seconds % 60
        return h > 0 ? String(format: "%dч %02dм", h, m) : String(format: "%02d:%02d", m, s)
    }
}

struct BatteryGlyph: View {
    let level: Int
    let isCharging: Bool
    let threshold: Int

    var fillColor: Color {
        if isCharging { return .green }
        if level <= 10 { return .red }
        if level <= threshold { return .orange }
        return .green
    }

    var body: some View {
        ZStack(alignment: .leading) {
            RoundedRectangle(cornerRadius: 3)
                .stroke(Color.secondary.opacity(0.6), lineWidth: 1)
                .frame(width: 24, height: 12)
            RoundedRectangle(cornerRadius: 1.5)
                .fill(fillColor)
                .frame(width: max(2, CGFloat(level) / 100.0 * 20.0), height: 8)
                .padding(.leading, 2)
        }
    }
}
