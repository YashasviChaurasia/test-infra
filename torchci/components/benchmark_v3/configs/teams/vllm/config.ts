import { BenchmarkUIConfig } from "../../config_book_types";
import { BenchmarkComparisonPolicyConfig } from "../../helpers/RegressionPolicy";
import {
  BRANCH_METADATA_COLUMN,
  DEFAULT_DASHBOARD_BENCHMARK_INITIAL,
} from "../defaults/default_dashboard_config";

export const VLLM_BENCHMARK_ID = "vllm_benchmark";

// Comparison policies for time-based metrics (lower is better)
const TIME_METRIC_POLICY: BenchmarkComparisonPolicyConfig = {
  target: "time_metric",
  type: "ratio",
  ratioPolicy: {
    badRatio: 1.2,
    goodRatio: 0.8,
    direction: "down",
  },
};

const COMPARISON_POLICY_BOOK = {
  latency: TIME_METRIC_POLICY,
  median_latency_ms: TIME_METRIC_POLICY,
  median_ttft_ms: TIME_METRIC_POLICY,
  median_tpot_ms: TIME_METRIC_POLICY,
  median_itl_ms: TIME_METRIC_POLICY,
  p99_ttft_ms: TIME_METRIC_POLICY,
  p99_tpot_ms: TIME_METRIC_POLICY,
  p99_itl_ms: TIME_METRIC_POLICY,
  requests_per_second: TIME_METRIC_POLICY,
};

const METADATA_COLUMNS = [
  {
    field: "extra_key.hardware_type",
    displayName: "Hardware type",
  },
  {
    field: "arch",
    displayName: "Hardware model",
  },
  {
    field: "extra_key.use_compile",
    displayName: "Use Compile",
  },
  {
    field: "extra_key.request_rate",
    displayName: "Request Rate",
  },
  {
    field: "extra_key.tensor_parallel_size",
    displayName: "Tensor Parallel",
  },
  {
    field: "extra_key.input_len",
    displayName: "Input Len",
  },
  {
    field: "extra_key.output_len",
    displayName: "Max Output Len",
  },
] as const;

export const VllmBenchmarkDashboardConfig: BenchmarkUIConfig = {
  benchmarkId: VLLM_BENCHMARK_ID,
  apiId: VLLM_BENCHMARK_ID,
  title: "VLLM V1 Benchmark",
  type: "dashboard",
  dataBinding: {
    initial: {
      ...DEFAULT_DASHBOARD_BENCHMARK_INITIAL,
      benchmarkId: VLLM_BENCHMARK_ID,
      lbranch: "main",
      rbranch: "main",
      filters: {
        device: "cuda",
        arch: "NVIDIA B200",
        deviceName: "cuda||NVIDIA B200",
      },
    },
    required_filter_fields: [],
  },
  dataRender: {
    type: "auto",
    subSectionRenders: {
      detail_view: {
        filterConstraint: {
          model: {
            disabled: true,
          },
          deviceName: {
            disableOptions: [""],
          },
        },
        renders: [
          {
            type: "AutoBenchmarkMarkDownContent",
            config: {
              content:
                "vLLM V1 Benchmark Dashboard - Compare performance metrics across commits",
            },
          },
          {
            type: "AutoBenchmarkTimeSeriesChartGroup",
            title: "Metrics Time Series Chart Detail View",
            config: {
              type: "line",
              groupByFields: ["metric"],
              lineKey: [
                "model",
                "extra_key.use_compile",
                "extra_key.request_rate",
                "extra_key.input_len",
                "extra_key.output_len",
                "metric",
                "branch",
              ],
              chart: {
                renderOptions: {
                  showLegendDetails: true,
                },
              },
            },
          },
          {
            type: "AutoBenchmarkTimeSeriesTable",
            title: "Comparison Table Detail View",
            config: {
              primary: {
                fields: ["model"],
                displayName: "Model",
              },
              extraMetadata: METADATA_COLUMNS,
              renderOptions: {
                missingText: "",
              },
            },
          },
          {
            type: "AutoBenchmarkRawDataTable",
            title: "Raw Data Table",
            config: {
              extraMetadata: [
                BRANCH_METADATA_COLUMN,
                ...METADATA_COLUMNS,
              ],
            },
          },
        ],
      },
    },
    renders: [
      {
        type: "AutoBenchmarkMarkDownContent",
        config: {
          content:
            "vLLM V1 Benchmark Dashboard - Compare performance metrics across commits",
        },
      },
      {
        type: "AutoBenchmarkPairwiseTable",
        title: "Comparison Table",
        config: {
          primary: {
            fields: ["model"],
            displayName: "Model",
            navigation: {
              type: "subSectionRender",
              value: "detail_view",
              applyFilterFields: ["model", "device", "arch"],
            },
          },
          extraMetadata: METADATA_COLUMNS,
          comparisonPolicy: COMPARISON_POLICY_BOOK,
          renderOptions: {
            missingText: "none",
            bothMissingText: "",
          },
        },
      },
    ],
  },
};
