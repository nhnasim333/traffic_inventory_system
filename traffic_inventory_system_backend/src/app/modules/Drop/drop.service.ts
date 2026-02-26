import { Drop, Purchase, User } from "../../db/models";
import { TCreateDrop } from "./drop.interface";

const createDrop = async (payload: TCreateDrop) => {
  const drop = await Drop.create({
    ...payload,
    price: payload.price,
    availableStock: payload.totalStock,
    reservedStock: 0,
    isActive: true,
    dropStartsAt: new Date(payload.dropStartsAt),
  });
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
