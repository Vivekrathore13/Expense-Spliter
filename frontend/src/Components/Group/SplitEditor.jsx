import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  TextField,
  Divider,
  Alert,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * members: [{_id, fullName, email}]
 * amount: number
 * splitType: equal | exact | percentage
 *
 * onChange({ selectedUsers, splitDetails, isValid, error })
 */

const SplitEditor = ({
  members = [],
  amount = 0,
  splitType = "equal",
  onChange,
  initialSplitDetails = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const memberIds = useMemo(
    () => members.map((m) => m._id || m.userId),
    [members]
  );

  // ✅ by default: all selected
  const [selected, setSelected] = useState(memberIds);

  // For exact amounts
  const [exact, setExact] = useState({}); // { userId: amount }

  // For percentage
  const [percent, setPercent] = useState({}); // { userId: percent }

  const totalAmount = Number(amount || 0);

  // ✅ whenever members change reset selection
  useEffect(() => {
    setSelected(memberIds);
  }, [memberIds.join(",")]);

  // ✅ Prefill when editing expense
  useEffect(() => {
    if (!initialSplitDetails?.length) return;

    const selectedUsers = initialSplitDetails.map((s) => s.user);
    setSelected(selectedUsers);

    const exactMap = {};
    const percentMap = {};

    initialSplitDetails.forEach((s) => {
      if (splitType === "exact") exactMap[s.user] = s.amount;
      if (splitType === "percentage") percentMap[s.user] = s.percent;
    });

    setExact(exactMap);
    setPercent(percentMap);
    // eslint-disable-next-line
  }, [JSON.stringify(initialSplitDetails), splitType]);

  // ✅ helper: build splitDetails
  const buildSplitDetails = () => {
    if (!selected.length) {
      return {
        isValid: false,
        error: "Select at least 1 member",
        splitDetails: [],
      };
    }

    if (!totalAmount || totalAmount <= 0) {
      return { isValid: false, error: "Enter valid amount", splitDetails: [] };
    }

    // ✅ EQUAL
    if (splitType === "equal") {
      const n = selected.length;
      const per = +(totalAmount / n).toFixed(2);

      let splitDetails = selected.map((uid) => ({
        user: uid,
        amount: per,
      }));

      // fix last rounding
      let sum = 0;
      for (let i = 0; i < splitDetails.length - 1; i++)
        sum += splitDetails[i].amount;
      splitDetails[splitDetails.length - 1].amount = +(
        totalAmount - sum
      ).toFixed(2);

      return { isValid: true, error: "", splitDetails };
    }

    // ✅ EXACT
    if (splitType === "exact") {
      const splitDetails = selected.map((uid) => ({
        user: uid,
        amount: +Number(exact[uid] || 0).toFixed(2),
      }));

      const sum = +splitDetails
        .reduce((acc, s) => acc + s.amount, 0)
        .toFixed(2);
      const tot = +totalAmount.toFixed(2);

      if (sum !== tot) {
        return {
          isValid: false,
          error: `Exact sum must be ₹${tot} (current ₹${sum})`,
          splitDetails,
        };
      }
      return { isValid: true, error: "", splitDetails };
    }

    // ✅ PERCENTAGE
    if (splitType === "percentage") {
      const splitDetails = selected.map((uid) => ({
        user: uid,
        percent: +Number(percent[uid] || 0).toFixed(2),
      }));

      const totalP = +splitDetails
        .reduce((acc, s) => acc + s.percent, 0)
        .toFixed(2);

      if (totalP !== 100) {
        return {
          isValid: false,
          error: `Total % must be 100 (current ${totalP}%)`,
          splitDetails,
        };
      }

      // compute amount
      let withAmount = splitDetails.map((s) => ({
        ...s,
        amount: +((totalAmount * s.percent) / 100).toFixed(2),
      }));

      // fix last rounding
      let sum = 0;
      for (let i = 0; i < withAmount.length - 1; i++)
        sum += withAmount[i].amount;
      withAmount[withAmount.length - 1].amount = +(
        totalAmount - sum
      ).toFixed(2);

      return { isValid: true, error: "", splitDetails: withAmount };
    }

    return { isValid: false, error: "Invalid split type", splitDetails: [] };
  };

  // ✅ send to parent
  useEffect(() => {
    const res = buildSplitDetails();
    onChange?.({
      selectedUsers: selected,
      splitDetails: res.splitDetails,
      isValid: res.isValid,
      error: res.error,
    });
    // eslint-disable-next-line
  }, [
    selected.join(","),
    JSON.stringify(exact),
    JSON.stringify(percent),
    totalAmount,
    splitType,
  ]);

  const toggleUser = (uid) => {
    setSelected((prev) =>
      prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]
    );
  };

  const { isValid, error } = buildSplitDetails();

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <Typography fontWeight={900} sx={{ mb: 1 }}>
        Split Between
      </Typography>

      <Stack spacing={0.8}>
        {members.map((m) => {
          const uid = m._id || m.userId;
          const checked = selected.includes(uid);

          return (
            <Box
              key={uid}
              sx={{
                p: 1.1,
                borderRadius: 2.6,
                border: "1px solid rgba(0,0,0,0.08)",
                width: "100%",
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              {/* ✅ MOBILE FIX: layout becomes column */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                spacing={{ xs: 1, sm: 2 }}
                sx={{ minWidth: 0 }}
              >
                {/* Left checkbox */}
                <Box sx={{ minWidth: 0 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={() => toggleUser(uid)}
                      />
                    }
                    sx={{
                      m: 0,
                      alignItems: "flex-start",
                      "& .MuiFormControlLabel-label": {
                        width: "100%",
                      },
                    }}
                    label={
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          fontWeight={800}
                          sx={{
                            fontSize: 14,
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.fullName || "Member"}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {m.email || ""}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Right input */}
                {checked && splitType === "exact" && (
                  <TextField
                    size="small"
                    type="number"
                    label="₹ Amount"
                    value={exact[uid] ?? ""}
                    onChange={(e) =>
                      setExact((p) => ({ ...p, [uid]: e.target.value }))
                    }
                    fullWidth={isMobile}
                    sx={{
                      width: { xs: "100%", sm: 160 },
                      flexShrink: 0,
                    }}
                    inputProps={{ min: 0 }}
                  />
                )}

                {checked && splitType === "percentage" && (
                  <TextField
                    size="small"
                    type="number"
                    label="% Share"
                    value={percent[uid] ?? ""}
                    onChange={(e) =>
                      setPercent((p) => ({ ...p, [uid]: e.target.value }))
                    }
                    fullWidth={isMobile}
                    sx={{
                      width: { xs: "100%", sm: 160 },
                      flexShrink: 0,
                    }}
                    inputProps={{ min: 0, max: 100 }}
                  />
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ my: 1.6 }} />

      {!isValid && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default SplitEditor;
