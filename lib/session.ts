let currentUser = {
  fullName: 'Ange', // Default name shown in screenshot
  username: 'ange',
  email: 'user@zikiii.com',
};

export const getSessionUser = () => currentUser;

export const setSessionUser = (user: { fullName: string; username?: string; email?: string }) => {
  currentUser = {
    ...currentUser,
    ...user,
  };
};
