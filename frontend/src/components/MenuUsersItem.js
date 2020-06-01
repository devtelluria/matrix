import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import PhoneForwardedIcon from "@material-ui/icons/PhoneForwarded";
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';

const useStyles = makeStyles(() => ({
  avatarInMeeting: {
    position: "relative",
    "&:after": {
      content: "''",
      position: "absolute",
      top: -2,
      left: -3,
      width: 46,
      height: 40,
      background: "url('/images/headset.svg')",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat"
    }
  }
}));

const MenuUsersItem = ({
  onInviteUser,
  showInviteAction,
  inMeeting,
  name,
  avatar,
  roomName,
  microphoneActive,
  audioActive
}) => {
  const classes = useStyles();

  return (
    <ListItem>
      <ListItemAvatar>
        <div
          className={clsx({
            [classes.avatarInMeeting]: inMeeting
          })}
        >
          <Avatar alt={name} src={avatar} />
          {
            microphoneActive
              ? <MicIcon fontSize="small" />
              : <MicOffIcon fontSize="small" style={{ opacity: 0.4 }} />
          }
          {
            audioActive
              ? <VolumeUpIcon fontSize="small" />
              : <VolumeOffIcon fontSize="small" style={{ opacity: 0.4 }} />
          }
        </div>
      </ListItemAvatar>
      <ListItemText primary={name} secondary={roomName} />
      {showInviteAction && (
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Comments" onClick={onInviteUser}>
            <PhoneForwardedIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

MenuUsersItem.propTypes = {
  onInviteUser: PropTypes.func,
  showInviteAction: PropTypes.bool,
  inMeeting: PropTypes.bool,
  name: PropTypes.string,
  avatar: PropTypes.string,
  roomName: PropTypes.string,
  microphoneActive: PropTypes.bool,
  audioActive: PropTypes.bool
};

MenuUsersItem.defaultProps = {
  onInviteUser: () => { },
  showInviteAction: false,
  inMeeting: false,
  name: "",
  avatar: "",
  roomName: "",
  microphoneActive: false,
  audioActive: false
};

export default MenuUsersItem;
