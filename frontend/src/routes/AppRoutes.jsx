import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LandingP from "../Components/LandingPage/landingpage";
import Signup from "../Components/LandingPage/SignupPage";
import Login from "../Components/LandingPage/loginpage";

import AppLayout from "../Components/Layout/AppLayout";
import Dashboard from "../Components/Dashboard/Dashboard";

import JoinGroup from "../Components/JoinGroup/JoinGroup";

import GroupsPage from "../Components/Group/GroupsPage";
import GroupPage from "../Components/Group/GroupPage";

import SettleUpPage from "../Components/Settle/SettleUpPage";
import SettleHome from "../Components/Settle/SettleHome";

import ComingSoon from "../Components/ComingSoon/ComingSoon";
import PrivateRoute from "./PrivateRoute";

// ✅ Notifications
import NotificationsPage from "../Components/Notifications/NotificationsPage";
import SettingsPage from "../Components/Settings/SettingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<LandingP />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ INVITE ROUTE MUST BE PUBLIC ✅ */}
      <Route path="/join-group" element={<JoinGroup />} />

      {/* ✅ Protected Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        {/* ✅ Child routes WITHOUT "/" */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="group/:groupId" element={<GroupPage />} />

        {/* Optional pages */}
        <Route
          path="expenses"
          element={
            <ComingSoon
              title="Expenses (Global)"
              subtitle="Global expense search & analytics will be added in Phase 2."
            />
          }
        />
        <Route
          path="expenses/add"
          element={
            <ComingSoon
              title="Add Expense"
              subtitle="This will be enabled when global expenses module is ready."
            />
          }
        />

        {/* ✅ SETTLE ROUTES ✅ */}
        <Route path="settle" element={<SettleHome />} />
        <Route path="settle-up/:groupId" element={<SettleUpPage />} />

        {/* ✅ Settings */}
        <Route path="settings" element={<SettingsPage />} />

        {/* ✅ Notifications */}
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* ✅ fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
