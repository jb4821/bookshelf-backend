import prisma from "../config/db.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        notifications: user.notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, preferredLanguage, notifications } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(preferredLanguage !== undefined && { preferredLanguage }),
        ...(notifications !== undefined && { notifications }),
      },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        preferredLanguage: updated.preferredLanguage,
        notifications: updated.notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};
