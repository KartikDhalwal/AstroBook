let pendingIntent = null;

export const setNotificationIntent = (data) => {
  pendingIntent = data;
};

export const getAndClearNotificationIntent = () => {
  const data = pendingIntent;
  pendingIntent = null;
  return data;
};
