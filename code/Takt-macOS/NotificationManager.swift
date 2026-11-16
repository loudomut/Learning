import Foundation
import UserNotifications

final class NotificationManager: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationManager()
    private var isAuthorized = false

    private override init() {
        super.init()
    }

    func configure() {
        guard Bundle.main.bundleIdentifier != nil else { return }
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        center.requestAuthorization(options: [.alert, .sound, .badge]) { [weak self] granted, _ in
            self?.isAuthorized = granted
        }
    }

    func send(id: String, title: String, body: String) {
        if Bundle.main.bundleIdentifier != nil {
            let content = UNUserNotificationCenter.current()
            let note = UNMutableNotificationContent()
            note.title = title
            note.body = body
            note.sound = .default

            let request = UNNotificationRequest(
                identifier: id,
                content: note,
                trigger: nil
            )
            content.add(request, withCompletionHandler: nil)
        } else {
            sendAppleScriptFallback(title: title, body: body)
        }
    }

    private func sendAppleScriptFallback(title: String, body: String) {
        let escapedTitle = title.replacingOccurrences(of: "\"", with: "\\\"")
        let escapedBody = body.replacingOccurrences(of: "\"", with: "\\\"")
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
        process.arguments = ["-e", "display notification \"\(escapedBody)\" with title \"\(escapedTitle)\""]
        try? process.run()
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
