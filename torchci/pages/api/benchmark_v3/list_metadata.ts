import {
  readApiGetParams,
} from "lib/benchmark/api_helper/backend/common/utils";
import { getListBenchmarkMetadataFetcher } from "lib/benchmark/api_helper/backend/dataFetchers/fetchers";
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
  console.log("[API v3]list_metadata, received request:", params);

  // For v3, we expect params in format: {name, query_params}
  // where name is the benchmark ID (e.g., "vllm_benchmark")
  if (!params || !params.name || !params.query_params) {
    return res.status(400).json({
      error: "Missing parameters: name, query_params",
    });
  }

  const { name, query_params } = params;

  try {
    console.log(`[API v3]list_metadata for benchmark: ${name}`);

    // Get the metadata fetcher for this benchmark type
    const fetcher = getListBenchmarkMetadataFetcher(name);

    // Execute the query
    const data = await fetcher.applyQuery(query_params);

    if (!data) {
      console.log("[API v3]list_metadata: no data found");
      return res.status(200).json({
        data: {
          options: {},
        },
      });
    }

    // Post-process the metadata
    const metadata = fetcher.postProcess(data);

    console.log(
      `[API v3]list_metadata: returning metadata with ${Object.keys(metadata || {}).length} keys`
    );

    return res.status(200).json({
      data: metadata,
    });
  } catch (err: any) {
    console.error("[API v3]list_metadata error:", err.message);
    return res.status(400).json({
      error: err.message || "Failed to fetch metadata",
    });
  }
}
