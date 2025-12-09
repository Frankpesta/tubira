import { mutation } from "./_generated/server";

// Migration to assign roles to existing admins without roles
// Run this once after deploying the role system
export const assignDefaultRoles = mutation({
  handler: async (ctx) => {
    const admins = await ctx.db.query("admins").collect();
    let updatedCount = 0;

    for (const admin of admins) {
      if (!admin.role) {
        // First admin becomes super_admin, others become b2b_agent
        const isFirstAdmin = updatedCount === 0;
        await ctx.db.patch(admin._id, {
          role: isFirstAdmin ? "super_admin" : "b2b_agent",
        });
        updatedCount++;
      }
    }

    return { updated: updatedCount };
  },
});
