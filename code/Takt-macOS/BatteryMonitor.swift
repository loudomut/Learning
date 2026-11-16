import Foundation
import IOKit
import IOKit.ps

enum DeviceKind: String {
    case mac
    case airpods
    case airpodsCase
    case peripheral

    var sfSymbol: String {
        switch self {
        case .mac: return "laptopcomputer"
        case .airpods: return "airpodspro"
        case .airpodsCase: return "airpodspro.chargingcase.wireless"
        case .peripheral: return "keyboard"
        }
    }
}

struct BatteryDevice: Identifiable, Equatable {
    let id: String
    let name: String
    let kind: DeviceKind
    let level: Int
    let isCharging: Bool
}

final class BatteryMonitor: ObservableObject {
    @Published private(set) var devices: [BatteryDevice] = []
    @Published var lowBatteryThreshold: Int {
        didSet { UserDefaults.standard.set(lowBatteryThreshold, forKey: "lowBatteryThreshold") }
    }

    private var timer: Timer?
    private var notifiedDeviceCooldown: [String: Date] = [:]
    private let workQueue = DispatchQueue(label: "local.takt.battery", qos: .utility)

    init() {
        let saved = UserDefaults.standard.integer(forKey: "lowBatteryThreshold")
        self.lowBatteryThreshold = saved > 0 ? saved : 20
    }

    func start() {
        refresh()
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            self?.refresh()
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    func refresh() {
        workQueue.async { [weak self] in
            autoreleasepool {
                guard let self else { return }
                var collected: [BatteryDevice] = []
                collected.append(contentsOf: self.readInternalPowerSources())
                collected.append(contentsOf: self.readBluetoothDevices())

                DispatchQueue.main.async {
                    self.devices = collected
                    self.evaluateThresholds(for: collected)
                }
            }
        }
    }

    private func readInternalPowerSources() -> [BatteryDevice] {
        guard let blob = IOPSCopyPowerSourcesInfo()?.takeRetainedValue(),
              let list = IOPSCopyPowerSourcesList(blob)?.takeRetainedValue() as? [CFTypeRef]
        else { return [] }

        var result: [BatteryDevice] = []
        for source in list {
            guard let info = IOPSGetPowerSourceDescription(blob, source)?.takeUnretainedValue() as? [String: Any],
                  let current = info[kIOPSCurrentCapacityKey] as? Int,
                  let maxCap = info[kIOPSMaxCapacityKey] as? Int,
                  maxCap > 0
            else { continue }

            let name = (info[kIOPSNameKey] as? String) ?? Host.current().localizedName ?? "Mac"
            let cleanName = name == "InternalBattery-0" ? (Host.current().localizedName ?? "MacBook") : name
            let charging = (info[kIOPSIsChargingKey] as? Bool) ?? false
            let percent = Swift.max(0, Swift.min(100, Int((Double(current) / Double(maxCap)) * 100.0)))

            result.append(BatteryDevice(
                id: "internal-\(cleanName)",
                name: cleanName,
                kind: .mac,
                level: percent,
                isCharging: charging
            ))
        }
        return result
    }

    private func readBluetoothDevices() -> [BatteryDevice] {
        var found: [BatteryDevice] = []
        var seenIds = Set<String>()

        // 1. Быстрое чтение HID-устройств напрямую через IOKit (клавиатуры, мыши, трекпады)
        if let matching = IOServiceMatching("AppleDeviceManagementHIDEventService") {
            var iterator: io_iterator_t = 0
            if IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iterator) == KERN_SUCCESS {
                defer { IOObjectRelease(iterator) }
                var entry = IOIteratorNext(iterator)
                while entry != 0 {
                    var propsRef: Unmanaged<CFMutableDictionary>?
                    if IORegistryEntryCreateCFProperties(entry, &propsRef, kCFAllocatorDefault, 0) == KERN_SUCCESS,
                       let props = propsRef?.takeRetainedValue() as? [String: Any],
                       let percent = props["BatteryPercent"] as? Int {
                        let name = (props["Product"] as? String) ?? "Bluetooth Accessory"
                        let id = "hid-\(name)"
                        if !seenIds.contains(id) {
                            seenIds.insert(id)
                            found.append(BatteryDevice(
                                id: id,
                                name: name,
                                kind: name.lowercased().contains("airpods") ? .airpods : .peripheral,
                                level: percent,
                                isCharging: false
                            ))
                        }
                    }
                    IOObjectRelease(entry)
                    entry = IOIteratorNext(iterator)
                }
            }
        }

        // 2. Чтение AirPods и зарядного кейса через локальный system_profiler SPBluetoothDataType
        let btDevices = readSystemProfilerBluetooth()
        for dev in btDevices where !seenIds.contains(dev.id) {
            seenIds.insert(dev.id)
            found.append(dev)
        }

        return found
    }

    private func readSystemProfilerBluetooth() -> [BatteryDevice] {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/sbin/system_profiler")
        process.arguments = ["SPBluetoothDataType", "-json"]

        let pipe = Pipe()
        process.standardOutput = pipe
        process.standardError = FileHandle.nullDevice

        do {
            try process.run()
        } catch {
            return []
        }

        let data = pipe.fileHandleForReading.readDataToEndOfFile()
        process.waitUntilExit()

        guard let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let btArray = json["SPBluetoothDataType"] as? [[String: Any]]
        else { return [] }

        var devices: [BatteryDevice] = []

        for section in btArray {
            guard let connected = section["device_connected"] as? [[String: [String: Any]]] else { continue }
            for entry in connected {
                for (name, attrs) in entry {
                    if let casePct = parsePercent(attrs["device_batteryLevelCase"]) {
                        devices.append(BatteryDevice(
                            id: "bt-\(name)-case",
                            name: "\(name) Case",
                            kind: .airpodsCase,
                            level: casePct,
                            isCharging: false
                        ))
                    }

                    let leftPct = parsePercent(attrs["device_batteryLevelLeft"])
                    let rightPct = parsePercent(attrs["device_batteryLevelRight"])
                    let mainPct = parsePercent(attrs["device_batteryLevelMain"])

                    if let l = leftPct, let r = rightPct {
                        devices.append(BatteryDevice(
                            id: "bt-\(name)-buds",
                            name: name,
                            kind: .airpods,
                            level: Swift.min(l, r),
                            isCharging: false
                        ))
                    } else if let m = mainPct {
                        let isAirPods = name.lowercased().contains("airpods")
                        devices.append(BatteryDevice(
                            id: "bt-\(name)-main",
                            name: name,
                            kind: isAirPods ? .airpods : .peripheral,
                            level: m,
                            isCharging: false
                        ))
                    }
                }
            }
        }
        return devices
    }

    private func parsePercent(_ value: Any?) -> Int? {
        if let intVal = value as? Int { return intVal }
        if let strVal = value as? String {
            let digits = strVal.filter(\.isNumber)
            return Int(digits)
        }
        return nil
    }

    private func evaluateThresholds(for list: [BatteryDevice]) {
        let now = Date()
        for device in list {
            if device.isCharging || device.level > lowBatteryThreshold + 5 {
                notifiedDeviceCooldown.removeValue(forKey: device.id)
                continue
            }

            if device.level <= lowBatteryThreshold {
                if let lastAlert = notifiedDeviceCooldown[device.id],
                   now.timeIntervalSince(lastAlert) < 3600 {
                    continue
                }
                notifiedDeviceCooldown[device.id] = now

                let body: String
                switch device.kind {
                case .airpodsCase:
                    body = "Кейс от \(device.name.replacingOccurrences(of: " Case", with: "")) почти разрядился (\(device.level)%). Пора поставить на зарядку."
                case .airpods:
                    body = "\(device.name) почти разрядились (\(device.level)%)."
                case .mac:
                    body = "\(device.name): осталось \(device.level)% заряда. Подключите питание."
                case .peripheral:
                    body = "\(device.name): низкий заряд (\(device.level)%)."
                }

                NotificationManager.shared.send(
                    id: "battery-\(device.id)",
                    title: "Низкий заряд устройства",
                    body: body
                )
            }
        }
    }
}
