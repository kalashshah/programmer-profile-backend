/**
 * Function to create a notification message for when a user starts following.
 * @param {string} name - The name of the user who started following.
 * @returns Returns a string containing the notification message.
 */
export const followingNotification = (name: string) => {
  return `${name} started following you, do you want to follow back?`;
};
