"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Action for creating admin
export const createAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("financial_agent"),
        v.literal("b2b_agent")
      )
    ),
    createdBy: v.optional(v.string()), // Admin ID who created this (for role checking)
  },
  handler: async (ctx, args): Promise<Id<"admins">> => {
    // Check if admin already exists
    const existing = await ctx.runQuery(internal.auth.checkAdminExists, {
      email: args.email,
    });

    if (existing) {
      throw new Error("Admin with this email already exists");
    }

    // Check if this is the first admin (make them super_admin)
    const adminCount = await ctx.runQuery(internal.auth.getAdminCount);
    const isFirstAdmin = adminCount === 0;

    // Determine role
    let role: "super_admin" | "financial_agent" | "b2b_agent";
    if (isFirstAdmin) {
      // First admin is always super_admin
      role = "super_admin";
    } else if (args.role) {
      // If role is provided, verify creator is super_admin
      if (args.createdBy) {
        const creator = await ctx.runQuery(internal.auth.getAdminById, {
          adminId: args.createdBy as any,
        });
        if (!creator || creator.role !== "super_admin") {
          throw new Error("Only super_admin can assign roles");
        }
      }
      role = args.role;
    } else {
      // Default to b2b_agent for public signups
      role = "b2b_agent";
    }

    // Hash password using Node.js
    const passwordHash: string = await bcrypt.hash(args.password, 10);

    // Call internal mutation to create admin
    const adminId: Id<"admins"> = await ctx.runMutation(internal.auth.createAdminInternal, {
      email: args.email,
      passwordHash,
      name: args.name,
      role,
      createdBy: args.createdBy as any,
    });

    return adminId;
  },
});

// Action for login
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ token: string; admin: { id: string; email: string; name: string } }> => {
    const admin = await ctx.runQuery(internal.auth.getAdminByEmailInternal, {
      email: args.email,
    });

    if (!admin) {
      throw new Error("Invalid email or password");
    }

    // Compare password using Node.js
    const isValid = await bcrypt.compare(args.password, admin.passwordHash);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token using Node.js
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create session
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await ctx.runMutation(internal.auth.createSessionInternal, {
      adminId: admin._id,
      token,
      expiresAt,
    });

    // Update last login
    await ctx.runMutation(internal.auth.updateLastLoginInternal, {
      adminId: admin._id,
    });

    return { token, admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } };
  },
});

// Action for creating password reset token
export const createPasswordResetToken = action({
  args: { email: v.string() },
  handler: async (ctx, args): Promise<string | null> => {
    const admin = await ctx.runQuery(internal.auth.getAdminByEmailInternal, {
      email: args.email,
    });

    if (!admin) {
      // Don't reveal if email exists
      return null;
    }

    // Generate token using Node.js
    const token = jwt.sign({ adminId: admin._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    await ctx.runMutation(internal.auth.createPasswordResetTokenInternal, {
      adminId: admin._id,
      token,
      expiresAt,
    });

    return token;
  },
});

// Action for resetting password
export const resetPassword = action({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    try {
      // Verify token using Node.js
      const decoded = jwt.verify(args.token, JWT_SECRET) as {
        adminId: string;
      };

      const resetToken = await ctx.runQuery(
        internal.auth.getPasswordResetTokenInternal,
        { token: args.token }
      );

      if (
        !resetToken ||
        resetToken.used ||
        resetToken.expiresAt < Date.now()
      ) {
        throw new Error("Invalid or expired token");
      }

      // Hash new password using Node.js
      const passwordHash = await bcrypt.hash(args.newPassword, 10);

      await ctx.runMutation(internal.auth.resetPasswordInternal, {
        adminId: resetToken.adminId,
        passwordHash,
        resetTokenId: resetToken._id,
      });

      return true;
    } catch {
      throw new Error("Invalid or expired token");
    }
  },
});

