import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";

const JoinGroup = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const token = useMemo(() => {
    return new URLSearchParams(location.search).get("token");
  }, [location.search]);

  const [loading, setLoading] = useState(true);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");

  // ✅ better login check
  const isLoggedIn = !!localStorage.getItem("accessToken");

  const [form, setForm] = useState({
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  // ✅ 1) Verify token when page opens
  useEffect(() => {
    const verify = async () => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          setError("Invalid invite link (token missing).");
          return;
        }

        // ✅ backend: GET /group/invite/verify/:token
        const res = await axiosInstance.get(`/group/invite/verify/${token}`);
        setInvite(res.data?.data || res.data);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Invite verification failed";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token]);

  // ✅ 2) Accept invite (logged-in user)
  const handleAcceptInvite = async () => {
    try {
      setAcceptLoading(true);
      setError("");

      const res = await axiosInstance.post(`/group/invite/accept-existing`, {
        token,
      });

      toast.success(res.data?.message || "Joined group successfully ✅");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to accept invite";
      setError(msg);
    } finally {
      setAcceptLoading(false);
    }
  };

  // ✅ 3) Signup + Accept invite
  const handleSignupAndJoin = async () => {
    try {
      setAcceptLoading(true);
      setError("");

      if (!form.fullName.trim()) return setError("Full name is required.");
      if (!form.password) return setError("Password is required.");
      if (form.password.length < 6)
        return setError("Password must be at least 6 characters.");
      if (form.password !== form.confirmPassword)
        return setError("Passwords do not match.");

      const res = await axiosInstance.post(`/group/invite/accept`, {
        token,
        fullName: form.fullName.trim(),
        password: form.password,
      });

      // ✅ if backend returns accessToken, store it
      const accessToken = res?.data?.accessToken;
      if (accessToken) localStorage.setItem("accessToken", accessToken);

      toast.success(res.data?.message || "Signup + Joined successfully ✅");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to signup/join group";
      setError(msg);
    } finally {
      setAcceptLoading(false);
    }
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          p: 2,
          background: "linear-gradient(120deg, #f8fafc 0%, #eef2ff 100%)",
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 5,
            boxShadow: 8,
            bgcolor: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={2}>
              <CircularProgress />
              <Typography fontWeight={900}>Verifying invite link...</Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait a moment ✅
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ✅ Error UI
  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          p: 2,
          background: "linear-gradient(120deg, #f8fafc 0%, #eef2ff 100%)",
        }}
      >
        <Card sx={{ width: "100%", maxWidth: 520, borderRadius: 5, boxShadow: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={900} gutterBottom>
              Invite Error ❌
            </Typography>

            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>

            <Stack direction="row" spacing={1.2}>
              <Button variant="contained" fullWidth onClick={() => navigate("/")}>
                Go Home
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/login${token ? `?token=${token}` : ""}`)}
              >
                Login
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ✅ Verified Invite UI
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(120deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      {/* background blobs */}
      <Box
        sx={{
          position: "absolute",
          width: 260,
          height: 260,
          bgcolor: "rgba(99,102,241,0.15)",
          filter: "blur(40px)",
          borderRadius: "50%",
          top: -80,
          left: -60,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          bgcolor: "rgba(37,99,235,0.15)",
          filter: "blur(45px)",
          borderRadius: "50%",
          bottom: -90,
          right: -80,
        }}
      />

      <Card
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 6,
          boxShadow: 12,
          bgcolor: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.7)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h5" fontWeight={950}>
              You’re Invited 🎉
            </Typography>

            <Chip
              label="Invite Valid ✅"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Stack>

          <Typography sx={{ mb: 2, color: "text.secondary" }}>
            Join the group using this invite. It takes just a few seconds.
          </Typography>

          <Box sx={{ p: 2, bgcolor: "#f7f7ff", borderRadius: 4, mb: 2 }}>
            <Typography fontWeight={900} sx={{ fontSize: 16 }}>
              Group: {invite?.group?.name || invite?.groupName || "—"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
              Invited Email: <b>{invite?.email || "—"}</b>
            </Typography>
          </Box>

          {invite?.alreadyMember ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are already a member of this group ✅
              </Alert>

              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/dashboard")}
                sx={{ py: 1.2, fontWeight: 900, borderRadius: 3 }}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              {isLoggedIn ? (
                <>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    You are logged in. Click below to join the group ✅
                  </Alert>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleAcceptInvite}
                    disabled={acceptLoading}
                    sx={{ py: 1.25, fontWeight: 900, borderRadius: 3 }}
                  >
                    {acceptLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Joining...
                      </>
                    ) : (
                      "Accept Invite & Join Group"
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You are not logged in. Create an account to join this group.
                  </Alert>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={2}>
                    <TextField
                      label="Full Name"
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      fullWidth
                    />

                    <TextField
                      label="Email"
                      value={invite?.email || ""}
                      fullWidth
                      disabled
                    />

                    <TextField
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      fullWidth
                    />

                    <TextField
                      label="Confirm Password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      fullWidth
                    />

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleSignupAndJoin}
                      disabled={acceptLoading}
                      sx={{ py: 1.2, fontWeight: 950, borderRadius: 3 }}
                    >
                      {acceptLoading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1 }} /> Creating
                          account...
                        </>
                      ) : (
                        "Signup & Join Group"
                      )}
                    </Button>

                    <Button
                      variant="text"
                      fullWidth
                      onClick={() => navigate(`/login?token=${token}`)}
                      sx={{ fontWeight: 800 }}
                    >
                      Already have an account? Login
                    </Button>
                  </Stack>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default JoinGroup;
