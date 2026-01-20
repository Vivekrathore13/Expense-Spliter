import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Group } from "../models/group.model.js";
import { Invitation } from "../models/invitation.model.js";
import { User } from "../models/user.model.js";

import { sendEmail } from "../utils/sendEmail.js";
import { sendNotification } from "../utils/notificationHelper.js";

// ✅ same function as in user.controllers.js (copy here to avoid import confusion)
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found while generating tokens");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// ✅ helper to make safe frontend base url
const getFrontendUrl = () => {
  const raw = process.env.FRONTEND_URL || "";
  return raw.trim().replace(/\/+$/, ""); // remove trailing slashes
};

// ✅ helper to build invite link safely
const buildInviteLink = (token) => {
  const FRONTEND = getFrontendUrl();
  const safeToken = encodeURIComponent(token);
  return `${FRONTEND}/join-group?token=${safeToken}`;
};

// ✅ Email HTML template
const inviteEmailTemplate = ({ inviterName, groupName, inviteLink, isResend }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 16px; line-height: 1.55;">
      <h2 style="margin: 0 0 10px;">You are invited to join a group 🎉</h2>
      <p style="margin: 0 0 10px;">
        <b>${inviterName}</b> invited you to join the group <b>${groupName}</b>.
      </p>

      <p style="margin: 0 0 14px;">Click the button below to join:</p>

      <a href="${inviteLink}" target="_blank" rel="noreferrer"
         style="display:inline-block;background:#2563eb;color:white;
                padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;">
        Join Group
      </a>

      <p style="margin-top: 14px; color:#64748b; font-size:13px;">
        If the button doesn't work, copy and paste this link in your browser:
      </p>

      <p style="word-break: break-all; font-size: 13px; color:#0f172a; background:#f1f5f9; padding:10px; border-radius:10px;">
        ${inviteLink}
      </p>

      <p style="margin-top: 14px; color:#64748b; font-size:13px;">
        ${
          isResend
            ? "This invitation is already active. You can use the same link."
            : "This invitation will expire in 2 days."
        }
      </p>
    </div>
  `;
};

// ✅ 1) SEND INVITE (Admin only)
export const sendInvite = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { groupId } = req.params;

  if (!email) throw new ApiError(400, "Email is required");

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  // ✅ Only admin
  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can send invites");
  }

  const normalizedEmail = email.toLowerCase().trim();

  // ✅ If user already exists + already member
  const existedUser = await User.findOne({ email: normalizedEmail });
  if (existedUser) {
    const isAlreadyMember = group.member?.some(
      (id) => id.toString() === existedUser._id.toString()
    );
    if (isAlreadyMember) {
      throw new ApiError(409, "User is already a member of this group");
    }
  }

  // ✅ Check existing pending invite
  const existing = await Invitation.findOne({
    groupId,
    email: normalizedEmail,
    status: "PENDING",
    expiresAt: { $gt: Date.now() },
  });

  // ✅ If invite already exists -> RESEND SAME LINK
  if (existing) {
    const inviteLink = buildInviteLink(existing.token);

    const html = inviteEmailTemplate({
      inviterName: req.user.fullName,
      groupName: group.groupname,
      inviteLink,
      isResend: true,
    });

    // ✅ IMPORTANT: Email fail ho to route crash na ho
    let emailSent = true;
    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Expense Splitter - Group Invitation (Resent)",
        html,
      });
    } catch (e) {
      emailSent = false;
      console.log("⚠️ Invite resend email failed:", e?.message);
    }

    // ✅ Notification
    await sendNotification({
      userId: req.user._id,
      groupId,
      type: "INVITE",
      title: emailSent ? "Invitation Resent" : "Invitation Resent (Email Failed)",
      message: emailSent
        ? `Invite resent to ${normalizedEmail}`
        : `Invite resent but email failed for ${normalizedEmail}`,
      meta: { inviteId: existing._id, email: normalizedEmail, groupId },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { inviteId: existing._id, link: inviteLink, emailSent },
        emailSent
          ? "Invitation resent successfully ✅"
          : "Invitation resent ✅ (but email failed ⚠️)"
      )
    );
  }

  // ✅ Create invite first (token later)
  const invite = await Invitation.create({
    groupId,
    invitedBy: req.user._id,
    email: normalizedEmail,
    token: "temp",
    status: "PENDING",
    expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days
  });

  // ✅ token payload includes inviteId
  const payload = {
    inviteId: invite._id,
    groupId,
    email: normalizedEmail,
  };

  const token = jwt.sign(payload, process.env.INVITE_TOKEN_SECRET, {
    expiresIn: "2d",
  });

  invite.token = token;
  await invite.save();

  const inviteLink = buildInviteLink(token);

  const html = inviteEmailTemplate({
    inviterName: req.user.fullName,
    groupName: group.groupname,
    inviteLink,
    isResend: false,
  });

  // ✅ IMPORTANT: Email fail ho to route crash na ho
  let emailSent = true;
  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Expense Splitter - Group Invitation",
      html,
    });
  } catch (e) {
    emailSent = false;
    console.log("⚠️ Invite email failed:", e?.message);
  }

  // ✅ Notification (invite sent)
  await sendNotification({
    userId: req.user._id,
    groupId,
    type: "INVITE",
    title: emailSent ? "Invitation Sent" : "Invitation Created (Email Failed)",
    message: emailSent
      ? `Invite sent to ${normalizedEmail}`
      : `Invite created but email failed for ${normalizedEmail}`,
    meta: { inviteId: invite._id, email: normalizedEmail, groupId },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { inviteId: invite._id, link: inviteLink, emailSent },
      emailSent
        ? "Invitation generated successfully ✅"
        : "Invitation generated ✅ (but email failed ⚠️)"
    )
  );
});

// ✅ 2) VERIFY TOKEN (Public)
export const verifyToken = asyncHandler(async (req, res) => {
  const token = req.query.token || req.params.token;

  if (!token) throw new ApiError(400, "Token is required");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.INVITE_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(400, "Invalid or expired invitation token");
  }

  const invite = await Invitation.findById(decoded.inviteId);
  if (!invite) throw new ApiError(400, "Invitation not found");

  if (invite.expiresAt < Date.now()) {
    throw new ApiError(400, "Invitation link has expired");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        email: invite.email,
        groupId: invite.groupId,
        status: invite.status,
      },
      "Invitation token is valid ✅"
    )
  );
});

// ✅ 3) ACCEPT INVITE (Existing logged-in user)
export const acceptInviteExisting = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const userId = req.user?._id;

  if (!token) throw new ApiError(400, "Token is required");
  if (!userId) throw new ApiError(401, "Unauthorized");

  const invite = await Invitation.findOne({ token });
  if (!invite) throw new ApiError(404, "Invalid or expired invite token");

  if (invite.expiresAt < Date.now()) {
    throw new ApiError(400, "Invite link expired");
  }

  if (invite.status !== "PENDING") {
    throw new ApiError(400, "Invitation already used");
  }

  const group = await Group.findById(invite.groupId);
  if (!group) throw new ApiError(404, "Group not found");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  // ✅ Invited email should match logged in email
  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new ApiError(
      403,
      "This invite is for a different email. Please login with invited email."
    );
  }

  const alreadyMember = group.member?.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyMember) {
    invite.status = "ACCEPTED";
    invite.acceptedAt = new Date();
    await invite.save();

    return res
      .status(200)
      .json(new ApiResponse(200, { groupId: group._id }, "Already a member ✅"));
  }

  group.member.push(userId);
  await group.save();

  invite.status = "ACCEPTED";
  invite.acceptedAt = new Date();
  await invite.save();

  // ✅ Notifications
  await sendNotification({
    userId: userId,
    groupId: group._id,
    type: "INVITE",
    title: "Joined group ✅",
    message: `You joined group successfully`,
    meta: { groupId: group._id },
  });

  await sendNotification({
    userId: group.admin,
    groupId: group._id,
    type: "INVITE",
    title: "New member joined",
    message: `${user.fullName} joined your group`,
    meta: { groupId: group._id, userId },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { groupId: group._id }, "Joined group successfully ✅")
    );
});

// ✅ 4) ACCEPT INVITE + SIGNUP + AUTO LOGIN (Public)
export const acceptInviteSignup = asyncHandler(async (req, res) => {
  const { token, fullName, password } = req.body;

  if (!token) throw new ApiError(400, "Token is required");
  if (!fullName || !password) {
    throw new ApiError(400, "Full name and password are required");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.INVITE_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(400, "Invalid or expired invitation token");
  }

  const { inviteId, email, groupId } = decoded;

  const invite = await Invitation.findById(inviteId);
  if (!invite) throw new ApiError(404, "Invitation not found");

  if (invite.status !== "PENDING") {
    throw new ApiError(400, "Invitation already used");
  }

  if (invite.expiresAt < Date.now()) {
    throw new ApiError(400, "Invitation link expired");
  }

  if (invite.email.toLowerCase() !== email.toLowerCase()) {
    throw new ApiError(403, "Invitation email mismatch");
  }

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");

  // ✅ if user already exists
  const existedUser = await User.findOne({ email: email.toLowerCase() });
  if (existedUser) {
    throw new ApiError(409, "User already exists, please login to join group");
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
    isregistered: true,
  });

  // ✅ add member if not already
  const alreadyMember = group.member.some(
    (id) => id.toString() === user._id.toString()
  );

  if (!alreadyMember) {
    group.member.push(user._id);
    await group.save();
  }

  invite.status = "ACCEPTED";
  invite.acceptedAt = new Date();
  await invite.save();

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // ✅ Notifications
  await sendNotification({
    userId: user._id,
    groupId: group._id,
    type: "INVITE",
    title: "Joined group ✅",
    message: `You joined group successfully`,
    meta: { groupId: group._id },
  });

  await sendNotification({
    userId: group.admin,
    groupId: group._id,
    type: "INVITE",
    title: "New member joined",
    message: `${user.fullName} joined your group`,
    meta: { groupId: group._id, userId: user._id },
  });

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        { user: safeUser, group, accessToken, refreshToken },
        "Joined group successfully ✅"
      )
    );
});

// ✅ 5) SENT INVITES
export const getSentInvites = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const invites = await Invitation.find({ invitedBy: userId })
    .populate("groupId", "groupname")
    .sort({ createdAt: -1 });

  const formatted = invites.map((inv) => ({
    _id: inv._id,
    email: inv.email,
    status: inv.status,
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
    groupId: inv.groupId?._id,
    groupName: inv.groupId?.groupname || "",
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, formatted, "Sent invites fetched successfully ✅")
    );
});

// ✅ 6) FIX OLD INVITES (Admin only)
export const fixOldInvites = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const invites = await Invitation.find({
    invitedBy: userId,
    status: "PENDING",
  });

  let fixed = 0;

  for (const inv of invites) {
    const user = await User.findOne({ email: inv.email.toLowerCase() });
    if (!user) continue;

    const group = await Group.findById(inv.groupId);
    if (!group) continue;

    const isMember = group.member?.some(
      (id) => id.toString() === user._id.toString()
    );

    if (isMember) {
      inv.status = "ACCEPTED";
      inv.acceptedAt = new Date();
      await inv.save();
      fixed++;
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { fixed }, "Old pending invites fixed ✅"));
});
