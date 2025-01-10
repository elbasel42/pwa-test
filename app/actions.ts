'use server';

import webpush from 'web-push';
import { prisma } from './lib/prisma';
import { cookies } from 'next/headers';

webpush.setVapidDetails(
  'mailto:abdelrahman.elbasel42@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: webpush.PushSubscription | null = null;

export async function subscribeUser(sub: webpush.PushSubscription) {
  const userCookies = await cookies();
  const userIdCookie = userCookies.get('userId');
  const userId = userIdCookie?.value;
  if (userId) {
    const usedIdParsed = parseInt(userId);

    if (userId) {
      await prisma.subscription.create({
        data: {
          userId: usedIdParsed,
          endpoint: sub.endpoint,
          expirationTime: sub.expirationTime ?? 0,
          keys: {
            create: {
              userId: usedIdParsed,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
        },
      });
      return;
    }

  subscription = sub;
  const user = await prisma.user.create({
    data: {
      email: '',
      name: '',
      subscription: {
        create: {
          endpoint: sub.endpoint,
          expirationTime: sub.expirationTime ?? 0,
          keys: {
            create: {
              userId: usedIdParsed,
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
        },
      },
    },
  });
  userCookies.set('userId', '' + user.id);
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  const userCookies = await cookies();
  const userId = userCookies.get('userId');
  if (userId && typeof userId === 'string') {
    const id = parseInt(userId);
    if (isNaN(id)) {
      console.error('Invalid user id:', userId);
      return { success: false, error: 'Invalid user id' };
    }
    const user = await prisma.user.findFirst({
      where: {
        id: id,
      },
      include: {
        subscription: {
          select: { id: true },
        },
      },
    });
    if (!user) {
      console.error('User not found:', id);
    }
    if (user?.subscription) {
      const userIdParsed = parseInt(userId);
      await prisma.keys.delete({
        where: {
          userId: userIdParsed
        }
      })
      await prisma.subscription.delete({
        where: {
            userId: userIdParsed
        }
      })
    }
  }
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
