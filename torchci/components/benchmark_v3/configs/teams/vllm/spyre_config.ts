import { BenchmarkUIConfig } from "../../config_book_types";
import { BenchmarkComparisonPolicyConfig } from "../../helpers/RegressionPolicy";
import {
  BRANCH_METADATA_COLUMN,
  DEFAULT_DASHBOARD_BENCHMARK_INITIAL,
} from "../defaults/default_dashboard_config";

export const SPYRE_E2E_BENCHMARK_ID = "spyre_e2e_benchmark";

const TIME_METRIC_POLICY: BenchmarkComparisonPolicyConfig = {
  target: "time_metric",
  type: "ratio",
  ratioPolicy: {
    badRatio: 1.2,
    goodRatio: 0.8,
    direction: "down",
  },
};

const THROUGHPUT_METRIC_POLICY: BenchmarkComparisonPolicyConfig = {
  target: "throughput_metric",
  type: "ratio",
  ratioPolicy: {
    badRatio: 0.8,
    goodRatio: 1.2,
    direction: "up",
  },
};

const COMPARISON_POLICY_BOOK = {
  latency: TIME_METRIC_POLICY,
  median_latency_ms: TIME_METRIC_POLICY,
  p99_latency_ms: TIME_METRIC_POLICY,
  tokens_per_second: THROUGHPUT_METRIC_POLICY,
  requests_per_second: THROUGHPUT_METRIC_POLICY,
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

export const SpyreE2eBenchmarkDashboardConfig: BenchmarkUIConfig = {
  benchmarkId: SPYRE_E2E_BENCHMARK_ID,
  apiId: SPYRE_E2E_BENCHMARK_ID,
  title: "Spyre E2E Benchmark",
  type: "dashboard",
  dataBinding: {
    initial: {
      ...DEFAULT_DASHBOARD_BENCHMARK_INITIAL,
      benchmarkId: SPYRE_E2E_BENCHMARK_ID,
      repo: "spyre-inference",
      lbranch: "main",
      rbranch: "main",
      filters: {
        device: "spyre",
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
                "IBM Spyre E2E Benchmark Dashboard - Compare vLLM performance on Spyre accelerators",
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
            "IBM Spyre E2E Benchmark Dashboard - Compare vLLM performance on Spyre accelerators",
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
