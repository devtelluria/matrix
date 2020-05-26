import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Tooltip from "@material-ui/core/Tooltip";
import VolumeIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';

const AudioOutputCheckbox = ({ onChange, isDisabled }) => {
  return (
    <Tooltip title={`${isDisabled ? "Enable" : "Disable"} audio output`}>
      <Checkbox
        icon={<VolumeIcon />}
        checkedIcon={<VolumeOffIcon />}
        checked={isDisabled}
        onChange={onChange}
      />
    </Tooltip>
  );
};

AudioOutputCheckbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  isDisabled: PropTypes.bool.isRequired
};

const mapDispatchToProps = {};

export default connect(
  null,
  mapDispatchToProps
)(AudioOutputCheckbox);
