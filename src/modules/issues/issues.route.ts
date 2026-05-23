import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth";



const router = Router();



router.post('/',auth(), issueController.cretateIssue)


export const issuesRouter = router;
