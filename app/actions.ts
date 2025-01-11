'use server';

import webpush from 'web-push';
import { prisma } from './lib/prisma';
import { cookies } from 'next/headers';

webpush.setVapidDetails(
  'mailto:abdelrahman.elbasel42@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const getUserId = async (): Promise<null | number> => {
  const cookiesStore = await cookies();
  const cookieValue = cookiesStore.get('userId')?.value;
  if (!cookieValue) return null;
  const userId = parseInt(cookieValue);
  if (isNaN(userId)) return null;
  return userId;
};

// let subscription: webpush.PushSubscription | null = null;
async function addSubscription(sub: webpush.PushSubscription) {
  const userId = await getUserId();
  if (userId === null) return;

  await prisma.subscription.create({
    data: {
      user: { connect: { id: userId } },
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? 0,
      keys: {
        create: {
          user: { connect: { id: userId } },
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
    },
  });
}
export async function subscribeUser(sub: webpush.PushSubscription) {
  const userId = await getUserId();
  if (userId) return await addSubscription(sub);

  const newUser = await prisma.subscription.create({
    data: {
      user: { connect: { id: userId ?? -1 } },
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? 0,
      keys: {
        create: {
          user: { connect: { id: userId ?? 1 } },
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
    },
  });
  const cookieStore = await cookies();
  cookieStore.set('userId', newUser.id.toString());

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
          userId: userIdParsed,
        },
      });
      await prisma.subscription.delete({
        where: {
          userId: userIdParsed,
        },
      });
    }
  }
  // subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  // if (!subscription) {
  // throw new Error('No subscription available');
  // }

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
            title: 'New Message',
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
