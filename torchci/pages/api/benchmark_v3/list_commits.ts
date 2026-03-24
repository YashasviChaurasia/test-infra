import { listBenchmarkCommitsFromDb } from "lib/benchmark/api_helper/backend/list_commits";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Only GET allowed" });
  }

  const {
    id,
    repo,
    startTime,
    stopTime,
    branches,
    models,
    backends,
    device,
    arches,
    dtype,
    mode,
  } = req.query;

  console.log("[API v3]list commits, received request:", {
    id,
    repo,
    startTime,
    stopTime,
  });

  // Validate required parameters
  if (!id || !repo || !startTime || !stopTime) {
    return res.status(400).json({
      error:
        "Missing required parameters: id, repo, startTime, stopTime",
    });
  }

  const queryParams = {
    repo: repo as string,
    benchmarkName: id as string,
    startTime: startTime as string,
    stopTime: stopTime as string,
    branches: branches ? (Array.isArray(branches) ? branches : [branches]) : [],
    models: models ? (Array.isArray(models) ? models : [models]) : [],
    backends: backends ? (Array.isArray(backends) ? backends : [backends]) : [],
    device: (device as string) || "",
    arches: arches ? (Array.isArray(arches) ? arches : [arches]) : [],
    dtype: (dtype as string) || "",
    mode: (mode as string) || "",
  };

  try {
    const result = await listBenchmarkCommitsFromDb(id as string, queryParams, []);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("API v3 error:", err.message);
    return res.status(400).json({ error: err.message });
  }
}
