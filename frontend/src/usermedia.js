const MICROPHONE_PERMISSION_GRANTED = "granted";
const MICROPHONE_PERMISSION_DENIED = "denied";

export const browserHasSupport = () => {
  try {
    return !! navigator.mediaDevices;
  } catch (e) {
    return false;
  }
}

export const isMicrophoneEnabled = () => {
  if (!browserHasSupport()) {
    return false;
  }

  // return (await navigator.permissions.query({name:'microphone'})) === MICROPHONE_PERMISSION_GRANTED;
  return true;
}

export const isMicrophoneBlocked = () => {
  if (!browserHasSupport()) {
    return true;
  }

  // return (await navigator.permissions.query({name:'microphone'})) === MICROPHONE_PERMISSION_GRANTED;
  return false;
}

export const requestPermissionToMicrophone = callback => {
  // Notification.requestPermission(permission => {
  //   callback(permission === NOTIFICATION_PERMISSION_GRANTED);
  // });
};
