# vLLM Benchmark Dashboard Deployment

## Architecture

Server-side Next.js (standalone mode) deployment on OpenShift. The Next.js backend
queries ClickHouse directly — no credentials are exposed to the browser.

```
Browser → OpenShift Route (TLS) → Pod (Next.js :3000) → ClickHouse (cluster-internal)
```

## Image

```
icr.io/yashasvichaurasia/torchci-vllm:latest
```

Built from `spyre-dashboard` branch of `YashasviChaurasia/test-infra` using the
Dockerfile at `/tmp/torchci-build/Dockerfile` on the build host.

### Rebuilding the Image

```bash
# SSH to build host
ssh yashasvi@aiplatformwh.vpc.cloud9.ibm.com

# Login to IBM Container Registry
ibmcloud target -g irlhc4
ibmcloud cr region-set global
ibmcloud cr login

# Build and push
cd /tmp/torchci-build
docker build --no-cache -t icr.io/yashasvichaurasia/torchci-vllm:latest .
docker push icr.io/yashasvichaurasia/torchci-vllm:latest
```

### Redeploying (after image push)

```bash
oc delete pod vllm-bench-spyre-pod -n torch-spyre-cicd
# Pod will be recreated by the Helm release, or re-apply manually
```

## Deployment with Helm

```bash
# First time
helm install vllm-bench-spyre deploy/helm/ \
  --namespace torch-spyre-cicd \
  --set secrets.clickhousePassword="<CH_PASSWORD>" \
  --set secrets.authSecret="<RANDOM_SECRET>" \
  --set secrets.jwtSecret="<RANDOM_SECRET>" \
  --set secrets.githubClientId="<OAUTH_CLIENT_ID>" \
  --set secrets.githubClientSecret="<OAUTH_CLIENT_SECRET>"

# Upgrade
helm upgrade vllm-bench-spyre deploy/helm/ --namespace torch-spyre-cicd

# Uninstall
helm uninstall vllm-bench-spyre --namespace torch-spyre-cicd
```

## Manual Deployment (current state)

Resources created manually:
- **ConfigMap**: `vllm-bench-spyre-config`
- **Secret**: `vllm-bench-spyre-secrets`
- **Pod**: `vllm-bench-spyre-pod`
- **Service**: `vllm-bench-spyre-svc`
- **Route**: `vllm-bench-spyre-dashboard`
- **Pull Secret**: `icr-pull-secret` (IBM CR API key)

## Cluster Details

| Key | Value |
|-----|-------|
| Cluster | `api.torch-cicd.spyre.res.ibm.com:6443` |
| Namespace | `torch-spyre-cicd` |
| Dashboard URL | `https://vllm-bench-spyre-dashboard-torch-spyre-cicd.apps.torch-cicd.spyre.res.ibm.com/benchmark/v3/dashboard/spyre_e2e_benchmark` |
| ClickHouse (internal) | `http://spyre-dashboard-clickhouse.clickhouse.svc:8123` |
| ClickHouse (external) | `https://spyre-dashboard-clickhouse-clickhouse.apps.torch-cicd.spyre.res.ibm.com` |
| Image Registry | `icr.io/yashasvichaurasia/torchci-vllm:latest` |
| ICR Namespace | `yashasvichaurasia` (resource group: `irlhc4`) |

## Fixes Applied (over upstream torchci)

| Fix | File | Issue |
|-----|------|-------|
| Add `repo` field to spyre config | `components/benchmark_v3/configs/teams/vllm/spyre_config.ts` | Metadata/commit queries require `repo` param; config didn't provide it |
| Webpack `resolve.modules` | `next.config.js` | Standalone build can't resolve bare imports like `lib/fetchCommit` without explicit module path resolution |
| Strip trailing `Z` from timestamps | `pages/api/benchmark_v3/*.ts` | ClickHouse `DateTime64(3)` param binding rejects ISO `Z` suffix |

## Branch History

```
spyre-dashboard branch:
  8d4c9c4f  Point dashboard queries to vllm_benchmarks.results_v3 and run_metadata
  aa4d3e40  fix: register spyre data/metadata fetchers and add throughput comparison policies
  ee53335e  Merge branch 'pytorch:main' into spyre-dashboard  (upstream base)
  +         server-side fixes (repo, webpack, timestamps)  ← current HEAD
```

## GitHub OAuth

- **App**: Configured at https://github.com/settings/developers
- **Homepage URL**: `https://vllm-bench-spyre-dashboard-torch-spyre-cicd.apps.torch-cicd.spyre.res.ibm.com`
- **Callback URL**: `https://vllm-bench-spyre-dashboard-torch-spyre-cicd.apps.torch-cicd.spyre.res.ibm.com/api/auth/callback/github`
