import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';

import {
  isMicrophonePermissionGranted,
  isMicrophoneBlocked,
  browserHasSupport,
  requestPermissionToMicrophone,
  toogleMute,
  registerOnJoinRoomCallback,
  registerOnLeaveRoomCallback,
  registerOnLocalTrackMuteChangedCallback
} from "../usermedia";
import { showMessageDialog } from "../morpheus/store/actions";

const MicrophoneCheckbox = ({ onChange, toggleAudioOutput, openMessageDialog, isDisabled, isAudioOutputDisabled }) => {
  const [isAllowed, toggleAllowed] = useState(false);
  const [isBlocked, toggleBlocked] = useState(false);

  isMicrophonePermissionGranted().then(allowed => {
    toggleAllowed(allowed);
  });
  isMicrophoneBlocked().then(blocked => {
    toggleBlocked(blocked);
  });

  registerOnJoinRoomCallback('MicrophoneCheckbox', () => {
    toggleAudioOutput(false);
  });

  registerOnLeaveRoomCallback('MicrophoneCheckbox', () => {
    toggleAudioOutput(true);
  });

  registerOnLocalTrackMuteChangedCallback('MicrophoneCheckbox', isMuted => {
    onChange(isMuted);
  });

  if (!browserHasSupport()) {
    return (
      <Tooltip title="This browser doesn't support microphone.">
        <MicOffIcon />
      </Tooltip>
    );
  }

  if (!isAllowed) {
    return (
      <Tooltip title="Request microphone permission">
        <IconButton
          aria-label="Exit room"
          aria-controls="menu-appbar"
          onClick={() => {
            if (isBlocked) {
              openMessageDialog(
                "Microphone blocked",
                "You must unlock your microphone in your browser settings."
              );
            } else {
              requestPermissionToMicrophone(hasPermission => {
                //toggleAudioOutput(!hasPermission);
                toggleAllowed(hasPermission);
                toggleBlocked(!hasPermission);
              });
            }
          }}
          color="inherit"
        >
          <MicOffIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${(isDisabled || isAudioOutputDisabled) ? "Enable" : "Disable"} microphone`}>
      <Checkbox
        icon={<MicIcon />}
        checkedIcon={<MicOffIcon />}
        checked={isDisabled || isAudioOutputDisabled}
        onChange={() => {
          toogleMute();
        }}
      />
    </Tooltip>
  );
};

MicrophoneCheckbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  toggleAudioOutput: PropTypes.func.isRequired,
  openMessageDialog: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isAudioOutputDisabled: PropTypes.bool.isRequired
};

const mapDispatchToProps = {
  openMessageDialog: showMessageDialog
};

export default connect(
  null,
  mapDispatchToProps
)(MicrophoneCheckbox);
