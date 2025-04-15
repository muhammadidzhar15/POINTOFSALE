import prisma from "../utils/client";
import { logger } from "../utils/winston";
import { purchaseValidation } from "../validations/purchase.validation.js";

export const createPurchase = async (req, res) => {
  try {
    const { error, value } = purchaseValidation(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
        result: null,
      });
    }
    // create prisma transaction
    await prisma.$transaction(async (prisma) => {
      // insert purchase
      const purchase = await prisma.purchase.create({
        data: {
          code: setOrderCode("PUR-"),
          date: value.date,
          note: value.note,
          ppn: Number(value.ppn),
          grandTotal: Number(value.grandTotal),
          userId: Number(value.userId),
        },
      });
      // validasi purchase detail
      if (value.detail.length <= 0) {
        return res.status(400).json({
          message: "purchase detail cannot be empty",
          result: null,
        });
      }
      // insert purchase detail
      for (let i = 0; i < value.detail.length; i++) {
        // check product ada
        if (
          value.detail[i].product.productId === "" ||
          value.detail[i].product.productId === null
        ) {
          throw new Error("product cannot be empty");
        }
        // check qty
        if (value.detail[i].qty == "" || value.detail[i].qty == null) {
          throw new Error("qty cannot be empty");
        }
        // insert purchase detail
        await prisma.purchasedetail.create({
          data: {
            productId: Number(value.detail[i].product.productId),
            productName: value.detail[i].product.productName,
            price: Number(value.detail[i].price),
            qty: Number(value.detail[i].qty),
            total: Number(value.detail[i].totalPrice),
            purchaseId: Number(purchase.id),
          },
        });
        // update stock
        await prisma.product.update({
          where: {
            id: Number(value.detail[i].product.productId),
          },
          data: {
            qty: {
              increment: Number(value.detail[i].qty),
            },
          },
        });
      }
    });
    return res.status(200).json({
      message: "success",
      result: value,
    });
  } catch (error) {
    logger.error(
      "controllers/purchase.controller.js: create purchase - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};
