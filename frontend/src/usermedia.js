/* eslint-disable no-plusplus */
// eslint-disable-next-line import/no-extraneous-dependencies
import uuid from "uuid/v4";
import * as jquery from "./jitsi/jquery-2.1.1.min";
import JitsiMeetJS from "./jitsi/lib-jitsi-meet.min";

const onLocalTrackMuteChangedCallbacks = {};
const onJoinRoomCallbacks = {};
const onLeaveRoomCallbacks = {};

export const registerOnLocalTrackMuteChangedCallback = (id, callback) => {
  onLocalTrackMuteChangedCallbacks[id] = callback;
}
export const unregisterOnLocalTrackMuteChangedCallback = (id) => {
  delete onLocalTrackMuteChangedCallbacks[id];
}
export const registerOnJoinRoomCallback = (id, callback) => {
  onJoinRoomCallbacks[id] = callback;
}
export const unregisterOnJoinRoomCallback = (id) => {
  delete onJoinRoomCallbacks[id];
}
export const registerOnLeaveRoomCallback = (id, callback) => {
  onLeaveRoomCallbacks[id] = callback;
}
export const unregisterOnLeaveRoomCallback = (id) => {
  delete onLeaveRoomCallbacks[id];
}

export const browserHasSupport = () => {
  try {
    return !!navigator.mediaDevices;
  } catch (e) {
    return false;
  }
}

export const isMicrophonePermissionGranted = async () => {
  if (!browserHasSupport()) {
    return false;
  }

  return navigator.permissions.query({ name: "microphone" })
    .then(({ state }) => {
      return (state === "granted");
    });
}

export const isMicrophoneBlocked = async () => {
  if (!browserHasSupport()) {
    return true;
  }

  return navigator.permissions.query({ name: "microphone" })
    .then(({ state }) => {
      return (state === "denied");
    });
}

/* ******************************************************************** */
/* ---- JITST BEGIN ----*/
window.$ = jquery;

const BACKEND_URL = "209.50.53.252.us-chi1.upcloud.host";

const OPTIONS = {
  hosts: {
    domain: "meet.jitsi",
    muc: "muc.meet.jitsi" // FIXME: use XEP-0030
  },
  // serviceUrl: `https://${backendUrl}/http-bind`,

  bosh: `https://${BACKEND_URL}/http-bind`, // FIXME: use xep-0156 for that

  // The name of client node advertised in XEP-0115 'c' stanza
  clientNode: "https://jitsi.org/jitsimeet"
};

const CONFIG_OPTIONS = {
  openBridgeChannel: true
};

let connection = null;
let isConnected = false;
let isJoined = false;
let currentRoom = null;

let localTracks = [];
const remoteTracks = {};

let currentConferenceName = "";
const audioSources = {};
// const videoSources = {};

/**
* Handles local tracks.
* @param tracks Array with JitsiTrack objects
*/
const onLocalTracks = (tracks) => {
  localTracks = tracks;
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
      audioLevel => console.log(`Audio Level local: ${audioLevel}`));
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
      (track) => {
        Object.keys(onLocalTrackMuteChangedCallbacks).forEach(id => {
          onLocalTrackMuteChangedCallbacks[id](track.isMuted());
        });
        console.log(`local track mute changed: ${  track.isMuted()}`);
      });
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
      () => console.log("local track stoped"));
    localTracks[i].addEventListener(
      JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
      deviceId =>
        console.log(
          `track audio output device was changed to ${deviceId}`));
    // if (localTracks[i].getType() === 'video') {
    //   // $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
    //   // localTracks[i].attach($(`#localVideo${i}`)[0]);
    // } else {
    //   // $('body').append(
    //   //   `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
    //   // localTracks[i].attach($(`#localAudio${i}`)[0]);
    // }
    if (isJoined) {
      currentRoom.addTrack(localTracks[i]);
    }
  }
}

/**
* Handles remote tracks
* @param track JitsiTrack object
*/
const onRemoteTrack = (track) => {
  if (track.isLocal()) {
    return;
  }
  const participant = track.getParticipantId();

  if (!remoteTracks[participant]) {
    remoteTracks[participant] = [];
  }
  remoteTracks[participant].push(track);

  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_AUDIO_LEVEL_CHANGED,
    audioLevel => console.log(`Audio Level remote: ${audioLevel}`));
  track.addEventListener(
    JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
    () => console.log("remote track muted"));
  track.addEventListener(
    JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
    () => console.log("remote track stoped"));
  track.addEventListener(JitsiMeetJS.events.track.TRACK_AUDIO_OUTPUT_CHANGED,
    deviceId =>
      console.log(
        `track audio output device was changed to ${deviceId}`));

  if (track.getType() === "video") {
    /* const videoSource = new Video();
    videoSource.autoplay = true;

    if (!videoSources[participant]) {
      videoSources[participant] = [];
    }

    videoSources[participant].push(videoSource);
    track.attach(videoSource); */
  } else {
    const audioSource = new Audio();
    audioSource.autoplay = true;

    if (!audioSources[participant]) {
      audioSources[participant] = [];
    }

    audioSources[participant].push(audioSource);
    track.attach(audioSource);
  }
}

/**
* That function is executed when the conference is joined
*/
const onConferenceJoined = () => {
  console.log(`conference joined: ${  currentConferenceName}`);
  isJoined = true;
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].mute();
    currentRoom.addTrack(localTracks[i]);
  }

  Object.keys(onJoinRoomCallbacks).forEach(id => {
    onJoinRoomCallbacks[id]();
  });
}

/**
*
* @param id
*/
const onUserLeft = (id) => {
  console.log("user left");
  if (!remoteTracks[id]) {
    return;
  }
  const tracks = remoteTracks[id];

  for (let i = 0; i < tracks.length; i++) {
    tracks[i].detach(audioSources[id][i]);
  }
}

/**
* That function is called when connection is established successfully
*/
const onConnectionSuccess = () => {
  isConnected = true;
}

const joinRoom = (conferenceName) => {
  if (!isConnected)
    return;

  currentRoom = connection.initJitsiConference(conferenceName, CONFIG_OPTIONS);
  currentRoom.setStartMutedPolicy({ audio: true, video: true });
  currentRoom.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
  currentRoom.on(JitsiMeetJS.events.conference.TRACK_REMOVED, track => {
    console.log(`track removed!!!${track}`);
  });
  currentRoom.on(
    JitsiMeetJS.events.conference.CONFERENCE_JOINED,
    onConferenceJoined);
  currentRoom.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
    console.log(`user join:${  id}`);
    remoteTracks[id] = [];
  });
  currentRoom.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
  currentRoom.on(JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED, track => {
    console.log(`${track.getType()} - ${track.isMuted()}`);
  });
  currentRoom.on(
    JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
    (userID, displayName) => console.log(`${userID} - ${displayName}`));
  currentRoom.on(
    JitsiMeetJS.events.conference.TRACK_AUDIO_LEVEL_CHANGED,
    (userID, audioLevel) => console.log(`${userID} - ${audioLevel}`));
  currentRoom.on(
    JitsiMeetJS.events.conference.PHONE_NUMBER_CHANGED,
    () => console.log(`${currentRoom.getPhoneNumber()} - ${currentRoom.getPhonePin()}`));
  currentRoom.join();
}

/**
* This function is called when the connection fail.
*/
const onConnectionFailed = () => {
  console.error("Connection Failed!");
}

/**
* This function is called when the connection fail.
*/
const onDeviceListChanged = (devices) => {
  console.info("current devices", devices);
}

/**
* This function is called when we disconnect.
*/
const disconnect = () => {
  console.log("disconnect!");
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess);
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed);
  connection.removeEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect);
}

let isVideo = true;

/**
*
*/
const switchVideo = () => { // eslint-disable-line no-unused-vars
  isVideo = !isVideo;
  if (localTracks[1]) {
    localTracks[1].dispose();
    localTracks.pop();
  }
  JitsiMeetJS.createLocalTracks({
    devices: [isVideo ? "video" : "desktop"]
  })
    .then(tracks => {
      localTracks.push(tracks[0]);
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.TRACK_MUTE_CHANGED,
        () => console.log("local track muted"));
      localTracks[1].addEventListener(
        JitsiMeetJS.events.track.LOCAL_TRACK_STOPPED,
        () => console.log("local track stoped"));
      // localTracks[1].attach($('#localVideo1')[0]);
      currentRoom.addTrack(localTracks[1]);
    })
    .catch(error => console.log(error));
}

/**
*
* @param selected
*/
function changeAudioOutput(selected) { // eslint-disable-line no-unused-vars
  JitsiMeetJS.mediaDevices.setAudioOutputDevice(selected.value);
}

// JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
const initOptions = {
  disableAudioLevels: true,

  // The ID of the jidesha extension for Chrome.
  desktopSharingChromeExtId: "mbocklcggfhnbahlnepmldehdhpjfcjp",

  // Whether desktop sharing should be disabled on Chrome.
  desktopSharingChromeDisabled: false,

  // The media sources to use when using screen sharing with the Chrome
  // extension.
  desktopSharingChromeSources: ["screen", "window"],

  // Required version of Chrome extension
  desktopSharingChromeMinExtVersion: "0.1",

  // Whether desktop sharing should be disabled on Firefox.
  desktopSharingFirefoxDisabled: true
};

JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);
JitsiMeetJS.init(initOptions);

if (JitsiMeetJS.mediaDevices.isDeviceChangeAvailable("output")) {
  JitsiMeetJS.mediaDevices.enumerateDevices(devices => {
    const audioOutputDevices
      = devices.filter(d => d.kind === "audiooutput");
    console.log(audioOutputDevices);
    if (audioOutputDevices.length > 1) {
      // $('#audioOutputSelect').html(
      //   audioOutputDevices
      //     .map(
      //       d =>
      //         `<option value="${d.deviceId}">${d.label}</option>`)
      //     .join('\n'));

      // $('#audioOutputSelectWrapper').show();
    }
  });
}

const startJitsiConnection = () => {
  connection = new JitsiMeetJS.JitsiConnection(null, null, OPTIONS);

  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
    onConnectionSuccess);
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_FAILED,
    onConnectionFailed);
  connection.addEventListener(
    JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
    disconnect);

  JitsiMeetJS.mediaDevices.addEventListener(
    JitsiMeetJS.events.mediaDevices.DEVICE_LIST_CHANGED,
    onDeviceListChanged);

  connection.connect();
}

export const leaveRoom = () => {
  const previousConferenceName = currentConferenceName
  isJoined = false;
  for (let i = 0; i < localTracks.length; i++) {
    localTracks[i].dispose();
  }
  currentRoom.leave().then(() => {
    if (previousConferenceName === currentConferenceName) {
      Object.keys(onLeaveRoomCallbacks).forEach(id => {
        onLeaveRoomCallbacks[id]();
      });
    }
  });
}

const createLocalAudioTracks = (conferenceName, callback = null) => {
  if (isJoined && conferenceName !== currentConferenceName) {
    leaveRoom();
  }
  currentConferenceName = conferenceName;

  JitsiMeetJS.createLocalTracks({ devices: ["audio"/* , 'video' */] })
    .then(tracks => {
      onLocalTracks(tracks);
      joinRoom(conferenceName);
      if (callback) callback(true);
    })
    .catch(error => {
      console.error(error);
      if (callback) callback(false);
    });
}

startJitsiConnection();
/* ---- JITST END ----*/
/* ******************************************************************** */

export const requestPermissionToMicrophone = (conferenceName, callback) => {
  createLocalAudioTracks(conferenceName, callback);
};

export const toogleMute = (conferenceName) => {
  if (!isJoined) {
    const id = uuid();
    registerOnJoinRoomCallback(id, () => {
      unregisterOnJoinRoomCallback(id);
      localTracks.forEach(track => track.unmute());
    });

    createLocalAudioTracks(conferenceName);
    return;
  }

  localTracks.forEach(track => {
    if (track.isMuted())
      track.unmute();
    else
      track.mute();
  });
}

export const parseConferenceName = (room) => {
  if (!room || !room.name) return "";
  return room.name.trim().toLowerCase()
    .split(" ").map(t => t.trim()).join("-")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
