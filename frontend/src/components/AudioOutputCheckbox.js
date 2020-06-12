import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import VolumeIcon from "@material-ui/icons/VolumeUp";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";

import {
  CurrentUserPropType,
  CurrentRoomPropType
} from "../morpheus/store/models";

import {
  leaveRoom,
  requestPermissionToMicrophone,
  parseConferenceName
} from "../usermedia";

const AudioOutputCheckbox = ({ isDisabled, currentUser, currentRoom }) => {
  const conferenceName = parseConferenceName(currentRoom);
  return (
    <Tooltip title={`${isDisabled ? "Enable" : "Disable"} audio output`}>
      <Checkbox
        icon={<VolumeIcon />}
        checkedIcon={<VolumeOffIcon />}
        checked={isDisabled}
        onChange={event => {
          if (isDisabled) {
            requestPermissionToMicrophone(conferenceName);
          } else {
            leaveRoom();
          }
        }}
      />
    </Tooltip>
  );
};

AudioOutputCheckbox.propTypes = {
  isDisabled: PropTypes.bool.isRequired,
  currentUser: CurrentUserPropType,
  currentRoom: CurrentRoomPropType
};

const mapDispatchToProps = {};

export default connect(
  null,
  mapDispatchToProps
)(AudioOutputCheckbox);
