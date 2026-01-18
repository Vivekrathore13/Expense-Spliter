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
  Avatar,
  IconButton,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosinstance";
import { toast } from "react-toastify";
import { alpha } from "@mui/material/styles";

// icons
import GroupIcon from "@mui/icons-material/Groups";
import VerifiedIcon from "@mui/icons-material/Verified";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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

        const res = await axiosInstance.get(`/group/invite/verify/${token}`);
        setInvite(res.data?.data || res.data);
      } catch (err) {
        const status = err?.response?.status;
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Invite verification failed";

        // ✅ AUTO redirect to login if unauthorized/forbidden
        if ((status === 401 || status === 403) && !isLoggedIn) {
          toast.info("Please login to accept this invite ✅");
          navigate(`/login?token=${token}`);
          return;
        }

        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, isLoggedIn, navigate]);

  // ✅ 2) Accept invite (logged-in user)
  const handleAcceptInvite = async () => {
    try {
      setAcceptLoading(true);
      setError("");

      const res = await axiosInstance.post(`/group/invite/accept-existing`, {
        token,
      });

      toast.success(res.data?.message || "Joined group successfully ✅");

      const gid =
        res?.data?.data?.groupId ||
        res?.data?.data?.group?._id ||
        res?.data?.groupId;

      if (gid) {
        navigate(`/group/${gid}`);
      } else {
        navigate("/dashboard"); // fallback
      }
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

      const gid =
        res?.data?.data?.groupId ||
        res?.data?.data?.group?._id ||
        res?.data?.groupId;

      if (gid) {
        navigate(`/group/${gid}`);
      } else {
        navigate("/dashboard"); // fallback
      }
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

  // UI helpers
  const groupName = invite?.group?.name || invite?.groupName || "Group";
  const invitedEmail = invite?.email || "—";

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
            maxWidth: 560,
            borderRadius: 6,
            overflow: "hidden",
            bgcolor: "rgba(255,255,255,0.70)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(226,232,240,0.95)",
            boxShadow: "0 30px 90px rgba(2,6,23,0.18)",
          }}
        >
          <Box
            sx={{
              height: 4,
              background: "linear-gradient(90deg, #2563eb, #6366f1)",
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Stack alignItems="center" spacing={2.2}>
              <CircularProgress />
              <Typography fontWeight={950} sx={{ fontSize: 18 }}>
                Verifying invite link...
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        <Card
          sx={{
            width: "100%",
            maxWidth: 560,
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid rgba(226,232,240,0.95)",
            boxShadow: "0 30px 90px rgba(2,6,23,0.18)",
          }}
        >
          <Box
            sx={{
              height: 4,
              background: "linear-gradient(90deg, #e11d48, #fb7185)",
            }}
          />
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5" fontWeight={950}>
                Invite Error ❌
              </Typography>

              <IconButton onClick={() => navigate("/")}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/")}
                sx={{ borderRadius: 3, fontWeight: 900, py: 1 }}
              >
                Go Home
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() =>
                  navigate(`/login${token ? `?token=${token}` : ""}`)
                }
                sx={{ borderRadius: 3, fontWeight: 900, py: 1 }}
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
      {/* Background glow blobs */}
      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          bgcolor: "rgba(99,102,241,0.18)",
          filter: "blur(55px)",
          borderRadius: "50%",
          top: -90,
          left: -70,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          bgcolor: "rgba(37,99,235,0.16)",
          filter: "blur(60px)",
          borderRadius: "50%",
          bottom: -110,
          right: -90,
        }}
      />

      <Card
        sx={{
          width: "100%",
          maxWidth: 720,
          borderRadius: 7,
          overflow: "hidden",
          bgcolor: "rgba(255,255,255,0.76)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(226,232,240,0.95)",
          boxShadow: "0 34px 110px rgba(2,6,23,0.20)",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* top gradient bar */}
        <Box
          sx={{
            height: 4,
            background: "linear-gradient(90deg, #2563eb, #6366f1)",
          }}
        />

        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={1.2}
          >
            <Stack spacing={0.4}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedIcon sx={{ color: "#16a34a" }} />
                <Typography variant="h5" fontWeight={950}>
                  You’re Invited 🎉
                </Typography>
              </Stack>

              <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                Join the group using this invite. It takes just a few seconds.
              </Typography>
            </Stack>

            <Chip
              label="Invite Valid ✅"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 900, borderRadius: 999 }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* group card */}
          <Box
            sx={{
              p: 2.2,
              borderRadius: 5,
              border: "1px solid rgba(226,232,240,0.95)",
              bgcolor: "rgba(238,242,255,0.62)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(37,99,235,0.18), transparent 55%)",
                pointerEvents: "none",
              }}
            />

            <Stack
              direction="row"
              spacing={1.6}
              alignItems="center"
              sx={{ position: "relative" }}
            >
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: alpha("#2563eb", 0.16),
                  color: "#2563eb",
                  fontWeight: 900,
                }}
              >
                <GroupIcon />
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 950, fontSize: 18 }} noWrap>
                  {groupName}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 0.6 }}
                >
                  <EmailIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                    noWrap
                  >
                    Invited Email: <b>{invitedEmail}</b>
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2.4 }} />

          {/* already member */}
          {invite?.alreadyMember ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                You are already a member of this group ✅
              </Alert>

              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/dashboard")}
                sx={{ py: 1.2, fontWeight: 950, borderRadius: 3.4 }}
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
                    sx={{ py: 1.25, fontWeight: 950, borderRadius: 3.4 }}
                  >
                    {acceptLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Joining...
                      </>
                    ) : (
                      "Accept Invite & Join Group"
                    )}
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => navigate("/dashboard")}
                    sx={{ mt: 1.2, fontWeight: 900 }}
                  >
                    Go back to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    You are not logged in. Create an account to join this group.
                  </Alert>

                  {/* signup card */}
                  <Box
                    sx={{
                      p: 2.2,
                      borderRadius: 5,
                      border: "1px solid rgba(226,232,240,0.95)",
                      bgcolor: "rgba(255,255,255,0.60)",
                    }}
                  >
                    <Stack spacing={2}>
                      <TextField
                        label="Full Name"
                        value={form.fullName}
                        onChange={(e) =>
                          setForm({ ...form, fullName: e.target.value })
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                                opacity: 0.7,
                              }}
                            >
                              <PersonIcon fontSize="small" />
                            </Box>
                          ),
                        }}
                      />

                      <TextField
                        label="Email"
                        value={invite?.email || ""}
                        fullWidth
                        disabled
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                                opacity: 0.7,
                              }}
                            >
                              <EmailIcon fontSize="small" />
                            </Box>
                          ),
                        }}
                      />

                      <TextField
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                                opacity: 0.7,
                              }}
                            >
                              <LockIcon fontSize="small" />
                            </Box>
                          ),
                        }}
                      />

                      <TextField
                        label="Confirm Password"
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) =>
                          setForm({ ...form, confirmPassword: e.target.value })
                        }
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mr: 1,
                                opacity: 0.7,
                              }}
                            >
                              <LockIcon fontSize="small" />
                            </Box>
                          ),
                        }}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSignupAndJoin}
                        disabled={acceptLoading}
                        sx={{ py: 1.2, fontWeight: 950, borderRadius: 3.4 }}
                      >
                        {acceptLoading ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Creating account...
                          </>
                        ) : (
                          "Signup & Join Group"
                        )}
                      </Button>

                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate(`/login?token=${token}`)}
                        sx={{ fontWeight: 900, borderRadius: 3.4, py: 1 }}
                      >
                        Already have an account? Login
                      </Button>
                    </Stack>
                  </Box>
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
