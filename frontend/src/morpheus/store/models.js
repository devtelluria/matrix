import PropTypes from "prop-types";

export const RoomsPropType = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })
);

export const UsersPropType = PropTypes.arrayOf(
  PropTypes.exact({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    inMeet: PropTypes.bool.isRequired,
    roomId: PropTypes.string.isRequired,
    roomName: PropTypes.string.isRequired,
    microphoneActive: PropTypes.bool.isRequired,
    audioActive: PropTypes.bool.isRequired
  })
);

export const UsersFilterPropType = PropTypes.exact({
  search: PropTypes.string
});

export const CurrentUserPropType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string
});

export const CurrentRoomPropType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string
});

export const SettingsPropType = PropTypes.exact({
  notificationDisabled: PropTypes.bool.isRequired,
  microphoneDisabled: PropTypes.bool.isRequired,
  cameraDisabled: PropTypes.bool.isRequired,
  audioOutputDisabled: PropTypes.bool.isRequired
});

export const OfficeFilterPropType = PropTypes.exact({
  onlyFullRoom: PropTypes.bool.isRequired,
  search: PropTypes.string
});

export const ErrorPropType = PropTypes.shape({
  message: PropTypes.string
});
