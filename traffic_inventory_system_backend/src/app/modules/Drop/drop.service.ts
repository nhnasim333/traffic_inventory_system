import { Drop, Purchase, User } from "../../db/models";
import { TCreateDrop } from "./drop.interface";
import { getIO } from "../../socket";

const createDrop = async (payload: TCreateDrop) => {
  const drop = await Drop.create({
    ...payload,
    price: payload.price,
    availableStock: payload.totalStock,
    reservedStock: 0,
    isActive: true,
    dropStartsAt: new Date(payload.dropStartsAt),
  });

  try {
    const io = getIO();
    io.emit("drop:created", {
      id: drop.id,
      name: drop.name,
      description: drop.description,
      price: drop.price,
      imageUrl: drop.imageUrl,
      totalStock: drop.totalStock,
      availableStock: drop.availableStock,
      reservedStock: drop.reservedStock,
      dropStartsAt: drop.dropStartsAt,
      isActive: drop.isActive,
      createdAt: drop.createdAt,
    });
  } catch {
    // Socket not ready yet — ignore
  }

  return drop;
};

const getAllDrops = async () => {
  const drops = await Drop.findAll({
    where: { isActive: true },
    include: [
      {
        model: Purchase,
        as: "purchases",
        limit: 3,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
  return drops;
};

const getDropById = async (id: number) => {
  const drop = await Drop.findByPk(id, {
    include: [
      {
        model: Purchase,
        as: "purchases",
        limit: 3,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "username"],
          },
        ],
      },
    ],
  });
  return drop;
};

export const DropServices = {
  createDrop,
  getAllDrops,
  getDropById,
};
