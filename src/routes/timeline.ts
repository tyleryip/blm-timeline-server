import { Router } from "express";
import { query } from "../util/db";
import { QueryResult } from "pg";

const router = Router();

router.get("/", async (req, res) => {
  query("SELECT * FROM test")
    .then((dbRes: QueryResult<any>) => {
      res.json({
        data: dbRes.rows
      });
    })
    .catch((err: any) => {
      res.status(500).json({ error: err });
    });
});

router.post("/", async (req, res) => {
  res.status(418).json({
    error: "not implemented",
  });
});

export default router;
