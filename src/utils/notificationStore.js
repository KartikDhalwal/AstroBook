let pendingNotification = null;

export const setPendingNotification = (data) => {
  pendingNotification = data;
};

export const consumePendingNotification = () => {
  const data = pendingNotification;
  pendingNotification = null;
  return data;
};
