import prisma from "../utils/client.js";
import { logger } from "../utils/winston.js";
import { supplierValidation } from "../validations/supplier.validation.js";

export const getAllSupplier = async (req, res) => {
  try {
    const last_id = parseInt(req.query.lastId) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search_query || "";

    const whereCondition = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
            { address: { contains: search } },
          ],
        }
      : {};

    const suppliers =
      last_id > 0
        ? await prisma.supplier.findMany({
            where: {
              ...whereCondition,
              id: { lt: last_id },
            },
            take: limit,
            orderBy: { id: "desc" },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              address: true,
            },
          })
        : await prisma.supplier.findMany({
            where: whereCondition,
            take: limit,
            orderBy: { id: "desc" },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              address: true,
            },
          });

    return res.status(200).json({
      message: "Success",
      result: suppliers,
      lastId: suppliers.length > 0 ? suppliers[suppliers.length - 1].id : 0,
      hasMore: suppliers.length >= limit,
    });
  } catch (error) {
    console.error("Error in getAllSupplier:", error);
    logger.error(
      "controllers/supplier.controller.js:getAllSupplier - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
      lastId: 0,
      hasMore: false,
    });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const result = await prisma.supplier.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json({
      message: "success",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/supplier.controller.js:getAllSupplierById - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const createSupplier = async (req, res) => {
  const { error, value } = supplierValidation(req.body);
  if (error != null) {
    return res.status(400).json({
      message: error.details[0].message,
      result: null,
    });
  }
  try {
    const result = await prisma.supplier.create({
      data: {
        firstName: value.firstName,
        lastName: value.lastName,
        phone: value.phone,
        email: value.email ? value.email : null,
        address: value.address,
      },
    });
    return res.status(200).json({
      message: "success",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/supplier.controller.js:createSupplier - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const updateSupplier = async (req, res) => {
  const { error, value } = supplierValidation(req.body);
  if (error != null) {
    return res.status(400).json({
      message: error.details[0].message,
      result: null,
    });
  }
  try {
    const result = await prisma.supplier.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        firstName: value.firstName,
        lastName: value.lastName,
        phone: value.phone,
        email: value.email ? value.email : null,
        address: value.address,
      },
    });
    return res.status(200).json({
      message: "success",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/supplier.controller.js:updateSupplier - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const result = await prisma.supplier.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    return res.status(200).json({
      message: "success",
      result,
    });
  } catch (error) {
    logger.error(
      "controllers/supplier.controller.js:deleteSupplier - " + error.message
    );
    return res.status(500).json({
      message: error.message,
      result: null,
    });
  }
};
