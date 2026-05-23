import { pool } from "../../db";
import type { IIssue, IQuery } from "./issues.interface";

const createIssueIntoDB = async (payload: IIssue) => {
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) 
        RETURNING *
    `,
    [payload.title, payload.description, payload.type, payload.id],
  );

  return result.rows[0];
};

const getAllIssuesFromDB = async (payload: IQuery) => {
  const { sort = "newest", type, status } = payload;

  const order = sort === "newest" ? "DESC" : "ASC";

  let result = null;

  if (type && status) {
    result = await pool.query(
      `
            SELECT * FROM issues WHERE type = $1 AND status = $2 ORDER BY created_at ${order}
        `,
      [type, status],
    );

  }

  if (type) {
    result = await pool.query(
      `
            SELECT * FROM issues WHERE type = $1 ORDER BY created_at ${order}
        `,
      [type],
    );
    
  }

  if (status) {
     result = await pool.query(
      `
            SELECT * FROM issues WHERE status = $1 ORDER BY created_at ${order}
        `,
      [status],
    );

   
  }

  if(!type && !status){
    result = await pool.query(
      `
            SELECT * FROM issues ORDER BY created_at ${order}
        `,
    );
  }

  if (!result) {
    throw new Error("No issues found");
  }

  if (result?.rows.length === 0) {
    throw new Error("No issues found");
  }

  const reporterId = result?.rows.map((issue) => issue.reporter_id);

  const reporters = await pool.query(
    `
        SELECT * FROM users WHERE id = ANY($1)
    `,
    [reporterId],
  );

  const mapRepoters = new Map();
  reporters.rows.forEach((reporter) => {
    mapRepoters.set(reporter.id, reporter);
  });

  const issues = result?.rows.map((issue) => {
    const issuesWithoutReporter = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: {
        id: mapRepoters.get(issue.reporter_id).id,
        name: mapRepoters.get(issue.reporter_id).name,
        role: mapRepoters.get(issue.reporter_id).role,
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    };
    return issuesWithoutReporter;
  });

  return issues;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
    `,
    [id],
  );

  const reporterId = result.rows[0].reporter_id;

  const reporter = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
    `,
    [reporterId],
  );

  const singleIssueWithId = {
      id: result.rows[0].id,
      title: result.rows[0].title,
      description: result.rows[0].description,
      type: result.rows[0].type,
      status: result.rows[0].status,
      reporter: {
        id: reporter.rows[0].id,
        name: reporter.rows[0].name,
        role: reporter.rows[0].role,
      },
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
    };

  return singleIssueWithId;
};

export const issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB
};
