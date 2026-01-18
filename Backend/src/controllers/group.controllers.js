import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { validationResult } from "express-validator";
import jwt from 'jsonwebtoken'
import mongoose  from "mongoose";
import { Group } from "../models/group.model.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const createGroup = asyncHandler(async (req, res) => {

  const { groupname } = req.body;

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "All fields are required");
  }

  // current logged in user becomes admin
  const userId = req.user?._id;   // assuming verifyJWT middleware set req.user
    // user who is logged in

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

   const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User Not Found");
    }


  const group = await Group.create({
    groupname,
    admin: userId,
    member: [userId],
  });

  if (!group) {
    throw new ApiError(500, "Something went wrong while creating the group");
  }

  return res.status(201).json(
    new ApiResponse(201, group, "group created successfully")
  );
});


export const getMyGroups = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const groups = await Group.find({
    member: new mongoose.Types.ObjectId(userId),
  });

  // ✅ IMPORTANT: empty groups ko error mat banao
  return res.status(200).json(
    new ApiResponse(200, groups, "Groups fetched successfully")
  );
});


export const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid Group Id");
  }

  const group = await Group.findById(id);

  if (!group) {
    throw new ApiError(404, "Group Not Found");
  }

  // Permission: any member including admin
  const memberIds = group.member.map((m) => String(m));

  if (!memberIds.includes(String(userId))) {
    throw new ApiError(403, "Access Denied");
  }

  return res.status(200).json(
    new ApiResponse(200, group, "Group fetched successfully")
  );
});

// get groupId from params
// find group by groupId
// if group not found -> throw error
// populate members (optional: name, email show krne k liye)
// return members list in response



const groupMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  const group = await Group.findById(groupId).populate(
    "member",
    "fullName email"
  );

  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  const isMember = group.member.some(m => String(m._id) === String(userId));

if(!isMember) throw new ApiError(403, "Access Denied");

  return res.status(200).json(
    new ApiResponse(
      200,
      group.member,
      "Members List Fetched Successfully"
    )
  );
});


const totalExpense = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const { groupId } = req.params;
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(groupId)) {
    throw new ApiError(400, "Invalid Group Id");
  }

  if (!amount || Number(amount) <= 0) {
    throw new ApiError(400, "Valid amount is required");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  // ✅ Check user is member
  const isMember = group.member.some(m => m.equals(userId));
  if (!isMember) {
    throw new ApiError(403, "You are not a member of this group");
  }
  
  // ✅ update totalExpense safely
 group.totalExpense = (group.totalExpense || 0) + Number(amount);
group.expenseLog.push({ amount: Number(amount), addedBy: userId });


  await group.save();

  return res.status(200).json(
    new ApiResponse(200, group, "Total expense updated successfully")
  );
});



//Delete group -> only admin

export const deleteGroup=asyncHandler(async(req,res) => {
  const {groupId}=req.params
  // this is use to check the user is login or not 

  const userId=req.user.id

  // this is use to avoid tha database and server error in if the application is running 

  if(!mongoose.isValidObjectId(groupId)){
    throw new ApiError(400,"Invalid Group id");
  }

  const group=await Group.findById(groupId)

  if(!group){
    throw new ApiError(400,"Group not found")
  }

  // main part of this function because in mongogo db group.admin it is object beacuse member is conist object of members so 

  // admin.member returns ->objectid 

  //and user id is present in the form of string the it is not compare 

  // so we use string word to comapre the both 

  if(String(group.admin)!==String(userId)){
    throw new ApiError(403,"Only admin can delete group");
  }

  await Group.findByIdAndDelete(groupId);

 return res.status(200).json(
  new ApiResponse(200,null,"Group deleted Sucessfully")
 )
})

// remove member by only admin 

// so the steps is 

// get groupid by params 
// check user is logged in using req.user.id
// valid date the group id is exisr or not throw error 
// check if the admin in not delelte it is preserved
// check only admin have powers to delete the members in group

export const deleteMember = asyncHandler(async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user.id;

  if (!mongoose.isValidObjectId(groupId) || !mongoose.isValidObjectId(memberId)) {
    throw new ApiError(400, "Invalid id Format");
  }

  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  const isAdmin = String(group.admin) === String(userId);
  const isSelf = String(memberId) === String(userId);

  // ✅ permission rule
  // Admin can remove anyone
  // Member can remove only himself (leave)
  if (!isAdmin && !isSelf) {
    throw new ApiError(403, "Only admin can remove other members");
  }

  // ✅ Admin cannot be removed (by anyone)
  if (String(memberId) === String(group.admin)) {
    throw new ApiError(403, "Admin cannot be removed from group");
  }

  // ✅ check member exists in group
  const isMember = group.member.some((m) => String(m) === String(memberId));
  if (!isMember) {
    throw new ApiError(404, "Member Not Part Of Group");
  }

  // ✅ Remove member from group
  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    { $pull: { member: memberId } },
    { new: true }
  ).populate("member", "fullName email");

  return res.status(200).json(
    new ApiResponse(200, updatedGroup, isSelf ? "Left group successfully" : "Member removed successfully")
  );
});



export {createGroup,groupMembers,totalExpense};