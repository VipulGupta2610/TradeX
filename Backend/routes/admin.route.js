import express from "express"
import { Number_of_users } from "../controllers/admin.controller.js"

const router = express.Router()

router.get("/AdminDashboard",Number_of_users)

export default router;