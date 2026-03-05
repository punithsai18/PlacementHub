/**
 * Azure Notification Hubs service for sending push notifications.
 * Gracefully degrades if the service is not configured.
 */

const NOTIFICATION_HUB_CONNECTION = process.env.NOTIFICATION_HUB_CONNECTION_STRING;
const NOTIFICATION_HUB_NAME = process.env.NOTIFICATION_HUB_NAME;

/**
 * Send a notification to a specific user tag.
 *
 * @param {string} userId - Target user ID (used as tag).
 * @param {Object} notification - Notification payload.
 * @param {string} notification.title - Notification title.
 * @param {string} notification.body - Notification body.
 */
async function sendNotification(userId, notification) {
  if (!NOTIFICATION_HUB_CONNECTION || !NOTIFICATION_HUB_NAME) {
    console.warn('Azure Notification Hubs not configured. Notification not sent to user:', userId);
    return { sent: false, reason: 'Notification Hubs not configured' };
  }

  try {
    // Dynamically require to avoid errors when package is not installed
    const { NotificationHubsClient } = require('@azure/notification-hubs');
    const client = new NotificationHubsClient(NOTIFICATION_HUB_CONNECTION, NOTIFICATION_HUB_NAME);

    const result = await client.sendNotification(
      { kind: 'apple', body: JSON.stringify({ aps: { alert: { title: notification.title, body: notification.body } } }) },
      { tagExpression: `userId:${userId}` }
    );
    return { sent: true, result };
  } catch (err) {
    console.error('Notification send error:', err.message);
    return { sent: false, error: err.message };
  }
}

/**
 * Send an application status update notification to a student.
 *
 * @param {string} studentId - Target student ID.
 * @param {string} jobTitle - Job title.
 * @param {string} status - New application status.
 */
async function notifyApplicationUpdate(studentId, jobTitle, status) {
  return sendNotification(studentId, {
    title: 'PlacementHub - Application Update',
    body: `Your application for "${jobTitle}" has been updated to: ${status}`
  });
}

module.exports = { sendNotification, notifyApplicationUpdate };
