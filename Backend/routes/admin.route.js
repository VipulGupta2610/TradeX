import express from "express"
import { fetch_bugs, Number_of_users } from "../controllers/admin.controller.js"

const router = express.Router()

router.get("/AdminDashboard",Number_of_users)
router.get("/AdminDashboard/bugs", fetch_bugs)

export default router;