import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import AppBarTitle from "../../components/AppBarTitle";
import MenuOffice from "../../components/MenuOffice";
import MenuAuth from "../../components/MenuAuth";
import {
  changeOfficeFilter,
  changeSystemSetting,
  toggleTheme,
  openLogoutConfirmDialog
} from "../store/actions";
import {
  selectOfficeFilter,
  selectCurrentUser,
  selectCurrentRoom,
  selectSystemSettings
} from "../store/selectors";
import {
  OfficeFilterPropType,
  SettingsPropType,
  CurrentUserPropType,
  CurrentRoomPropType
} from "../store/models";

const OfficeAppBar = ({
  onChangeOfficeFilter,
  onChangeSettings,
  onChangeTheme,
  onLogout,
  officeFilter,
  settings,
  currentUser,
  currentRoom
}) => (
  <>
    <AppBarTitle>Proseia</AppBarTitle>
    <MenuOffice
      filter={officeFilter}
      onChangeFilter={onChangeOfficeFilter}
      onChangeSettings={onChangeSettings}
      onChangeTheme={onChangeTheme}
      settings={settings}
      currentUser={currentUser}
      currentRoom={currentRoom}
    />
    <MenuAuth onLogout={onLogout} userName={currentUser.name} />
  </>
);

OfficeAppBar.propTypes = {
  onChangeOfficeFilter: PropTypes.func,
  onChangeSettings: PropTypes.func,
  onChangeTheme: PropTypes.func,
  onLogout: PropTypes.func,
  officeFilter: OfficeFilterPropType,
  settings: SettingsPropType,
  currentUser: CurrentUserPropType,
  currentRoom: CurrentRoomPropType
};

OfficeAppBar.defaultProps = {
  onChangeOfficeFilter: () => {},
  onChangeSettings: () => {},
  onChangeTheme: () => {},
  onLogout: () => {},
  officeFilter: {},
  settings: {},
  currentUser: {},
  currentRoom: {}
};

const mapStateToProps = state => ({
  officeFilter: selectOfficeFilter(state),
  currentUser: selectCurrentUser(state),
  currentRoom: selectCurrentRoom(state),
  settings: selectSystemSettings(state)
});

const mapDispatchToProps = {
  onChangeOfficeFilter: changeOfficeFilter,
  onChangeSettings: changeSystemSetting,
  onChangeTheme: toggleTheme,
  onLogout: openLogoutConfirmDialog
};

export default connect(mapStateToProps, mapDispatchToProps)(OfficeAppBar);
