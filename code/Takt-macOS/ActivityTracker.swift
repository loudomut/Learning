import Foundation
import CoreGraphics

final class ActivityTracker: ObservableObject {
    @Published private(set) var continuousSittingSeconds: Int = 0
    @Published private(set) var dailyWorkSeconds: Int = 0
    @Published private(set) var waterSeconds: Int = 0
    @Published private(set) var isUserIdle: Bool = false

    @Published var sittingLimitMinutes: Int {
        didSet { UserDefaults.standard.set(sittingLimitMinutes, forKey: "sittingLimitMinutes") }
    }
    @Published var dailyWorkLimitHours: Int {
        didSet { UserDefaults.standard.set(dailyWorkLimitHours, forKey: "dailyWorkLimitHours") }
    }
    @Published var waterIntervalHours: Int {
        didSet { UserDefaults.standard.set(waterIntervalHours, forKey: "waterIntervalHours") }
    }
    @Published var idleResetMinutes: Int {
        didSet { UserDefaults.standard.set(idleResetMinutes, forKey: "idleResetMinutes") }
    }

    private var timer: Timer?
    private let tickInterval: Int = 15
    private var lastSittingAlertSecond: Int = 0
    private var lastDailyHourAlerted: Int = 0
    private var savedDayKey: String = ""

    init() {
        let defaults = UserDefaults.standard
        let sit = defaults.integer(forKey: "sittingLimitMinutes")
        let work = defaults.integer(forKey: "dailyWorkLimitHours")
        let water = defaults.integer(forKey: "waterIntervalHours")
        let idle = defaults.integer(forKey: "idleResetMinutes")

        self.sittingLimitMinutes = sit > 0 ? sit : 40
        self.dailyWorkLimitHours = work > 0 ? work : 5
        self.waterIntervalHours = water > 0 ? water : 3
        self.idleResetMinutes = idle > 0 ? idle : 5

        restoreDailyState()
    }

    func start() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: TimeInterval(tickInterval), repeats: true) { [weak self] _ in
            self?.tick()
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    func markStretchDone() {
        continuousSittingSeconds = 0
        lastSittingAlertSecond = 0
    }

    func markWaterDrunk() {
        waterSeconds = 0
    }

    private func tick() {
        ensureSameDay()

        // CGEventSource.secondsSinceLastEventType не требует прав Accessibility и не читает нажатия клавиш
        let anyEvent = CGEventType(rawValue: ~0)!
        let idleSeconds = CGEventSource.secondsSinceLastEventType(.hidSystemState, eventType: anyEvent)

        if idleSeconds >= Double(idleResetMinutes * 60) {
            isUserIdle = true
            continuousSittingSeconds = 0
            lastSittingAlertSecond = 0
            return
        }

        isUserIdle = false
        continuousSittingSeconds += tickInterval
        dailyWorkSeconds += tickInterval
        waterSeconds += tickInterval

        persistDailyState()
        checkReminders()
    }

    private func checkReminders() {
        let sitThreshold = sittingLimitMinutes * 60
        if continuousSittingSeconds >= sitThreshold,
           continuousSittingSeconds - lastSittingAlertSecond >= sitThreshold {
            lastSittingAlertSecond = continuousSittingSeconds
            NotificationManager.shared.send(
                id: "takt-stretch-\(Date().timeIntervalSince1970)",
                title: "Пора размяться",
                body: "Вы сидите более \(sittingLimitMinutes) минут, пора сделать пару приседаний."
            )
        }

        let currentHour = dailyWorkSeconds / 3600
        if currentHour >= dailyWorkLimitHours && currentHour > lastDailyHourAlerted {
            lastDailyHourAlerted = currentHour
            NotificationManager.shared.send(
                id: "takt-work-\(currentHour)",
                title: "Длительная работа за Mac",
                body: "Вы за работой уже \(currentHour) ч. — нужно размяться и дать глазам отдохнуть."
            )
        }

        let waterLimit = waterIntervalHours * 3600
        if waterSeconds >= waterLimit {
            waterSeconds = 0
            NotificationManager.shared.send(
                id: "takt-water-\(Date().timeIntervalSince1970)",
                title: "Takt",
                body: "Попить воды"
            )
        }
    }

    private func todayKey() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }

    private func ensureSameDay() {
        let current = todayKey()
        if current != savedDayKey {
            savedDayKey = current
            dailyWorkSeconds = 0
            lastDailyHourAlerted = 0
            persistDailyState()
        }
    }

    private func restoreDailyState() {
        let defaults = UserDefaults.standard
        let current = todayKey()
        savedDayKey = defaults.string(forKey: "taktDayKey") ?? current
        if savedDayKey == current {
            dailyWorkSeconds = defaults.integer(forKey: "taktDailyWorkSeconds")
            lastDailyHourAlerted = defaults.integer(forKey: "taktLastDailyHourAlerted")
        } else {
            savedDayKey = current
            dailyWorkSeconds = 0
            lastDailyHourAlerted = 0
        }
    }

    private func persistDailyState() {
        let defaults = UserDefaults.standard
        defaults.set(savedDayKey, forKey: "taktDayKey")
        defaults.set(dailyWorkSeconds, forKey: "taktDailyWorkSeconds")
        defaults.set(lastDailyHourAlerted, forKey: "taktLastDailyHourAlerted")
    }
}
