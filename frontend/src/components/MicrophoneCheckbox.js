import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import MicNoneIcon from '@material-ui/icons/MicNone';

import {
  isMicrophoneEnabled,
  isMicrophoneBlocked,
  browserHasSupport,
  requestPermissionToMicrophone
} from "../usermedia";
import { showMessageDialog } from "../morpheus/store/actions";

const MicrophoneCheckbox = ({ onChange, openMessageDialog, isDisabled }) => {
  const [isAllowed, toggleAllowed] = useState(isMicrophoneEnabled());

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
            if (isMicrophoneBlocked()) {
              openMessageDialog(
                "Microphone blocked",
                "You must unlock your microphone in your browser settings."
              );
            } else {
              requestPermissionToMicrophone(hasPermission => {
                if (hasPermission) {
                  toggleAllowed(true);
                }
              });
            }
          }}
          color="inherit"
        >
          <MicNoneIcon />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={`${isDisabled ? "Enable" : "Disable"} microphone`}>
      <Checkbox
        icon={<MicIcon />}
        checkedIcon={<MicOffIcon />}
        checked={isDisabled}
        onChange={onChange}
      />
    </Tooltip>
  );
};

MicrophoneCheckbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  openMessageDialog: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired
};

const mapDispatchToProps = {
  openMessageDialog: showMessageDialog
};

export default connect(
  null,
  mapDispatchToProps
)(MicrophoneCheckbox);
