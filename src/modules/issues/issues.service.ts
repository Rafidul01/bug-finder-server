import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

const createIssueIntoDB = async (payload : IIssue) => {

    console.log(payload)

    const result = await pool.query(`
        INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) 
        RETURNING *
    `,[payload.title,payload.description,payload.type,payload.id]);

    return result.rows[0];

}

export const issueService = {
    createIssueIntoDB
}