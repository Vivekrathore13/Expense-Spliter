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

import ComingSoon from "../Components/ComingSoon/ComingSoon";

import PrivateRoute from "./PrivateRoute";

// ✅ Notifications
import NotificationsPage from "../Components/Notifications/NotificationsPage";

const Page = ({ title }) => (
  <div style={{ fontWeight: 900, fontSize: 22 }}>{title}</div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<LandingP />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* ✅ Protected Layout */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="groups" element={<GroupsPage />} />
        <Route path="group/:groupId" element={<GroupPage />} />
        <Route path="join-group" element={<JoinGroup />} />

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

        {/* ✅ IMPORTANT: settle is group-specific */}
        <Route path="settle-up/:groupId" element={<SettleUpPage />} />

        <Route path="settings" element={<Page title="Settings Page" />} />

        {/* ✅ FIXED ✅ */}
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* ✅ fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
