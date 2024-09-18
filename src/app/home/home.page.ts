import { Component, OnInit } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { Badge } from '@capawesome/capacitor-badge';
import { App } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  fileContent: string | undefined;

  constructor() {}

  ngOnInit() {
    console.log('Initializing HomePage');

    // Check if badge functionality is supported
    this.isSupported();

    // Request permission to use push notifications
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        console.error('Push notification permission denied');
      }
    });

    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('Push registration success, token:', token.value);
      this.fileContent = token.value;
    });

    PushNotifications.addListener('registrationError', async (error: any) => {
      console.error('Error on registration:', JSON.stringify(error));
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received:', JSON.stringify(notification));
        this.handleNotification(notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push action performed:', JSON.stringify(notification));
        // Handle action performed
        this.handleNotification(notification.notification);
      }
    );

    // Listen for app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
       // this.clearBadge(); // Clear badge when the app becomes active
      } else {
        this.listenForBackgroundNotifications();
      }
    });

    // Listen for background notifications on app init
    this.listenForBackgroundNotifications();

    // Request permission and register local notifications
    this.registerLocalNotifications();
  }

  async notify() {
    try {
      // Get the current badge count from the app icon
      const { count } = await Badge.get();

      // Increment the badge count by 1
      const newCount = (count || 0) + 1;

      // Schedule the local notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Local Notification',
            body: 'This is a local notification triggered by the LocalNotify button!',
            id: Date.now(),
            schedule: { at: new Date(new Date().getTime() + 1000) }, // Schedule 1 second from now
            actionTypeId: '',
            extra: null,
          },
        ],
      });

      // Set the new badge count on the app icon
      await Badge.set({ count: 101 });
      console.log('Local notification scheduled with badge count set to:', newCount);
    } catch (error) {
      console.error('Error scheduling local notification with badge count:', error);
    }
  }

  async registerLocalNotifications() {
    try {
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === 'granted') {
        console.log('Local notifications permission granted');
      } else {
        console.error('Local notifications permission denied');
      }
    } catch (error) {
      console.error('Error requesting local notification permissions:', error);
    }
  }

  async handleNotification(notification: PushNotificationSchema) {
    try {
      if (notification.data && notification.data.badge) {
        const badgeCount = parseInt(notification.data.badge, 10);
        await Badge.set({ count: badgeCount });
        // console.log('Badge count set to:', badgeCount);
        this.decrease();
      } else {
        this.increase();
      }
    } catch (ex) {
      console.error('Error handling notification:', JSON.stringify(ex));
    }
  }

  async increase() {
    try {
      const { count } = await Badge.get();
      const newCount = (count || 0) + 1;
      await Badge.set({ count: newCount });
      console.log('Badge count increased to:', newCount);
    } catch (ex) {
      console.error('Error increasing badge count:', JSON.stringify(ex));
    }
  }

  async decrease() {
    try {
      const { count } = await Badge.get();
      const newCount = Math.max((count || 0) - 1, 0);
      await Badge.set({ count: newCount });
      console.log('Badge count decreased to:', newCount);
    } catch (ex) {
      console.error('Error decreasing badge count:', JSON.stringify(ex));
    }
  }

  async clearBadge() {
    try {
      await Badge.set({ count: 0 });
      console.log('Badge count cleared');
    } catch (ex) {
      console.error('Error clearing badge count:', JSON.stringify(ex));
    }
  }

  async isSupported() {
    try {
      const supported: any = await Badge.isSupported();
      if (!supported) {
        alert('Badge functionality is not supported on this device.');
      } else {
        console.log('Badge functionality is supported.');
      }
    } catch (ex) {
      console.error('Error checking badge support:', JSON.stringify(ex));
    }
  }

  listenForBackgroundNotifications() {
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received in background:', JSON.stringify(notification));
        this.handleNotification(notification);
      }
    );
  }
}
