import { Router } from "express";
import { issueController } from "./issues.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";
import updateAuth from "../../middleware/updateAuth";
import deleteIssueAuth from "../../middleware/deleteIssueAuth";



const router = Router();



router.post('/',auth(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.cretateIssue)
router.get('/',issueController.getAllIssues)
router.get('/:id',issueController.getSingleIssue)
router.patch('/:id',updateAuth(USER_ROLE.maintainer, USER_ROLE.contributor),issueController.updateIssue)
router.delete('/:id',deleteIssueAuth(USER_ROLE.maintainer),issueController.deleteIssue)


export const issuesRouter = router;
