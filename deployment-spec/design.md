# Design Document

## 1. Overview

This document provides detailed design specifications for implementing the Alternate Futures deployment architecture. Each component from the blueprint is elaborated with file locations, configuration details, API interfaces, and references to requirements.

## 2. Design Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Infrastructure as Code** | All infrastructure defined in version-controlled code | OpenTofu modules in `infrastructure/` directory |
| **GitOps** | Git as single source of truth for cluster state | ArgoCD Applications reference GitHub repos |
| **Declarative Configuration** | Desired state declared, system converges to it | Kubernetes YAML manifests, OpenTofu HCL |
| **Security by Default** | Secrets encrypted, TLS everywhere, least privilege | Sealed Secrets, RBAC, network policies |
| **Observability** | System state visible through UIs and logs | ArgoCD UI, Traefik dashboard, kubectl logs |
| **Idempotency** | Operations can be repeated safely | `tofu apply`, `kubectl apply`, ArgoCD sync |

---

## 3. File Structure

```
deployment/
├── infrastructure/           # OpenTofu IaC
│   ├── main.tf              # Root module
│   ├── variables.tf         # Input variables
│   ├── outputs.tf           # Outputs (kubeconfig, IPs)
│   ├── versions.tf          # Provider versions
│   ├── modules/
│   │   ├── k3s-cluster/     # K3s cluster module
│   │   ├── networking/      # VPC, subnets, firewall
│   │   └── storage/         # Persistent volumes
│   └── environments/
│       ├── production.tfvars
│       └── staging.tfvars
├── k8s/                     # Kubernetes manifests
│   ├── core/                # Core cluster services
│   │   ├── sealed-secrets/  # SealedSecret controller
│   │   ├── traefik/         # Ingress controller
│   │   └── argocd/          # GitOps controller
│   ├── data/                # Stateful services
│   │   ├── postgresql/      # Database
│   │   └── redis/           # Cache
│   ├── apps/                # Application services
│   │   ├── auth-service/    # Authentication API
│   │   ├── backend-service/ # GraphQL API
│   │   └── frontend-service/# Next.js site
│   └── secrets/             # SealedSecret manifests
│       ├── jwt-secret.yaml
│       ├── database-credentials.yaml
│       └── redis-credentials.yaml
└── argocd/                  # ArgoCD Application manifests
    ├── auth-service.yaml
    ├── backend-service.yaml
    ├── frontend-service.yaml
    ├── postgresql.yaml
    └── redis.yaml
```

---

## 4. Component Specifications

### Component: InfraProvisioner

**Purpose**: Provision K3s cluster infrastructure using OpenTofu

**Location**: `deployment/infrastructure/`

**Requirements Implemented**: Req 1.1-1.12

**Interface**:
```hcl
# variables.tf
variable "cluster_name" {
  description = "Name of the K3s cluster"
  type        = string
  default     = "alternatefutures-prod"
}

variable "control_plane_count" {
  description = "Number of control plane nodes"
  type        = number
  default     = 3
}

variable "worker_count" {
  description = "Number of worker nodes"
  type        = number
  default     = 2
}

variable "control_plane_instance_type" {
  description = "Instance type for control plane (min 2 CPU, 4GB RAM)"
  type        = string
  default     = "t3.medium"  # AWS example
}

variable "worker_instance_type" {
  description = "Instance type for workers (min 2 CPU, 8GB RAM)"
  type        = string
  default     = "t3.large"  # AWS example
}

variable "region" {
  description = "Cloud provider region"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for node access"
  type        = string
}
```

**Outputs**:
```hcl
# outputs.tf
output "kubeconfig" {
  description = "Path to kubeconfig file"
  value       = local_file.kubeconfig.filename
  sensitive   = true
}

output "load_balancer_ip" {
  description = "Public IP of load balancer"
  value       = module.networking.lb_public_ip
}

output "control_plane_ips" {
  description = "Private IPs of control plane nodes"
  value       = module.k3s_cluster.control_plane_ips
}

output "worker_ips" {
  description = "Private IPs of worker nodes"
  value       = module.k3s_cluster.worker_ips
}
```

**Main Configuration** (`main.tf`):
```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {  # Example: AWS provider
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }
}

# VPC and networking
module "networking" {
  source = "./modules/networking"

  cluster_name = var.cluster_name
  vpc_cidr     = "10.0.0.0/16"
  region       = var.region
}

# K3s cluster nodes
module "k3s_cluster" {
  source = "./modules/k3s-cluster"

  cluster_name              = var.cluster_name
  control_plane_count       = var.control_plane_count
  worker_count              = var.worker_count
  control_plane_instance_type = var.control_plane_instance_type
  worker_instance_type      = var.worker_instance_type
  subnet_id                 = module.networking.private_subnet_id
  security_group_id         = module.networking.security_group_id
  ssh_public_key            = var.ssh_public_key
}

# Persistent storage
module "storage" {
  source = "./modules/storage"

  cluster_name = var.cluster_name
  region       = var.region

  volumes = {
    postgresql = {
      size_gb = 100
      type    = "gp3"
    }
    redis = {
      size_gb = 20
      type    = "gp3"
    }
  }
}

# Load balancer
resource "aws_lb" "k3s" {
  name               = "${var.cluster_name}-lb"
  internal           = false
  load_balancer_type = "network"
  subnets            = [module.networking.public_subnet_id]

  tags = {
    Name    = "${var.cluster_name}-lb"
    Cluster = var.cluster_name
  }
}

resource "aws_lb_target_group" "http" {
  name     = "${var.cluster_name}-http"
  port     = 80
  protocol = "TCP"
  vpc_id   = module.networking.vpc_id
}

resource "aws_lb_target_group" "https" {
  name     = "${var.cluster_name}-https"
  port     = 443
  protocol = "TCP"
  vpc_id   = module.networking.vpc_id
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.k3s.arn
  port              = "80"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.http.arn
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.k3s.arn
  port              = "443"
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.https.arn
  }
}

# Output kubeconfig
resource "local_file" "kubeconfig" {
  content  = module.k3s_cluster.kubeconfig
  filename = "${path.module}/kubeconfig.yaml"
  file_permission = "0600"
}
```

**Usage**:
```bash
cd deployment/infrastructure
tofu init
tofu plan -var-file=environments/production.tfvars
tofu apply -var-file=environments/production.tfvars
export KUBECONFIG=$(tofu output -raw kubeconfig)
kubectl get nodes
```

---

### Component: OrchestrationLayer

**Purpose**: Run containerized workloads on K3s

**Location**: Provisioned by InfraProvisioner

**Requirements Implemented**: Req 2.1-2.8, 11.1, 13.4-13.5, 14.1-14.4, 15.1-15.4

**Configuration** (installed by K3s module):
```yaml
# /etc/rancher/k3s/config.yaml (on control plane nodes)
write-kubeconfig-mode: "0644"
tls-san:
  - "${load_balancer_ip}"
cluster-cidr: "10.42.0.0/16"
service-cidr: "10.43.0.0/16"
disable:
  - traefik  # We'll install Traefik manually for better control
etcd-snapshot-schedule-cron: "0 */6 * * *"  # Backup every 6 hours
etcd-snapshot-retention: 5
```

**K3s Installation** (executed by OpenTofu):
```bash
# Control plane node 1 (initial)
curl -sfL https://get.k3s.io | sh -s - server \
  --cluster-init \
  --token=${K3S_TOKEN} \
  --tls-san=${LOAD_BALANCER_IP}

# Control plane nodes 2-3
curl -sfL https://get.k3s.io | sh -s - server \
  --server https://${CONTROL_PLANE_1_IP}:6443 \
  --token=${K3S_TOKEN}

# Worker nodes
curl -sfL https://get.k3s.io | sh -s - agent \
  --server https://${LOAD_BALANCER_IP}:6443 \
  --token=${K3S_TOKEN}
```

**Resource Quotas** (`k8s/core/resource-quotas.yaml`):
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: app-quota
  namespace: default
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    persistentvolumeclaims: "10"
```

---

### Component: SecretsManager

**Purpose**: Encrypt secrets for Git storage using Sealed Secrets

**Location**: `k8s/core/sealed-secrets/`

**Requirements Implemented**: Req 5.1-5.8

**Deployment** (`sealed-secrets-deployment.yaml`):
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sealed-secrets
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sealed-secrets-controller
  namespace: sealed-secrets
spec:
  replicas: 1
  selector:
    matchLabels:
      name: sealed-secrets-controller
  template:
    metadata:
      labels:
        name: sealed-secrets-controller
    spec:
      serviceAccountName: sealed-secrets-controller
      containers:
      - name: sealed-secrets-controller
        image: quay.io/bitnami/sealed-secrets-controller:v0.24.0
        command:
        - controller
        ports:
        - containerPort: 8080
          name: http
        livenessProbe:
          httpGet:
            path: /healthz
            port: http
        readinessProbe:
          httpGet:
            path: /healthz
            port: http
        securityContext:
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 1001
---
apiVersion: v1
kind: Service
metadata:
  name: sealed-secrets-controller
  namespace: sealed-secrets
spec:
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    name: sealed-secrets-controller
```

**RBAC** (`sealed-secrets-rbac.yaml`):
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sealed-secrets-controller
  namespace: sealed-secrets
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: sealed-secrets-controller
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list", "create", "update", "delete"]
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets"]
  verbs: ["get", "list", "watch", "update"]
- apiGroups: ["bitnami.com"]
  resources: ["sealedsecrets/status"]
  verbs: ["update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: sealed-secrets-controller
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: sealed-secrets-controller
subjects:
- kind: ServiceAccount
  name: sealed-secrets-controller
  namespace: sealed-secrets
```

**Usage Example**:
```bash
# Install kubeseal CLI
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.24.0/kubeseal-linux-amd64
chmod +x kubeseal-linux-amd64
sudo mv kubeseal-linux-amd64 /usr/local/bin/kubeseal

# Create a secret locally (never commit this!)
kubectl create secret generic jwt-secret \
  --from-literal=JWT_SECRET='BMIhItnqgDLsFPIw2p03SUF2UFEFKfVgXCr3FM+Rk8E91AexGGDE88jeVmoKECog' \
  --dry-run=client -o yaml > jwt-secret-temp.yaml

# Encrypt it with cluster public key
kubeseal -f jwt-secret-temp.yaml -w k8s/secrets/jwt-secret.yaml

# Delete temp file, commit sealed secret to Git
rm jwt-secret-temp.yaml
git add k8s/secrets/jwt-secret.yaml
git commit -m "Add JWT secret (encrypted)"
```

**SealedSecret Example** (`k8s/secrets/jwt-secret.yaml`):
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: jwt-secret
  namespace: default
spec:
  encryptedData:
    JWT_SECRET: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq...  # Encrypted value
  template:
    metadata:
      name: jwt-secret
      namespace: default
    type: Opaque
```

---

### Component: IngressController

**Purpose**: Route HTTP/HTTPS traffic and manage SSL certificates

**Location**: `k8s/core/traefik/`

**Requirements Implemented**: Req 4.1-4.11, 12.1-12.5

**Deployment** (`traefik-deployment.yaml`):
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: traefik
  namespace: traefik
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  selector:
    matchLabels:
      app: traefik
  template:
    metadata:
      labels:
        app: traefik
    spec:
      serviceAccountName: traefik
      containers:
      - name: traefik
        image: traefik:v2.10
        args:
        - --api.dashboard=true
        - --providers.kubernetescrd=true
        - --entrypoints.web.address=:80
        - --entrypoints.web.http.redirections.entrypoint.to=websecure
        - --entrypoints.web.http.redirections.entrypoint.scheme=https
        - --entrypoints.websecure.address=:443
        - --certificatesresolvers.letsencrypt.acme.email=system@alternatefutures.ai
        - --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json
        - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
        - --log.level=INFO
        ports:
        - name: web
          containerPort: 80
        - name: websecure
          containerPort: 443
        - name: dashboard
          containerPort: 8080
        volumeMounts:
        - name: acme-storage
          mountPath: /data
      volumes:
      - name: acme-storage
        persistentVolumeClaim:
          claimName: traefik-acme-storage
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: traefik-acme-storage
  namespace: traefik
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: traefik
  namespace: traefik
spec:
  type: LoadBalancer
  selector:
    app: traefik
  ports:
  - name: web
    port: 80
    targetPort: 80
  - name: websecure
    port: 443
    targetPort: 443
```

**RBAC** (`traefik-rbac.yaml`):
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: traefik
rules:
- apiGroups: [""]
  resources: ["services", "endpoints", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["extensions", "networking.k8s.io"]
  resources: ["ingresses", "ingressclasses"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["extensions", "networking.k8s.io"]
  resources: ["ingresses/status"]
  verbs: ["update"]
- apiGroups: ["traefik.containo.us"]
  resources: ["ingressroutes", "middlewares", "tlsoptions", "traefikservices"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: traefik
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: traefik
subjects:
- kind: ServiceAccount
  name: traefik
  namespace: traefik
```

**IngressRoute Examples** (`k8s/apps/*/ingressroute.yaml`):
```yaml
# Frontend
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: frontend
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`www.alternatefutures.ai`)
    kind: Rule
    services:
    - name: frontend-service
      port: 3000
  tls:
    certResolver: letsencrypt
---
# Backend
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: backend
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`api.alternatefutures.ai`)
    kind: Rule
    services:
    - name: backend-service
      port: 4000
  tls:
    certResolver: letsencrypt
---
# Auth
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: auth
  namespace: default
spec:
  entryPoints:
  - websecure
  routes:
  - match: Host(`auth.alternatefutures.ai`)
    kind: Rule
    services:
    - name: auth-service
      port: 3001
  tls:
    certResolver: letsencrypt
```

---

### Component: GitOpsController

**Purpose**: Automate deployment from GitHub using ArgoCD

**Location**: `k8s/core/argocd/`

**Requirements Implemented**: Req 3.1-3.10, 13.1-13.3, 13.6, 14.2-14.3

**Installation**:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/v2.9.0/manifests/install.yaml
```

**ArgoCD Application Manifests** (`argocd/backend-service.yaml`):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/alternatefutures/backend
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
  revisionHistoryLimit: 10
```

**Application for Auth Service** (`argocd/auth-service.yaml`):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/alternatefutures/auth
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Application for Frontend** (`argocd/frontend-service.yaml`):
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend-service
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/alternatefutures/web-alternatefutures.ai
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**Access ArgoCD UI**:
```bash
# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Access at https://localhost:8080
# Username: admin
# Password: (from above command)
```

---

### Component: DatabaseService

**Purpose**: Persist application data in distributed YugabyteDB cluster

**Location**: `k8s/data/yugabytedb/`

**Requirements Implemented**: Req 6.1-6.9

**YugabyteDB Operator Installation**:
```bash
# Add YugabyteDB Helm repository
helm repo add yugabytedb https://charts.yugabyte.com
helm repo update

# Install YugabyteDB Operator
kubectl create namespace yb-operator
helm install yb-operator yugabytedb/yugabyte-operator --namespace yb-operator --wait
```

**YugabyteDB Cluster Resource** (`yugabytedb-cluster.yaml`):
```yaml
apiVersion: yugabyte.com/v1alpha1
kind: YBCluster
metadata:
  name: alternatefutures-db
  namespace: default
spec:
  image:
    repository: yugabytedb/yugabyte
    tag: 2024.2.0.0-b77
    pullPolicy: IfNotPresent

  tserver:
    replicas: 3  # 3 tablet servers for data distribution
    resources:
      requests:
        cpu: "2"
        memory: "4Gi"
      limits:
        cpu: "2"
        memory: "4Gi"
    volumeClaimTemplate:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 100Gi
      storageClassName: standard
    gflags:
    - key: "max_stale_read_bound_time_ms"
      value: "60000"
    - key: "ysql_num_shards_per_tserver"
      value: "2"

  master:
    replicas: 3  # 3 masters for Raft consensus
    resources:
      requests:
        cpu: "1"
        memory: "2Gi"
      limits:
        cpu: "1"
        memory: "2Gi"
    volumeClaimTemplate:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi
      storageClassName: standard

  replicationFactor: 3  # RF=3 for high availability

  enableLoadBalancer: false  # Use ClusterIP within cluster

  tls:
    enabled: false  # Can enable for production
```

**Services Created Automatically**:
```yaml
# The operator automatically creates:
# - yb-tservers:5433 (YSQL/PostgreSQL interface)
# - yb-tservers:9042 (YCQL/Cassandra interface)
# - yb-master-ui:7000 (Master Admin UI)
# No additional Service manifest needed
```

**Initial Database Setup** (`yugabytedb-init.yaml`):
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: yugabytedb-init
  namespace: default
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: ysqlsh-init
        image: yugabytedb/yugabyte:2024.2.0.0-b77
        command:
        - /bin/bash
        - -c
        - |
          # Wait for YugabyteDB to be ready
          until /home/yugabyte/bin/ysqlsh -h yb-tservers -p 5433 -U yugabyte -c "SELECT 1"; do
            echo "Waiting for YugabyteDB..."
            sleep 2
          done

          # Create database and user
          /home/yugabyte/bin/ysqlsh -h yb-tservers -p 5433 -U yugabyte <<'EOF'
            CREATE DATABASE alternatefutures;
            CREATE USER alternatefutures_user WITH PASSWORD '${DB_PASSWORD}';
            GRANT ALL PRIVILEGES ON DATABASE alternatefutures TO alternatefutures_user;
          EOF

          echo "YugabyteDB initialized successfully"
        env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: DB_PASSWORD
```

**SealedSecret for Database** (`k8s/secrets/database-credentials.yaml`):
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: database-credentials
  namespace: default
spec:
  encryptedData:
    DB_USER: AgAbc123...  # Encrypted: alternatefutures_user
    DB_PASSWORD: AgAdef456...  # Encrypted
    DATABASE_URL: AgAghi789...  # Encrypted: postgresql://alternatefutures_user:pass@yb-tservers:5433/alternatefutures
  template:
    metadata:
      name: database-credentials
    type: Opaque
```

**Connection String Format**:
```
postgresql://[user]:[password]@yb-tservers:5433/alternatefutures
```

**Verification Commands**:
```bash
# Check YBCluster status
kubectl get ybclusters

# Check pods (should see 3 tserver + 3 master pods)
kubectl get pods -l app=yb-tserver
kubectl get pods -l app=yb-master

# Check services
kubectl get svc | grep yb-

# Access YSQL shell (PostgreSQL-compatible)
kubectl exec -it yb-tserver-0 -- /home/yugabyte/bin/ysqlsh -h yb-tservers

# Check cluster status
kubectl exec -it yb-master-0 -- /home/yugabyte/bin/yb-admin --master_addresses yb-masters:7100 list_all_masters
kubectl exec -it yb-master-0 -- /home/yugabyte/bin/yb-admin --master_addresses yb-masters:7100 list_all_tablet_servers

# Check replication status (should show RF=3)
kubectl exec -it yb-master-0 -- /home/yugabyte/bin/yb-admin --master_addresses yb-masters:7100 get_universe_config

# Access Master Admin UI (port-forward)
kubectl port-forward svc/yb-master-ui 7000:7000
# Then visit http://localhost:7000

# Access TServer metrics UI (port-forward)
kubectl port-forward svc/yb-tserver-0 9000:9000
# Then visit http://localhost:9000
```

---

### Component: CacheService

**Purpose**: Provide fast in-memory storage for rate limiting and sessions

**Location**: `k8s/data/redis/`

**Requirements Implemented**: Req 7.1-7.7

**StatefulSet** (`redis-statefulset.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: default
spec:
  ports:
  - port: 6379
    targetPort: 6379
  clusterIP: None
  selector:
    app: redis
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: default
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
          name: redis
        command:
        - redis-server
        - --appendonly
        - "yes"
        - --requirepass
        - $(REDIS_PASSWORD)
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: REDIS_PASSWORD
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        livenessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - redis-cli
            - ping
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

**SealedSecret for Redis** (`k8s/secrets/redis-credentials.yaml`):
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: redis-credentials
  namespace: default
spec:
  encryptedData:
    REDIS_PASSWORD: AgAxyz999...  # Encrypted
    REDIS_URL: AgAmno888...  # Encrypted: redis://:password@redis:6379
  template:
    metadata:
      name: redis-credentials
    type: Opaque
```

---

### Component: AuthService

**Purpose**: Handle authentication, PAT management, and rate limiting

**Location**: `k8s/apps/auth-service/`

**Requirements Implemented**: Req 8.1-8.10, 11.2-11.3

**Deployment** (`auth-deployment.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: default
spec:
  type: ClusterIP
  ports:
  - port: 3001
    targetPort: 3001
  selector:
    app: auth-service
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth
        image: ghcr.io/alternatefutures/auth:latest
        ports:
        - containerPort: 3001
        env:
        - name: PORT
          value: "3001"
        - name: NODE_ENV
          value: production
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: JWT_SECRET
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: DATABASE_URL
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: REDIS_URL
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

---

### Component: BackendService

**Purpose**: Serve GraphQL API and proxy auth requests

**Location**: `k8s/apps/backend-service/`

**Requirements Implemented**: Req 9.1-9.11, 11.2-11.4

**Deployment** (`backend-deployment.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: default
spec:
  type: ClusterIP
  ports:
  - port: 4000
    targetPort: 4000
  selector:
    app: backend-service
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: default
data:
  AUTH_SERVICE_URL: "http://auth-service:3001"
  NODE_ENV: "production"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-service
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend-service
  template:
    metadata:
      labels:
        app: backend-service
    spec:
      containers:
      - name: backend
        image: ghcr.io/alternatefutures/backend:latest
        ports:
        - containerPort: 4000
        env:
        - name: PORT
          value: "4000"
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: NODE_ENV
        - name: AUTH_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: AUTH_SERVICE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: JWT_SECRET
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-credentials
              key: DATABASE_URL
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

---

### Component: FrontendService

**Purpose**: Serve Next.js static marketing site

**Location**: `k8s/apps/frontend-service/`

**Requirements Implemented**: Req 10.1-10.9

**Deployment** (`frontend-deployment.yaml`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
  namespace: default
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: frontend-service
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-service
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend-service
  template:
    metadata:
      labels:
        app: frontend-service
    spec:
      containers:
      - name: frontend
        image: ghcr.io/alternatefutures/home:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
```

**Dockerfile for Frontend** (in home repo):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/out ./out
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npx", "serve", "out", "-l", "3000"]
```

---

## 5. Deployment Sequence

The following sequence ensures dependencies are satisfied:

1. **Infrastructure**: `tofu apply` (Req 1.1-1.12)
2. **Verify K3s**: `kubectl get nodes` (Req 2.1)
3. **Deploy Sealed Secrets**: `kubectl apply -f k8s/core/sealed-secrets/` (Req 5.1-5.2)
4. **Create SealedSecrets**: Encrypt and commit to Git (Req 5.3-5.7)
5. **Deploy Traefik**: `kubectl apply -f k8s/core/traefik/` (Req 4.1)
6. **Deploy ArgoCD**: Install and configure (Req 3.1)
7. **Deploy Database**: `kubectl apply -f k8s/data/postgresql/` (Req 6.1-6.7)
8. **Deploy Redis**: `kubectl apply -f k8s/data/redis/` (Req 7.1-7.7)
9. **Deploy Auth Service**: Via ArgoCD Application (Req 8.1-8.10)
10. **Deploy Backend Service**: Via ArgoCD Application (Req 9.1-9.11)
11. **Deploy Frontend Service**: Via ArgoCD Application (Req 10.1-10.9)
12. **Create IngressRoutes**: Apply TLS routing (Req 4.2-4.10, 12.1-12.5)
13. **Verify End-to-End**: Test HTTPS access (Req 12.1-12.5)

---

## 6. Configuration Summary

| Component | Config Location | Secret/ConfigMap | Environment Variables |
|-----------|----------------|------------------|----------------------|
| InfraProvisioner | `infrastructure/*.tf` | N/A | N/A |
| OrchestrationLayer | `/etc/rancher/k3s/config.yaml` | N/A | N/A |
| SecretsManager | `k8s/core/sealed-secrets/` | N/A | N/A |
| IngressController | `k8s/core/traefik/` | acme-storage PVC | ACME email, storage path |
| GitOpsController | `argocd/*.yaml` | argocd-initial-admin-secret | N/A |
| DatabaseService | `k8s/data/postgresql/` | database-credentials | POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB |
| CacheService | `k8s/data/redis/` | redis-credentials | REDIS_PASSWORD |
| AuthService | `k8s/apps/auth-service/` | jwt-secret, database-credentials, redis-credentials | PORT, NODE_ENV, JWT_SECRET, DATABASE_URL, REDIS_URL |
| BackendService | `k8s/apps/backend-service/` | jwt-secret, database-credentials; backend-config ConfigMap | PORT, NODE_ENV, AUTH_SERVICE_URL, JWT_SECRET, DATABASE_URL |
| FrontendService | `k8s/apps/frontend-service/` | None | None |

---

## Approval Gate

Detailed design complete. All components from the blueprint have been specified with:
- ✅ **File locations and structure** for OpenTofu and K8s manifests
- ✅ **Configuration details** for each component
- ✅ **Interfaces** (variables, outputs, env vars, APIs)
- ✅ **YAML manifests** for Deployments, Services, StatefulSets, IngressRoutes
- ✅ **Deployment sequence** with dependency order
- ✅ **References to requirements** (Req X.Y) for traceability

**Proceed to generate implementation tasks?**
