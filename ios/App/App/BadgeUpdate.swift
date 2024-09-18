// BadgeUpdatePlugin.swift
import Foundation
import Capacitor

@objc(BadgeUpdatePlugin)
public class BadgeUpdatePlugin: CAPPlugin {
    @objc func incrementBadgeCount(_ callback: @escaping (Bool) -> Void) {
        DispatchQueue.main.async {
            UIApplication.shared.applicationIconBadgeNumber += 1
            callback(true)
        }
    }
    
    @objc func echo(_ value: String) -> String {
        return value
    }
}
