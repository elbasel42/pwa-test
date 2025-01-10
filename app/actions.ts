'use server';

import webpush from 'web-push';
import { prisma } from './lib/prisma';

webpush.setVapidDetails(
  'mailto:abdelrahman.elbasel42@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: webpush.PushSubscription | null = null;

export async function subscribeUser(sub: webpush.PushSubscription) {
  subscription = sub;
  await prisma.subscription.create({
    data: {
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? 0,
      keys: {
        create: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
    },
  });
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available');
  }

  try {
    const subs = await prisma.subscription.findMany({
      include: {
        keys: true,
      },
    });
    subs.forEach(async (sub) => {
      if (sub.keys) {
        return await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            expirationTime: sub.expirationTime,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          JSON.stringify({
            title: 'Test Notification',
            body: message,
            icon: '/icon.png',
          })
        );
      }
    });
    // await webpush.sendNotification(
    //   subscription,
    //   JSON.stringify({
    //     title: 'Test Notification',
    //     body: message,
    //     icon: '/icon.png',
    //   })
    // );
    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}