import { Router } from "express";
import userRouter from "../routes/user.route.js";
import categoryRoute from "../routes/category.routes.js";
import supplierRouter from "./supplier.router.js";

const router = Router();

router.use("/api", userRouter);
router.use("/api", categoryRoute);
router.use("/api", supplierRouter);
router.use("*", (req, res) => {
  res.status(404).json({
    message: "Not Found",
  });
});

export default router;
