const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications.');
  }

  return Notification.requestPermission();
}

export async function subscribeUser(): Promise<PushSubscription> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.');
  }

  if (!('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.');
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Missing VAPID public key in the client environment.');
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  return subscription;
}

export async function sendSubscriptionToServer(
  subscription: PushSubscription,
  apiBaseUrl: string
): Promise<{ message: string }> {
  const response = await fetch(`${apiBaseUrl}/api/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(subscription)
  });

  const payload = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to save subscription.');
  }

  return {
    message: payload.message || 'Subscription saved successfully.'
  };
}
