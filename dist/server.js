
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  cunnction_string: process.env.CONNECTIONSTRING,
  jwt_secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.cunnction_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(40) NOT NULL,
            email VARCHAR(40) NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                
            )`);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'open',
            reporter_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            
            `);
    console.log("DB is connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// src/utility/AppError.ts
var AppError = class extends Error {
  constructor(message, statusCode) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
  message;
  statusCode;
};
var AppError_default = AppError;

// src/modules/auth/auth.service.ts
var registerUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) 
        RETURNING *
    `, [name, email, hashedPassword, role]);
  delete result.rows[0].password;
  return result.rows[0];
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
    `, [email]);
  if (userData.rows.length === 0) throw new AppError_default("User not found", 404);
  const user = userData.rows[0];
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError_default("Invalid password", 401);
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accesstoke = jwt.sign(jwtpayload, config_default.jwt_secret, {
    expiresIn: "1d"
  });
  delete user.password;
  return {
    token: accesstoke,
    user
  };
};
var authService = {
  registerUserIntoDB,
  loginUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    error: data.error,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.controller.ts
var userRegister = async (req, res, next) => {
  try {
    const result = await authService.registerUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var userLogin = async (req, res, next) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var authController = {
  userRegister,
  userLogin
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.userRegister);
router.post("/login", authController.userLogin);
var authRouter = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload) => {
  const result = await pool.query(
    `
        INSERT INTO issues(title,description,type,reporter_id) VALUES($1,$2,$3,$4) 
        RETURNING *
    `,
    [payload.title, payload.description, payload.type, payload.id]
  );
  return result.rows[0];
};
var getAllIssuesFromDB = async (payload) => {
  const { sort = "newest", type, status } = payload;
  const order = sort === "newest" ? "DESC" : "ASC";
  let result = null;
  if (type && status) {
    result = await pool.query(
      `
            SELECT * FROM issues WHERE type = $1 AND status = $2 ORDER BY created_at ${order}
        `,
      [type, status]
    );
  }
  if (type) {
    result = await pool.query(
      `
            SELECT * FROM issues WHERE type = $1 ORDER BY created_at ${order}
        `,
      [type]
    );
  }
  if (status) {
    result = await pool.query(
      `
            SELECT * FROM issues WHERE status = $1 ORDER BY created_at ${order}
        `,
      [status]
    );
  }
  if (!type && !status) {
    result = await pool.query(
      `
            SELECT * FROM issues ORDER BY created_at ${order}
        `
    );
  }
  if (!result) {
    throw new AppError_default("Something went wrong", 400);
  }
  if (result?.rows.length === 0) {
    throw new AppError_default("Something went wrong", 400);
  }
  const reporterId = result?.rows.map((issue) => issue.reporter_id);
  const reporters = await pool.query(
    `
        SELECT * FROM users WHERE id = ANY($1)
    `,
    [reporterId]
  );
  const mapRepoters = /* @__PURE__ */ new Map();
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
        role: mapRepoters.get(issue.reporter_id).role
      },
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
    return issuesWithoutReporter;
  });
  return issues;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        SELECT * FROM issues WHERE id = $1
    `,
    [id]
  );
  const reporterId = result.rows[0].reporter_id;
  const reporter = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
    `,
    [reporterId]
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
      role: reporter.rows[0].role
    },
    created_at: result.rows[0].created_at,
    updated_at: result.rows[0].updated_at
  };
  return singleIssueWithId;
};
var updateIssueIntoDB = async (id, payload) => {
  const result = await pool.query(
    `
        UPDATE issues SET title = $1, description = $2, type = $3, status = 'in_progress' WHERE id = $4 RETURNING *
    `,
    [payload.title, payload.description, payload.type, id]
  );
  return result.rows[0];
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
          DELETE FROM issues WHERE id = $1 RETURNING *
      `,
    [id]
  );
  return result.rows[0];
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueIntoDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var cretateIssue = async (req, res, next) => {
  try {
    const result = await issueService.createIssueIntoDB({
      ...req.body,
      ...req.user
    });
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getAllIssues = async (req, res, next) => {
  try {
    const sort = req.query.sort;
    const type = req.query.type;
    const status = req.query.status;
    const result = await issueService.getAllIssuesFromDB({
      sort,
      type,
      status
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issues fetched successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var getSingleIssue = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await issueService.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
var updateIssue = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await issueService.updateIssueIntoDB(id, req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
var deleteIssue = async (req, res, next) => {
  try {
    const id = req.params.id;
    await issueService.deleteIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};
var issueController = {
  cretateIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "Invalid token"
      });
    }
    const decoded = jwt2.verify(
      token,
      config_default.jwt_secret
    );
    const userData = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [decoded.id]);
    if (userData.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "User not found"
      });
    }
    if (roles.length && !roles.includes(userData.rows[0].role)) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "Access denied"
      });
    }
    const user = userData.rows[0];
    req.user = user;
    next();
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/updateAuth.ts
import jwt3 from "jsonwebtoken";
import "cors";
var updateAuth = (...roles) => {
  return async (req, res, next) => {
    const id = req.params.id;
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "Invalid token"
      });
    }
    const decoded = jwt3.verify(
      token,
      config_default.jwt_secret
    );
    const userData = await pool.query(
      `
            SELECT * FROM users WHERE id = $1
        `,
      [decoded.id]
    );
    if (userData.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "User not found"
      });
    }
    if (roles.length && !roles.includes(userData.rows[0].role)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "Access denied"
      });
    }
    const issueData = await pool.query(
      `
                SELECT * FROM issues WHERE id = $1
            `,
      [id]
    );
    if (issueData.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        error: "Issue not found"
      });
    }
    if (userData.rows[0].role == "contributor") {
      if (userData.rows[0].id !== issueData.rows[0].reporter_id || issueData.rows[0].status !== "open") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          error: "Access denied"
        });
      }
      const user2 = userData.rows[0];
      req.user = user2;
      next();
      return;
    }
    const user = userData.rows[0];
    req.user = user;
    next();
  };
};
var updateAuth_default = updateAuth;

// src/middleware/deleteIssueAuth.ts
import jwt4 from "jsonwebtoken";
var deleteIssueAuth = (...roles) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "Invalid token"
      });
    }
    const decoded = jwt4.verify(
      token,
      config_default.jwt_secret
    );
    const userData = await pool.query(`
            SELECT * FROM users WHERE id = $1
        `, [decoded.id]);
    if (userData.rows.length === 0) {
      return sendResponse_default(res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        error: "User not found"
      });
    }
    if (roles.length && userData.rows[0].role !== "maintainer") {
      return res.status(401).json({
        "success": false,
        "message": "Unauthorized",
        "error": "Access denied"
      });
    }
    const user = userData.rows[0];
    req.user = user;
    next();
  };
};
var deleteIssueAuth_default = deleteIssueAuth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.cretateIssue);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", updateAuth_default(USER_ROLE.maintainer, USER_ROLE.contributor), issueController.updateIssue);
router2.delete("/:id", deleteIssueAuth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issuesRouter = router2;

// src/app.ts
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  sendResponse_default(res, {
    statusCode,
    success: false,
    message: err.message || "Internal Server Error",
    error: err
  });
};

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
var corsOptions = {
  origin: "http://localhost:3000"
};
app.use(cors(corsOptions));
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler);
var app_default = app;

// src/server.ts
var port = config_default.port;
var main = () => {
  initDB();
  app_default.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};
main();
//# sourceMappingURL=server.js.map