import {
  emptyTimeSeriesResponse,
  readApiGetParams,
} from "lib/benchmark/api_helper/backend/common/utils";
import { getBenchmarkDataFetcher } from "lib/benchmark/api_helper/backend/dataFetchers/fetchers";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Only GET and POST allowed" });
  }

  const params = readApiGetParams(req);
  console.log("[API v3]get_time_series, received request:", params);

  // For v3, we expect params in format: {name, query_params, response_formats}
  // where name is the benchmark ID (e.g., "vllm_benchmark")
  if (!params || !params.name || !params.query_params) {
    return res.status(400).json({
      error: "Missing parameters: name, query_params",
    });
  }

  const { name, query_params, response_formats } = params;

  // Strip trailing 'Z' from timestamps
  if (query_params.startTime) query_params.startTime = query_params.startTime.replace(/Z$/, '');
  if (query_params.stopTime) query_params.stopTime = query_params.stopTime.replace(/Z$/, '');

  try {
    console.log(`[API v3]get_time_series for benchmark: ${name}`);

    // Get the benchmark data fetcher for this benchmark type
    const fetcher = getBenchmarkDataFetcher(name);

    // Execute the query
    const data = await fetcher.applyQuery(query_params);

    if (!data || data.length === 0) {
      console.log("[API v3]get_time_series: no data found");
      return res.status(200).json(emptyTimeSeriesResponse);
    }

    // Apply formatting based on requested response formats
    const formats = response_formats || ["table"];
    const result = fetcher.applyFormat(data, formats);

    console.log(
      `[API v3]get_time_series: returning ${data.length} records in formats: ${formats.join(", ")}`
    );

    return res.status(200).json({
      data: result,
    });
  } catch (err: any) {
    console.error("[API v3]get_time_series error:", err.message);
    return res.status(400).json({
      error: err.message || "Failed to fetch benchmark data",
    });
  }
}
