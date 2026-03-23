"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllUsers = fetchAllUsers;
exports.fetchProfile = fetchProfile;
exports.editProfile = editProfile;
exports.removeProfile = removeProfile;
const userService_1 = require("../services/userService");
async function fetchAllUsers(req, res, next) {
    try {
        const users = await (0, userService_1.getAllUsers)();
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users,
        });
    }
    catch (error) {
        next(error);
    }
}
async function fetchProfile(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user ID is missing",
            });
        }
        const profile = await (0, userService_1.getProfileById)(userId);
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: profile,
        });
    }
    catch (error) {
        next(error);
    }
}
async function editProfile(req, res, next) {
    try {
        const userId = req.user?.id;
        const { fullName, email, phoneNumber } = req.body;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user ID is missing",
            });
        }
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Full name is required",
            });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }
        if (!phoneNumber || !phoneNumber.trim()) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }
        console.log(`Received profile update request for user ID: ${userId}`, req.body);
        const updated = await (0, userService_1.updateProfile)(userId, {
            fullName,
            email,
            phoneNumber,
        });
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
}
async function removeProfile(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user ID is missing",
            });
        }
        const deleted = await (0, userService_1.deleteProfile)(userId);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Profile deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
}
