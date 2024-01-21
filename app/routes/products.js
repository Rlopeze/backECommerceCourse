import express from "express";
import {
  getProducts,
  createNewProduct,
  getProductDetail,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { isUserAuthenticated, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/products/:id").get(getProductDetail);

router
  .route("/admin/products/:id")
  .put(isUserAuthenticated, authorizeRoles("admin"), updateProduct);
router
  .route("/admin/products/:id")
  .delete(isUserAuthenticated, authorizeRoles("admin"), deleteProduct);
router
  .route("/admin/products/new")
  .post(isUserAuthenticated, authorizeRoles("admin"), createNewProduct);

export default router;
