import UIKit
import Capacitor
import Firebase
import CapacitorBackgroundRunner
import AudioToolbox
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    var window: UIWindow?
    
    // Store for badge count
    private let defaults = UserDefaults(suiteName: "com.your.app.bundle")!
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        FirebaseApp.configure()
        UNUserNotificationCenter.current().delegate = self
        BackgroundRunnerPlugin.registerBackgroundTask()
        BackgroundRunnerPlugin.handleApplicationDidFinishLaunching(launchOptions: launchOptions)
        
        // Request notification authorization
        requestNotificationAuthorization()
        
        return true
    }
    
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
//        playDefaultNotificationSound()
        Messaging.messaging().apnsToken = deviceToken
        Messaging.messaging().token(completion: { (token, error) in
            if let error = error {
                NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
            } else if let token = token {
                NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: token)
            }
        })
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any]) {
        playDefaultNotificationSound()
        updateBadgeCount()
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        print("Received remote notification: \(userInfo)")
        playDefaultNotificationSound()
        updateBadgeCount()
        
        completionHandler(.newData)
    }

    private func playDefaultNotificationSound() {
        let systemSoundID: SystemSoundID = 1007
        AudioServicesPlaySystemSound(systemSoundID)
    }

    private func updateBadgeCount() {
        let currentCount = defaults.integer(forKey: "badgeCount")
        let newCount = currentCount + 1
        
        // Update UserDefaults
        defaults.set(newCount, forKey: "badgeCount")
        defaults.synchronize()
        
        // Set the application badge number
        UIApplication.shared.applicationIconBadgeNumber = newCount
    }
    
    private func requestNotificationAuthorization() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            guard granted else {
                print("User denied notification authorization")
                return
            }
            
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        // Reset badge count to 0 when app enters foreground
        defaults.set(0, forKey: "badgeCount")
        defaults.synchronize()
        UIApplication.shared.applicationIconBadgeNumber = 0
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}

