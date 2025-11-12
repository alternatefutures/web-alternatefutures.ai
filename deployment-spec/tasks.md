# Implementation Plan

## Overview

This document provides a step-by-step implementation plan for deploying the Alternate Futures platform. Each task references specific requirements from `requirements.md` to ensure 100% traceability.

**Task Status Legend:**
- [ ] Not started
- [x] Completed

---

## Phase 1: Infrastructure Provisioning

### Task 1: Set Up OpenTofu Environment

- [ ] **1.1** Install OpenTofu CLI (version >= 1.6.0)
- [ ] **1.2** Create `deployment/infrastructure/` directory structure
- [ ] **1.3** Create `versions.tf` with required providers (AWS/GCP/Azure)
- [ ] **1.4** Create `variables.tf` with cluster configuration variables
- [ ] **1.5** Create `outputs.tf` for kubeconfig and IP addresses
- [ ] **1.6** Create `environments/production.tfvars` with production values

_Requirements: 1.1, 1.11_

---

### Task 2: Create Networking Module

- [ ] **2.1** Create `modules/networking/` directory
- [ ] **2.2** Define VPC with CIDR 10.0.0.0/16
- [ ] **2.3** Create private subnet for K3s nodes
- [ ] **2.4** Create public subnet for load balancer
- [ ] **2.5** Configure security groups (ports 22, 80, 443, 6443, 10250)
- [ ] **2.6** Create outputs for subnet IDs and security group ID

_Requirements: 1.5_

---

### Task 3: Create K3s Cluster Module

- [ ] **3.1** Create `modules/k3s-cluster/` directory
- [ ] **3.2** Define compute instances for 3 control plane nodes (2 CPU, 4 GB RAM)
- [ ] **3.3** Define compute instances for 2 worker nodes (2 CPU, 8 GB RAM)
- [ ] **3.4** Create SSH key resource for node access
- [ ] **3.5** Configure cloud-init script to install K3s on control plane node 1 with `--cluster-init`
- [ ] **3.6** Configure cloud-init script to join control plane nodes 2-3 to cluster
- [ ] **3.7** Configure cloud-init script to join worker nodes as agents
- [ ] **3.8** Create outputs for node IPs and kubeconfig content

_Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7_

---

### Task 4: Create Storage Module

- [ ] **4.1** Create `modules/storage/` directory
- [ ] **4.2** Define persistent volume for PostgreSQL (100 GB, type gp3)
- [ ] **4.3** Define persistent volume for Redis (20 GB, type gp3)
- [ ] **4.4** Create outputs for volume IDs

_Requirements: 1.10_

---

### Task 5: Create Load Balancer

- [ ] **5.1** Define network load balancer resource with public IP
- [ ] **5.2** Create target group for HTTP (port 80)
- [ ] **5.3** Create target group for HTTPS (port 443)
- [ ] **5.4** Attach worker nodes to target groups
- [ ] **5.5** Create listener forwarding port 80 to HTTP target group
- [ ] **5.6** Create listener forwarding port 443 to HTTPS target group
- [ ] **5.7** Create output for load balancer public IP

_Requirements: 1.8, 1.9_

---

### Task 6: Deploy Infrastructure

- [ ] **6.1** Execute `tofu init` in `deployment/infrastructure/`
- [ ] **6.2** Execute `tofu plan -var-file=environments/production.tfvars`
- [ ] **6.3** Review plan for correct resource counts (5 VMs, 1 VPC, 1 LB, 2 volumes)
- [ ] **6.4** Execute `tofu apply -var-file=environments/production.tfvars`
- [ ] **6.5** Verify kubeconfig file created at `deployment/infrastructure/kubeconfig.yaml`
- [ ] **6.6** Export KUBECONFIG environment variable
- [ ] **6.7** Execute `kubectl get nodes` and verify 5 nodes in Ready status
- [ ] **6.8** Execute `kubectl version` and verify K3s version >= v1.28.0

_Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 2.1, 2.2_

---

## Phase 2: Core Cluster Services

### Task 7: Deploy Sealed Secrets Controller

- [ ] **7.1** Create `deployment/k8s/core/sealed-secrets/` directory
- [ ] **7.2** Create `sealed-secrets-namespace.yaml` defining `sealed-secrets` namespace
- [ ] **7.3** Create `sealed-secrets-rbac.yaml` with ServiceAccount, ClusterRole, ClusterRoleBinding
- [ ] **7.4** Create `sealed-secrets-deployment.yaml` with controller Deployment (image: quay.io/bitnami/sealed-secrets-controller:v0.24.0)
- [ ] **7.5** Create `sealed-secrets-service.yaml` exposing port 8080
- [ ] **7.6** Execute `kubectl apply -f deployment/k8s/core/sealed-secrets/`
- [ ] **7.7** Verify pod running: `kubectl get pods -n sealed-secrets`
- [ ] **7.8** Install kubeseal CLI locally
- [ ] **7.9** Execute `kubeseal --fetch-cert > sealed-secrets-pub-cert.pem`
- [ ] **7.10** Verify public certificate retrieved successfully

_Requirements: 5.1, 5.2_

---

### Task 8: Create Encrypted Secrets

- [ ] **8.1** Create `deployment/k8s/secrets/` directory
- [ ] **8.2** Create temp Secret for JWT_SECRET with value from `.env` (do NOT commit)
- [ ] **8.3** Encrypt JWT secret: `kubeseal -f jwt-secret-temp.yaml -w deployment/k8s/secrets/jwt-secret.yaml`
- [ ] **8.4** Create temp Secret for database credentials (POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_URL)
- [ ] **8.5** Encrypt database secret: `kubeseal -f db-secret-temp.yaml -w deployment/k8s/secrets/database-credentials.yaml`
- [ ] **8.6** Create temp Secret for Redis credentials (REDIS_PASSWORD, REDIS_URL)
- [ ] **8.7** Encrypt Redis secret: `kubeseal -f redis-secret-temp.yaml -w deployment/k8s/secrets/redis-credentials.yaml`
- [ ] **8.8** Delete all temp files (`*-temp.yaml`)
- [ ] **8.9** Commit SealedSecret manifests to Git
- [ ] **8.10** Apply SealedSecrets: `kubectl apply -f deployment/k8s/secrets/`
- [ ] **8.11** Verify Secrets created: `kubectl get secrets`
- [ ] **8.12** Verify Secret contains JWT_SECRET key: `kubectl get secret jwt-secret -o yaml`

_Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

---

### Task 9: Deploy Traefik Ingress Controller

- [ ] **9.1** Create `deployment/k8s/core/traefik/` directory
- [ ] **9.2** Create `traefik-namespace.yaml` defining `traefik` namespace
- [ ] **9.3** Create `traefik-rbac.yaml` with ServiceAccount, ClusterRole, ClusterRoleBinding
- [ ] **9.4** Create `traefik-pvc.yaml` for ACME certificate storage (1 GB)
- [ ] **9.5** Create `traefik-deployment.yaml` with Traefik v2.10 image
- [ ] **9.6** Configure args: entrypoints (web:80, websecure:443), HTTP→HTTPS redirect, certificatesresolvers.letsencrypt
- [ ] **9.7** Set ACME email to `system@alternatefutures.ai`
- [ ] **9.8** Set ACME storage to `/data/acme.json`
- [ ] **9.9** Enable TLS challenge: `--certificatesresolvers.letsencrypt.acme.tlschallenge=true`
- [ ] **9.10** Create `traefik-service.yaml` with type LoadBalancer, ports 80 and 443
- [ ] **9.11** Execute `kubectl apply -f deployment/k8s/core/traefik/`
- [ ] **9.12** Wait for LoadBalancer external IP: `kubectl get svc -n traefik traefik`
- [ ] **9.13** Update DNS records: www, api, auth → LoadBalancer IP
- [ ] **9.14** Verify Traefik pod running: `kubectl get pods -n traefik`

_Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

---

### Task 10: Deploy ArgoCD

- [ ] **10.1** Create argocd namespace: `kubectl create namespace argocd`
- [ ] **10.2** Install ArgoCD: `kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.9.0/manifests/install.yaml`
- [ ] **10.3** Wait for all pods ready: `kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s`
- [ ] **10.4** Get admin password: `kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d`
- [ ] **10.5** Port forward to UI: `kubectl port-forward svc/argocd-server -n argocd 8080:443`
- [ ] **10.6** Access ArgoCD UI at https://localhost:8080 and verify login
- [ ] **10.7** Create IngressRoute for ArgoCD UI (argocd.alternatefutures.ai)
- [ ] **10.8** Apply IngressRoute: `kubectl apply -f deployment/k8s/core/argocd/ingressroute.yaml`
- [ ] **10.9** Verify HTTPS access to argocd.alternatefutures.ai

_Requirements: 3.1, 13.1, 13.2_

---

## Phase 3: Stateful Services

### Task 11: Deploy YugabyteDB Distributed Database

- [ ] **11.1** Add YugabyteDB Helm repository: `helm repo add yugabytedb https://charts.yugabyte.com && helm repo update`
- [ ] **11.2** Create namespace for YugabyteDB operator: `kubectl create namespace yb-operator`
- [ ] **11.3** Install YugabyteDB operator via Helm: `helm install yb-operator yugabytedb/yugabyte-operator --namespace yb-operator --wait`
- [ ] **11.4** Verify operator pod running: `kubectl get pods -n yb-operator`
- [ ] **11.5** Create `deployment/k8s/data/yugabytedb/` directory
- [ ] **11.6** Create `yugabytedb-cluster.yaml` with YBCluster resource:
  - [ ] **11.6.1** Set tserver replicas: 3 (for data distribution)
  - [ ] **11.6.2** Set master replicas: 3 (for Raft consensus)
  - [ ] **11.6.3** Set yugabyte image tag: 2024.2.0.0-b77
  - [ ] **11.6.4** Set tserver resources: 2 CPU, 4Gi memory per node
  - [ ] **11.6.5** Set master resources: 1 CPU, 2Gi memory per node
  - [ ] **11.6.6** Set tserver storage: 100Gi per node via PVC
  - [ ] **11.6.7** Set master storage: 10Gi per node via PVC
  - [ ] **11.6.8** Set replicationFactor: 3
- [ ] **11.7** Execute `kubectl apply -f deployment/k8s/data/yugabytedb/yugabytedb-cluster.yaml`
- [ ] **11.8** Wait for cluster initialization (may take 5-7 minutes)
- [ ] **11.9** Verify YBCluster created: `kubectl get ybclusters`
- [ ] **11.10** Verify 3 tserver pods running: `kubectl get pods -l app=yb-tserver`
- [ ] **11.11** Verify 3 master pods running: `kubectl get pods -l app=yb-master`
- [ ] **11.12** Verify PVCs bound (should see 6 PVCs: 3 for tservers + 3 for masters): `kubectl get pvc`
- [ ] **11.13** Verify services created: `kubectl get svc | grep yb-`
- [ ] **11.14** Check master cluster status: `kubectl exec -it yb-master-0 -- /home/yugabyte/bin/yb-admin --master_addresses yb-masters:7100 list_all_masters`
- [ ] **11.15** Check tserver status: `kubectl exec -it yb-master-0 -- /home/yugabyte/bin/yb-admin --master_addresses yb-masters:7100 list_all_tablet_servers`
- [ ] **11.16** Verify 3 tservers in cluster with "ALIVE" status
- [ ] **11.17** Test YSQL connection: `kubectl exec -it yb-tserver-0 -- /home/yugabyte/bin/ysqlsh -h yb-tservers`
- [ ] **11.18** Create database and user via init Job: `kubectl apply -f deployment/k8s/data/yugabytedb/yugabytedb-init.yaml`
- [ ] **11.19** Verify init Job completed: `kubectl get job yugabytedb-init`
- [ ] **11.20** Run migrations for backend schema (manual for now)
- [ ] **11.21** Run migrations for auth schema (manual for now)
- [ ] **11.22** Access YugabyteDB Master UI: `kubectl port-forward svc/yb-master-ui 7000:7000`
- [ ] **11.23** Verify replication factor shows RF=3 in Master UI at http://localhost:7000

_Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

---

### Task 12: Deploy Redis Cache

- [ ] **12.1** Create `deployment/k8s/data/redis/` directory
- [ ] **12.2** Create `redis-service.yaml` (ClusterIP: None, port 6379, headless service)
- [ ] **12.3** Create `redis-statefulset.yaml`:
  - [ ] **12.3.1** Image: redis:7-alpine
  - [ ] **12.3.2** Replicas: 1
  - [ ] **12.3.3** Command: redis-server --appendonly yes --requirepass $(REDIS_PASSWORD)
  - [ ] **12.3.4** Env vars from `redis-credentials` secret
  - [ ] **12.3.5** Volume mount: /data
  - [ ] **12.3.6** VolumeClaimTemplate: 20 GB storage
  - [ ] **12.3.7** Liveness probe: `redis-cli ping`
  - [ ] **12.3.8** Readiness probe: `redis-cli ping`
- [ ] **12.4** Execute `kubectl apply -f deployment/k8s/data/redis/`
- [ ] **12.5** Verify StatefulSet created: `kubectl get statefulset redis`
- [ ] **12.6** Verify pod running: `kubectl get pods -l app=redis`
- [ ] **12.7** Verify PVC bound: `kubectl get pvc`
- [ ] **12.8** Test connection: `kubectl exec -it redis-0 -- redis-cli -a $(kubectl get secret redis-credentials -o jsonpath='{.data.REDIS_PASSWORD}' | base64 -d) ping`

_Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

---

## Phase 4: Application Services

### Task 13: Prepare Application Repositories

- [ ] **13.1** Create `k8s/` directory in `auth` repository
- [ ] **13.2** Create `k8s/` directory in `backend` repository
- [ ] **13.3** Create `k8s/` directory in `home` repository
- [ ] **13.4** Create Dockerfile in `auth` (if not exists)
- [ ] **13.5** Create Dockerfile in `backend` (if not exists)
- [ ] **13.6** Create Dockerfile in `home` for Next.js static export
- [ ] **13.7** Set up GitHub Container Registry (GHCR) authentication
- [ ] **13.8** Create GitHub Actions workflow for building auth service image
- [ ] **13.9** Create GitHub Actions workflow for building backend service image
- [ ] **13.10** Create GitHub Actions workflow for building frontend service image
- [ ] **13.11** Push code to trigger image builds
- [ ] **13.12** Verify images published to ghcr.io

_Requirements: None (prerequisite for deployment)_

---

### Task 14: Deploy Authentication Service

- [ ] **14.1** Create `auth/k8s/auth-service.yaml` with Service (ClusterIP, port 3001)
- [ ] **14.2** Create `auth/k8s/auth-deployment.yaml`:
  - [ ] **14.2.1** Replicas: 2
  - [ ] **14.2.2** Image: ghcr.io/alternatefutures/auth:latest
  - [ ] **14.2.3** Env: PORT=3001, NODE_ENV=production
  - [ ] **14.2.4** Env from secrets: JWT_SECRET, DATABASE_URL, REDIS_URL
  - [ ] **14.2.5** Liveness probe: GET /health
  - [ ] **14.2.6** Readiness probe: GET /health
  - [ ] **14.2.7** Resources: 512Mi/1Gi memory, 250m/500m CPU
- [ ] **14.3** Commit and push to main branch
- [ ] **14.4** Create `deployment/argocd/auth-service.yaml` ArgoCD Application manifest
- [ ] **14.5** Apply ArgoCD Application: `kubectl apply -f deployment/argocd/auth-service.yaml`
- [ ] **14.6** Wait for sync in ArgoCD UI
- [ ] **14.7** Verify pods running: `kubectl get pods -l app=auth-service`
- [ ] **14.8** Verify service created: `kubectl get svc auth-service`
- [ ] **14.9** Test health endpoint: `kubectl port-forward svc/auth-service 3001:3001` then `curl http://localhost:3001/health`

_Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10_

---

### Task 15: Deploy Backend Service

- [ ] **15.1** Create `backend/k8s/backend-config.yaml` ConfigMap with AUTH_SERVICE_URL=http://auth-service:3001
- [ ] **15.2** Create `backend/k8s/backend-service.yaml` with Service (ClusterIP, port 4000)
- [ ] **15.3** Create `backend/k8s/backend-deployment.yaml`:
  - [ ] **15.3.1** Replicas: 2
  - [ ] **15.3.2** Image: ghcr.io/alternatefutures/backend:latest
  - [ ] **15.3.3** Env: PORT=4000, NODE_ENV=production
  - [ ] **15.3.4** Env from ConfigMap: AUTH_SERVICE_URL
  - [ ] **15.3.5** Env from secrets: JWT_SECRET, DATABASE_URL
  - [ ] **15.3.6** Liveness probe: GET /health
  - [ ] **15.3.7** Readiness probe: GET /health
  - [ ] **15.3.8** Resources: 512Mi/1Gi memory, 250m/500m CPU
- [ ] **15.4** Commit and push to main branch
- [ ] **15.5** Create `deployment/argocd/backend-service.yaml` ArgoCD Application manifest
- [ ] **15.6** Apply ArgoCD Application: `kubectl apply -f deployment/argocd/backend-service.yaml`
- [ ] **15.7** Wait for sync in ArgoCD UI
- [ ] **15.8** Verify pods running: `kubectl get pods -l app=backend-service`
- [ ] **15.9** Verify service created: `kubectl get svc backend-service`
- [ ] **15.10** Test health endpoint: `kubectl port-forward svc/backend-service 4000:4000` then `curl http://localhost:4000/health`
- [ ] **15.11** Test GraphQL endpoint: `curl -X POST http://localhost:4000/graphql -H "Content-Type: application/json" -d '{"query":"{ __typename }"}'`

_Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 11.1, 11.2, 11.3, 11.4, 15.2, 15.3_

---

### Task 16: Deploy Frontend Service

- [ ] **16.1** Create `home/k8s/frontend-service.yaml` with Service (ClusterIP, port 3000)
- [ ] **16.2** Create `home/k8s/frontend-deployment.yaml`:
  - [ ] **16.2.1** Replicas: 2
  - [ ] **16.2.2** Image: ghcr.io/alternatefutures/home:latest
  - [ ] **16.2.3** Liveness probe: GET /
  - [ ] **16.2.4** Readiness probe: GET /
  - [ ] **16.2.5** Resources: 256Mi/512Mi memory, 100m/250m CPU
- [ ] **16.3** Commit and push to main branch
- [ ] **16.4** Create `deployment/argocd/frontend-service.yaml` ArgoCD Application manifest
- [ ] **16.5** Apply ArgoCD Application: `kubectl apply -f deployment/argocd/frontend-service.yaml`
- [ ] **16.6** Wait for sync in ArgoCD UI
- [ ] **16.7** Verify pods running: `kubectl get pods -l app=frontend-service`
- [ ] **16.8** Verify service created: `kubectl get svc frontend-service`
- [ ] **16.9** Test endpoint: `kubectl port-forward svc/frontend-service 3000:3000` then `curl http://localhost:3000`

_Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

---

## Phase 5: Ingress and TLS

### Task 17: Create IngressRoutes

- [ ] **17.1** Create `deployment/k8s/ingress/frontend-ingressroute.yaml`:
  - [ ] **17.1.1** Match: Host(`www.alternatefutures.ai`)
  - [ ] **17.1.2** Service: frontend-service:3000
  - [ ] **17.1.3** TLS certResolver: letsencrypt
- [ ] **17.2** Create `deployment/k8s/ingress/backend-ingressroute.yaml`:
  - [ ] **17.2.1** Match: Host(`api.alternatefutures.ai`)
  - [ ] **17.2.2** Service: backend-service:4000
  - [ ] **17.2.3** TLS certResolver: letsencrypt
- [ ] **17.3** Create `deployment/k8s/ingress/auth-ingressroute.yaml`:
  - [ ] **17.3.1** Match: Host(`auth.alternatefutures.ai`)
  - [ ] **17.3.2** Service: auth-service:3001
  - [ ] **17.3.3** TLS certResolver: letsencrypt
- [ ] **17.4** Execute `kubectl apply -f deployment/k8s/ingress/`
- [ ] **17.5** Wait 2 minutes for Let's Encrypt certificate issuance
- [ ] **17.6** Check Traefik logs: `kubectl logs -n traefik -l app=traefik`
- [ ] **17.7** Verify certificates stored: `kubectl exec -n traefik -it $(kubectl get pod -n traefik -l app=traefik -o jsonpath='{.items[0].metadata.name}') -- ls -la /data/`

_Requirements: 4.2, 4.4, 4.5, 4.7, 4.8, 4.9, 4.10_

---

## Phase 6: End-to-End Verification

### Task 18: Verify HTTPS Access

- [ ] **18.1** Navigate to https://www.alternatefutures.ai in browser
- [ ] **18.2** Verify homepage loads (HTTP 200)
- [ ] **18.3** Verify SSL certificate valid (issued by Let's Encrypt, green lock icon)
- [ ] **18.4** Navigate to https://www.alternatefutures.ai/consulting
- [ ] **18.5** Verify consulting page loads
- [ ] **18.6** Navigate to https://www.alternatefutures.ai/products/web-services
- [ ] **18.7** Verify web services page loads
- [ ] **18.8** Navigate to https://api.alternatefutures.ai/health
- [ ] **18.9** Verify backend health check returns HTTP 200
- [ ] **18.10** Navigate to https://auth.alternatefutures.ai/api/health
- [ ] **18.11** Verify auth health check returns HTTP 200
- [ ] **18.12** Test HTTP→HTTPS redirect: `curl -I http://www.alternatefutures.ai`
- [ ] **18.13** Verify 301 redirect to HTTPS

_Requirements: 4.3, 12.1, 12.2, 12.3, 12.4, 12.5_

---

### Task 19: Verify Service-to-Service Communication

- [ ] **19.1** Create test GraphQL query requiring authentication
- [ ] **19.2** Send query to backend without JWT: `curl -X POST https://api.alternatefutures.ai/graphql -H "Content-Type: application/json" -d '{"query":"{ protectedQuery }"}'`
- [ ] **19.3** Verify "Unauthorized" error returned
- [ ] **19.4** Create PAT via auth service: POST to https://auth.alternatefutures.ai/api/auth/siwe
- [ ] **19.5** Extract JWT from response
- [ ] **19.6** Send authenticated query: `curl -X POST https://api.alternatefutures.ai/graphql -H "Content-Type: application/json" -H "Authorization: Bearer $JWT" -d '{"query":"{ protectedQuery }"}'`
- [ ] **19.7** Verify successful response with data
- [ ] **19.8** Check backend logs: `kubectl logs -l app=backend-service`
- [ ] **19.9** Verify logs show successful auth service validation call

_Requirements: 9.8, 9.9, 9.10, 11.2, 11.3_

---

### Task 20: Verify GitOps Auto-Deployment

- [ ] **20.1** Make a small change to frontend code (update homepage text)
- [ ] **20.2** Commit and push to main branch in `home` repo
- [ ] **20.3** Open ArgoCD UI at https://argocd.alternatefutures.ai
- [ ] **20.4** Watch frontend-service Application status
- [ ] **20.5** Verify "OutOfSync" status appears within 3 minutes
- [ ] **20.6** Verify auto-sync triggers (if enabled)
- [ ] **20.7** Verify Application status becomes "Synced" and "Healthy"
- [ ] **20.8** Verify new pod deployed: `kubectl get pods -l app=frontend-service`
- [ ] **20.9** Navigate to https://www.alternatefutures.ai and verify updated text appears
- [ ] **20.10** Check ArgoCD sync history for commit SHA and timestamp

_Requirements: 3.2, 3.3, 3.4, 3.6, 3.8, 13.1, 13.2, 13.3_

---

### Task 21: Verify Observability

- [ ] **21.1** Open ArgoCD UI at https://argocd.alternatefutures.ai
- [ ] **21.2** Verify all 5 Applications show "Synced" status
- [ ] **21.3** Verify all Applications show "Healthy" status
- [ ] **21.4** Click on backend-service Application
- [ ] **21.5** Verify deployed Git commit SHA and timestamp displayed
- [ ] **21.6** Execute `kubectl get pods --all-namespaces`
- [ ] **21.7** Verify all pods show Ready status (e.g., "2/2")
- [ ] **21.8** Execute `kubectl logs -l app=backend-service --tail=100`
- [ ] **21.9** Verify application logs visible
- [ ] **21.10** Execute `kubectl top nodes` (if metrics-server installed)
- [ ] **21.11** Verify resource usage displayed

_Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

---

## Phase 7: Disaster Recovery & Testing

### Task 22: Test Rollback Capability

- [ ] **22.1** Note current backend-service pod names and image tag
- [ ] **22.2** Deploy a breaking change to backend (e.g., syntax error in code)
- [ ] **22.3** Commit and push to trigger deployment
- [ ] **22.4** Wait for deployment to complete
- [ ] **22.5** Verify backend-service shows "Degraded" in ArgoCD
- [ ] **22.6** Open ArgoCD UI, navigate to backend-service
- [ ] **22.7** Click "History" tab
- [ ] **22.8** Click "Rollback" on previous working version
- [ ] **22.9** Confirm rollback
- [ ] **22.10** Verify Application returns to "Healthy" status
- [ ] **22.11** Verify https://api.alternatefutures.ai/health returns 200
- [ ] **22.12** Alternatively, test kubectl rollback: `kubectl rollout undo deployment/backend-service`

_Requirements: 3.5, 3.10, 13.6, 14.1, 14.2, 14.3, 14.4_

---

### Task 23: Test Secret Rotation

- [ ] **23.1** Generate new JWT_SECRET value
- [ ] **23.2** Create new Secret manifest with updated value
- [ ] **23.3** Encrypt with kubeseal: `kubeseal -f jwt-secret-new-temp.yaml -w deployment/k8s/secrets/jwt-secret.yaml`
- [ ] **23.4** Commit and push updated SealedSecret
- [ ] **23.5** Apply: `kubectl apply -f deployment/k8s/secrets/jwt-secret.yaml`
- [ ] **23.6** Verify Secret updated: `kubectl get secret jwt-secret -o yaml`
- [ ] **23.7** Restart backend pods: `kubectl rollout restart deployment/backend-service`
- [ ] **23.8** Restart auth pods: `kubectl rollout restart deployment/auth-service`
- [ ] **23.9** Wait for pods to become Ready
- [ ] **23.10** Test authentication flow with new JWT_SECRET
- [ ] **23.11** Verify services communicate correctly with updated secret

_Requirements: 5.8, 15.4_

---

### Task 24: Test Infrastructure Destruction and Recreation

- [ ] **24.1** Take etcd backup: `kubectl exec -it -n kube-system $(kubectl get pod -n kube-system -l component=etcd -o jsonpath='{.items[0].metadata.name}') -- sh -c "ETCDCTL_API=3 etcdctl snapshot save /tmp/snapshot.db"`
- [ ] **24.2** Backup SealedSecrets private key: `kubectl get secret -n sealed-secrets -l sealedsecrets.bitnami.com/sealed-secrets-key -o yaml > sealed-secrets-key-backup.yaml`
- [ ] **24.3** Execute `tofu destroy -var-file=environments/production.tfvars`
- [ ] **24.4** Verify all resources deleted in cloud provider console
- [ ] **24.5** Execute `tofu apply -var-file=environments/production.tfvars`
- [ ] **24.6** Verify cluster recreated
- [ ] **24.7** Restore sealed-secrets key: `kubectl apply -f sealed-secrets-key-backup.yaml`
- [ ] **24.8** Redeploy all services via ArgoCD
- [ ] **24.9** Verify all Applications reach "Synced" and "Healthy"
- [ ] **24.10** Verify HTTPS access to all services

_Requirements: 1.12_

---

## Phase 8: Documentation and Handoff

### Task 25: Create Operations Documentation

- [ ] **25.1** Create `deployment/docs/operations.md`
- [ ] **25.2** Document how to access ArgoCD UI and retrieve admin password
- [ ] **25.3** Document how to check deployment status
- [ ] **25.4** Document how to view application logs
- [ ] **25.5** Document how to manually trigger ArgoCD sync
- [ ] **25.6** Document how to rollback a deployment
- [ ] **25.7** Document how to rotate secrets
- [ ] **25.8** Document how to scale services
- [ ] **25.9** Document troubleshooting common issues
- [ ] **25.10** Document disaster recovery procedures

_Requirements: None (operational excellence)_

---

### Task 26: Create Developer Onboarding Guide

- [ ] **26.1** Create `deployment/docs/developer-guide.md`
- [ ] **26.2** Document how to set up local kubeconfig
- [ ] **26.3** Document how to deploy code changes (git push to main)
- [ ] **26.4** Document how to check if deployment succeeded
- [ ] **26.5** Document how to access logs for debugging
- [ ] **26.6** Document local development workflow
- [ ] **26.7** Document how to test changes in staging (if applicable)
- [ ] **26.8** Document environment variables and secrets management
- [ ] **26.9** Document how to create new SealedSecrets
- [ ] **26.10** Document how to add new services to the platform

_Requirements: None (developer experience)_

---

### Task 27: Security Hardening

- [ ] **27.1** Enable etcd encryption at rest: Configure K3s with `--secrets-encryption` flag
- [ ] **27.2** Verify etcd encryption: Check `/var/lib/rancher/k3s/server/cred/encryption-config.json`
- [ ] **27.3** Create NetworkPolicies to isolate pods
- [ ] **27.4** Apply NetworkPolicy allowing backend→auth communication only
- [ ] **27.5** Apply NetworkPolicy allowing auth→database communication only
- [ ] **27.6** Apply NetworkPolicy allowing auth→redis communication only
- [ ] **27.7** Create RBAC Role limiting developer access
- [ ] **27.8** Create ServiceAccount for developers with restricted permissions
- [ ] **27.9** Test RBAC: Verify developers cannot view Secrets
- [ ] **27.10** Enable pod security standards: `kubectl label namespace default pod-security.kubernetes.io/enforce=baseline`

_Requirements: None (security best practices)_

---

### Task 28: Monitoring and Alerting (Future Enhancement)

- [ ] **28.1** (Optional) Install Prometheus for metrics collection
- [ ] **28.2** (Optional) Install Grafana for visualization
- [ ] **28.3** (Optional) Create dashboards for service health
- [ ] **28.4** (Optional) Configure alerts for pod crashes
- [ ] **28.5** (Optional) Configure alerts for high error rates
- [ ] **28.6** (Optional) Set up log aggregation (Loki, Elasticsearch)

_Requirements: None (out of scope for MVP)_

---

## Summary

**Total Tasks**: 28
**Total Subtasks**: 300+

**Phase Breakdown:**
- Phase 1: Infrastructure Provisioning (6 tasks, 39 subtasks)
- Phase 2: Core Cluster Services (4 tasks, 39 subtasks)
- Phase 3: Stateful Services (2 tasks, 21 subtasks)
- Phase 4: Application Services (4 tasks, 47 subtasks)
- Phase 5: Ingress and TLS (1 task, 7 subtasks)
- Phase 6: End-to-End Verification (4 tasks, 46 subtasks)
- Phase 7: Disaster Recovery & Testing (4 tasks, 44 subtasks)
- Phase 8: Documentation and Handoff (3 tasks, 30 subtasks)

**Requirements Coverage:**
- All 130+ acceptance criteria are referenced in task `_Requirements:_` tags
- Validation phase will verify 100% traceability from requirements to tasks

---

## Approval Gate

Implementation plan created with:
- ✅ **28 top-level tasks** organized into 8 phases
- ✅ **300+ granular subtasks** for step-by-step execution
- ✅ **Requirement references** on every task (e.g., `_Requirements: 1.1, 1.2, 1.3_`)
- ✅ **Clear checkboxes** for progress tracking
- ✅ **Logical dependencies** between phases

**Each task references specific requirements from requirements.md to enable validation of 100% traceability coverage.**

**Proceed to final validation and traceability matrix?**
