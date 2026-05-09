import { useState } from 'react';
import {
  requestPermission,
  sendSubscriptionToServer,
  subscribeUser
} from './utils/push';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [status, setStatus] = useState<string>(
    'Enable notifications to receive a daily quote at 07:00.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const handleEnableNotifications = async () => {
    setIsLoading(true);

    try {
      const permission = await requestPermission();

      if (permission !== 'granted') {
        setStatus(
          'Notification permission was denied. You can enable it later in your browser settings.'
        );
        return;
      }

      const subscription = await subscribeUser();
      await sendSubscriptionToServer(subscription, API_BASE_URL);
      setStatus('Daily motivation is enabled. Your morning quote will arrive at 07:00.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to enable notifications right now.';

      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/notify/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || 'Unable to send a test notification.');
      }

      setStatus('Test notification sent. Check your browser for the push message.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send a test notification.';

      setStatus(message);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Daily Cheer</p>
        <h1>Start every morning with a little momentum.</h1>
        <p className="description">
          Install the app, opt in to push notifications, and we&apos;ll deliver a quote to brighten
          your day even when the app is closed.
        </p>
        <button
          type="button"
          className="primary-button"
          onClick={handleEnableNotifications}
          disabled={isLoading}
        >
          {isLoading ? 'Setting Things Up...' : 'Enable Daily Motivation'}
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={handleSendTestNotification}
          disabled={isSendingTest}
        >
          {isSendingTest ? 'Sending Test...' : 'Send Test Notification'}
        </button>
        <p className="status">{status}</p>
      </section>
    </main>
  );
}

export default App;
