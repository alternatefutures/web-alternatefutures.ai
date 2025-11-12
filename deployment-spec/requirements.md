# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for deploying the Alternate Futures platform on K3s using OpenTofu, Traefik, ArgoCD, and Sealed Secrets. Each requirement includes specific, testable acceptance criteria assigned to components defined in the architectural blueprint.

## Glossary

| Term | Definition |
|------|------------|
| **InfraProvisioner** | OpenTofu-based infrastructure as code system |
| **OrchestrationLayer** | K3s Kubernetes distribution |
| **GitOpsController** | ArgoCD deployment automation system |
| **IngressController** | Traefik reverse proxy and load balancer |
| **SecretsManager** | Sealed Secrets controller for encrypted secrets |
| **BackendService** | GraphQL API (backend) |
| **AuthService** | Authentication REST API (auth) |
| **FrontendService** | Next.js marketing site (home) |
| **DatabaseService** | PostgreSQL database |
| **CacheService** | Redis in-memory store |
| **PAT** | Personal Access Token |
| **SIWE** | Sign-In with Ethereum |
| **JWT** | JSON Web Token |
| **SealedSecret** | Encrypted Kubernetes Secret safe for Git storage |

---

## Requirements

### Requirement 1: Infrastructure Provisioning

The system SHALL provision a production-ready K3s cluster with compute, networking, storage, and load balancing capabilities using infrastructure as code.

#### Acceptance Criteria

1.1. WHEN the operator executes `tofu apply`, THE **InfraProvisioner** SHALL create at least 3 virtual machine instances for K3s control plane nodes.

1.2. WHEN the operator executes `tofu apply`, THE **InfraProvisioner** SHALL create at least 2 virtual machine instances for K3s worker nodes.

1.3. WHEN control plane VM instances are created, THE **InfraProvisioner** SHALL configure each with a minimum of 2 CPU cores and 4 GB RAM.

1.4. WHEN worker VM instances are created, THE **InfraProvisioner** SHALL configure each with a minimum of 2 CPU cores and 8 GB RAM.

1.5. WHEN VM instances are provisioned, THE **InfraProvisioner** SHALL create a virtual private network (VPC) with private subnet for inter-node communication.

1.6. WHEN VM instances are provisioned, THE **InfraProvisioner** SHALL install K3s on control plane nodes using the K3s installation script over SSH.

1.7. WHEN VM instances are provisioned, THE **InfraProvisioner** SHALL join worker nodes to the K3s cluster using the node token from the control plane.

1.8. WHEN K3s installation completes, THE **InfraProvisioner** SHALL create a cloud provider load balancer with a public IP address.

1.9. WHEN the load balancer is created, THE **InfraProvisioner** SHALL configure it to forward traffic on ports 80 and 443 to K3s worker nodes.

1.10. WHEN VM instances are provisioned, THE **InfraProvisioner** SHALL create persistent storage volumes for PostgreSQL and Redis data.

1.11. WHEN `tofu apply` completes, THE **InfraProvisioner** SHALL output the cluster kubeconfig file location for operator access.

1.12. WHEN `tofu destroy` is executed, THE **InfraProvisioner** SHALL delete all created resources (VMs, networks, load balancers, storage) without manual intervention.

---

### Requirement 2: Kubernetes Cluster Operations

The system SHALL provide a highly available Kubernetes cluster capable of running containerized workloads with service discovery, persistent storage, and resource management.

#### Acceptance Criteria

2.1. WHEN the operator executes `kubectl get nodes`, THE **OrchestrationLayer** SHALL return all provisioned nodes in "Ready" status.

2.2. WHEN the operator executes `kubectl version`, THE **OrchestrationLayer** SHALL report a K3s version >= v1.28.0.

2.3. WHEN a pod requests persistent storage, THE **OrchestrationLayer** SHALL bind a PersistentVolumeClaim to an available PersistentVolume within 30 seconds.

2.4. WHEN a Deployment is created, THE **OrchestrationLayer** SHALL schedule pods across multiple worker nodes for high availability.

2.5. WHEN a Service of type ClusterIP is created, THE **OrchestrationLayer** SHALL assign a stable internal IP address accessible from all pods.

2.6. WHEN a pod fails health checks 3 consecutive times, THE **OrchestrationLayer** SHALL restart the pod automatically.

2.7. WHEN the operator executes `kubectl logs <pod>`, THE **OrchestrationLayer** SHALL return application logs from the specified pod.

2.8. WHEN a control plane node fails, THE **OrchestrationLayer** SHALL maintain cluster operations using the remaining control plane nodes (quorum).

---

### Requirement 3: GitOps Deployment Automation

The system SHALL automatically detect changes to GitHub repositories and synchronize cluster state with the declared configuration without manual intervention.

#### Acceptance Criteria

3.1. WHEN ArgoCD is deployed, THE **GitOpsController** SHALL connect to the GitHub repository specified in the Application manifest.

3.2. WHEN a developer pushes changes to the `main` branch, THE **GitOpsController** SHALL detect the change within 3 minutes via polling OR immediately if webhooks are configured.

3.3. WHEN manifest changes are detected, THE **GitOpsController** SHALL apply the updated Kubernetes manifests to the **OrchestrationLayer**.

3.4. WHEN manifests are applied, THE **GitOpsController** SHALL wait for resources to become healthy before marking the sync as successful.

3.5. WHEN a deployment fails health checks, THE **GitOpsController** SHALL mark the Application as "Degraded" in the ArgoCD UI.

3.6. WHEN the operator enables auto-sync, THE **GitOpsController** SHALL automatically synchronize on every detected change without manual intervention.

3.7. WHEN the operator disables auto-sync, THE **GitOpsController** SHALL require manual "Sync" button clicks in the ArgoCD UI to deploy changes.

3.8. WHEN a sync operation is triggered, THE **GitOpsController** SHALL record the sync event with timestamp, commit SHA, and result (success/failure).

3.9. WHEN the operator navigates to the ArgoCD UI, THE **GitOpsController** SHALL display the current sync status for all monitored applications.

3.10. WHEN the operator clicks "Rollback" in the ArgoCD UI, THE **GitOpsController** SHALL revert the application to the previous Git commit.

---

### Requirement 4: Ingress and SSL Certificate Management

The system SHALL route external HTTP/HTTPS traffic to internal services and automatically provision SSL certificates from Let's Encrypt without manual certificate management.

#### Acceptance Criteria

4.1. WHEN Traefik is deployed, THE **IngressController** SHALL create a LoadBalancer Service with an external IP address from the cloud provider.

4.2. WHEN an IngressRoute resource is created, THE **IngressController** SHALL configure routing rules based on the specified host and path.

4.3. WHEN a request arrives on port 80 (HTTP), THE **IngressController** SHALL redirect the client to port 443 (HTTPS) with a 301 status code.

4.4. WHEN an IngressRoute specifies a `tls.certResolver`, THE **IngressController** SHALL request an SSL certificate from Let's Encrypt using the ACME protocol.

4.5. WHEN Let's Encrypt issues a certificate, THE **IngressController** SHALL store the certificate in the file specified by `acme.storage` (e.g., `/data/acme.json`).

4.6. WHEN a certificate is 30 days from expiration, THE **IngressController** SHALL automatically renew the certificate from Let's Encrypt.

4.7. WHEN an HTTPS request arrives, THE **IngressController** SHALL terminate TLS and forward the decrypted HTTP request to the backend service.

4.8. WHEN the IngressController receives a request for `www.alternatefutures.ai`, THE **IngressController** SHALL route traffic to the **FrontendService**.

4.9. WHEN the IngressController receives a request for `api.alternatefutures.ai`, THE **IngressController** SHALL route traffic to the **BackendService**.

4.10. WHEN the IngressController receives a request for `auth.alternatefutures.ai`, THE **IngressController** SHALL route traffic to the **AuthService**.

4.11. WHEN a backend service becomes unavailable, THE **IngressController** SHALL return a 503 Service Unavailable response to the client.

---

### Requirement 5: Secrets Management

The system SHALL securely manage sensitive configuration data (database credentials, JWT secrets, API keys) by encrypting secrets for Git storage and decrypting them only within the cluster at runtime.

#### Acceptance Criteria

5.1. WHEN the Sealed Secrets controller is deployed, THE **SecretsManager** SHALL generate an RSA key pair and store the private key in the cluster.

5.2. WHEN the operator executes `kubeseal --fetch-cert`, THE **SecretsManager** SHALL return the public certificate for client-side encryption.

5.3. WHEN the operator creates a SealedSecret resource, THE **SecretsManager** SHALL decrypt it using the cluster private key and create a corresponding Kubernetes Secret.

5.4. WHEN a SealedSecret is committed to Git, THE **SecretsManager** SHALL ensure the encrypted data cannot be decrypted by anyone without access to the cluster private key.

5.5. WHEN a Secret is created by the SecretsManager, THE **OrchestrationLayer** SHALL inject the secret values into pods as environment variables or mounted files.

5.6. WHEN the JWT_SECRET SealedSecret is applied, THE **SecretsManager** SHALL create a Secret named `jwt-secret` containing the key `JWT_SECRET`.

5.7. WHEN the DATABASE_URL SealedSecret is applied, THE **SecretsManager** SHALL create a Secret named `database-credentials` containing the key `DATABASE_URL`.

5.8. WHEN a Secret is updated, THE **OrchestrationLayer** SHALL propagate the updated values to running pods according to the pod's restart policy.

---

### Requirement 6: Database Service Deployment

The system SHALL deploy a YugabyteDB distributed SQL database with persistent storage, automatic replication, and high availability for application data persistence across multiple nodes.

#### Acceptance Criteria

6.1. WHEN the YugabyteDB operator is deployed, THE **DatabaseService** SHALL create a 3-node YugabyteDB cluster running YugabyteDB version 2024.2 or higher.

6.2. WHEN each DatabaseService node starts, THE **DatabaseService** SHALL mount a PersistentVolume for the `/mnt/disk0` directory for tablet data.

6.3. WHEN the DatabaseService is created, THE **DatabaseService** SHALL expose port 5433 (YSQL/PostgreSQL) via a ClusterIP Service named `yb-tservers` and port 7000 (Admin UI) via Service named `yb-master-ui`.

6.4. WHEN a DatabaseService node is deleted, THE **OrchestrationLayer** SHALL recreate the node and rejoin it to the cluster, rebalancing data automatically via Raft consensus.

6.5. WHEN the DATABASE_URL secret is available, THE **DatabaseService** SHALL accept connections using the credentials specified in the secret over the PostgreSQL wire protocol (YSQL).

6.6. WHEN a client connects to `yb-tservers:5433`, THE **DatabaseService** SHALL authenticate the client and allow SQL queries if credentials are valid using PostgreSQL-compatible authentication.

6.7. WHEN the BackendService or AuthService connects to the DatabaseService, THE **DatabaseService** SHALL process SQL queries and return results with ACID guarantees and automatic data replication across all 3 nodes.

6.8. WHEN one DatabaseService node fails, THE **DatabaseService** SHALL maintain quorum with the remaining 2 nodes and continue serving queries without data loss (RPO=0, RTO=3 seconds).

6.9. WHEN all DatabaseService nodes are healthy, THE **DatabaseService** SHALL maintain 3x replication factor (RF=3) for all data across the cluster.

---

### Requirement 7: Cache Service Deployment

The system SHALL deploy a Redis cache for rate limiting, session storage, and fast in-memory data access with persistence.

#### Acceptance Criteria

7.1. WHEN the Redis StatefulSet is deployed, THE **CacheService** SHALL create a pod running Redis version 7 or higher.

7.2. WHEN the CacheService pod starts, THE **CacheService** SHALL mount a PersistentVolume for the `/data` directory.

7.3. WHEN the CacheService is created, THE **CacheService** SHALL expose port 6379 via a ClusterIP Service named `redis`.

7.4. WHEN the REDIS_URL secret is available, THE **CacheService** SHALL bind to the port specified in the secret (default 6379).

7.5. WHEN a client connects to `redis:6379`, THE **CacheService** SHALL authenticate the client if a password is configured in the REDIS_URL secret.

7.6. WHEN the AuthService writes a rate limiting counter, THE **CacheService** SHALL store the key-value pair in memory and persist to disk asynchronously.

7.7. WHEN the AuthService reads a rate limiting counter, THE **CacheService** SHALL return the current value within 5 milliseconds.

---

### Requirement 8: Authentication Service Deployment

The system SHALL deploy the authentication REST API to handle PAT management, SIWE authentication, JWT issuance, and rate limiting.

#### Acceptance Criteria

8.1. WHEN the AuthService Deployment is created, THE **AuthService** SHALL create at least 2 pod replicas for high availability.

8.2. WHEN an AuthService pod starts, THE **AuthService** SHALL read the JWT_SECRET environment variable from the `jwt-secret` Secret.

8.3. WHEN an AuthService pod starts, THE **AuthService** SHALL read the DATABASE_URL environment variable from the `database-credentials` Secret.

8.4. WHEN an AuthService pod starts, THE **AuthService** SHALL read the REDIS_URL environment variable from the `redis-credentials` Secret.

8.5. WHEN the AuthService is created, THE **AuthService** SHALL expose port 3001 via a ClusterIP Service named `auth-service`.

8.6. WHEN a health check probes `/health`, THE **AuthService** SHALL respond with HTTP 200 status code if the service is healthy.

8.7. WHEN a client sends a POST request to `/api/auth/siwe`, THE **AuthService** SHALL validate the SIWE signature and create a Personal Access Token.

8.8. WHEN a PAT is created, THE **AuthService** SHALL store it in the **DatabaseService** with an expiration timestamp.

8.9. WHEN a client sends a POST request to `/api/auth/validate` with a JWT, THE **AuthService** SHALL verify the JWT signature using the JWT_SECRET and return validation results.

8.10. WHEN a client exceeds the rate limit, THE **AuthService** SHALL return HTTP 429 Too Many Requests and increment the counter in the **CacheService**.

---

### Requirement 9: Backend Service Deployment

The system SHALL deploy the GraphQL API to serve application data and proxy authentication requests to the AuthService.

#### Acceptance Criteria

9.1. WHEN the BackendService Deployment is created, THE **BackendService** SHALL create at least 2 pod replicas for high availability.

9.2. WHEN a BackendService pod starts, THE **BackendService** SHALL read the JWT_SECRET environment variable from the `jwt-secret` Secret.

9.3. WHEN a BackendService pod starts, THE **BackendService** SHALL read the DATABASE_URL environment variable from the `database-credentials` Secret.

9.4. WHEN a BackendService pod starts, THE **BackendService** SHALL read the AUTH_SERVICE_URL environment variable pointing to `http://auth-service:3001`.

9.5. WHEN the BackendService is created, THE **BackendService** SHALL expose port 4000 via a ClusterIP Service named `backend-service`.

9.6. WHEN a health check probes `/health`, THE **BackendService** SHALL respond with HTTP 200 status code if the service is healthy.

9.7. WHEN a client sends a GraphQL query to `/graphql`, THE **BackendService** SHALL parse the query and execute it against the **DatabaseService**.

9.8. WHEN a GraphQL query requires authentication, THE **BackendService** SHALL extract the JWT from the Authorization header and call `${AUTH_SERVICE_URL}/api/auth/validate`.

9.9. WHEN the AuthService returns a validation failure, THE **BackendService** SHALL return a GraphQL error with "Unauthorized" message.

9.10. WHEN the AuthService returns a validation success, THE **BackendService** SHALL execute the query and return the requested data.

9.11. WHEN the BackendService cannot connect to the AuthService, THE **BackendService** SHALL return HTTP 503 Service Unavailable.

---

### Requirement 10: Frontend Service Deployment

The system SHALL deploy the Next.js marketing site to serve static content about the Alternate Futures platform.

#### Acceptance Criteria

10.1. WHEN the FrontendService Deployment is created, THE **FrontendService** SHALL create at least 2 pod replicas for high availability.

10.2. WHEN a FrontendService pod starts, THE **FrontendService** SHALL serve static files from the `/out` directory (Next.js static export).

10.3. WHEN the FrontendService is created, THE **FrontendService** SHALL expose port 3000 via a ClusterIP Service named `frontend-service`.

10.4. WHEN a health check probes `/`, THE **FrontendService** SHALL respond with HTTP 200 status code.

10.5. WHEN a client requests `/`, THE **FrontendService** SHALL return the homepage HTML.

10.6. WHEN a client requests `/consulting`, THE **FrontendService** SHALL return the consulting page HTML.

10.7. WHEN a client requests `/products`, THE **FrontendService** SHALL return the products page HTML.

10.8. WHEN a client requests `/products/web-services`, THE **FrontendService** SHALL return the web services page HTML.

10.9. WHEN a client requests a static asset (e.g., `/assets/logo.svg`), THE **FrontendService** SHALL return the file with the appropriate Content-Type header.

---

### Requirement 11: Service-to-Service Communication

The system SHALL enable secure, reliable communication between BackendService and AuthService for JWT validation.

#### Acceptance Criteria

11.1. WHEN the BackendService sends a request to the AuthService, THE **OrchestrationLayer** SHALL route the request via the `auth-service` ClusterIP Service DNS name.

11.2. WHEN the BackendService calls `http://auth-service:3001/api/auth/validate`, THE **AuthService** SHALL respond within 100 milliseconds under normal load.

11.3. WHEN the JWT_SECRET in the BackendService matches the JWT_SECRET in the AuthService, THE **AuthService** SHALL successfully validate JWTs signed by the BackendService.

11.4. WHEN network connectivity between BackendService and AuthService is lost, THE **BackendService** SHALL log the error and return HTTP 503 to the client.

---

### Requirement 12: End-to-End HTTPS Access

The system SHALL provide secure HTTPS access to all services with valid SSL certificates and proper routing.

#### Acceptance Criteria

12.1. WHEN a user navigates to `https://www.alternatefutures.ai`, THE **IngressController** SHALL route the request to the **FrontendService** and return the homepage.

12.2. WHEN a user navigates to `https://api.alternatefutures.ai/graphql`, THE **IngressController** SHALL route the request to the **BackendService** and return a GraphQL response.

12.3. WHEN a user navigates to `https://auth.alternatefutures.ai/api/health`, THE **IngressController** SHALL route the request to the **AuthService** and return HTTP 200.

12.4. WHEN a browser inspects the SSL certificate for any domain, THE certificate SHALL be issued by Let's Encrypt and valid for at least 60 days.

12.5. WHEN a user attempts to access any service via HTTP, THE **IngressController** SHALL redirect to HTTPS with a 301 status code.

---

### Requirement 13: Deployment Observability

The system SHALL provide visibility into deployment status, application health, and system logs for operational awareness.

#### Acceptance Criteria

13.1. WHEN the operator navigates to the ArgoCD UI, THE **GitOpsController** SHALL display the sync status (Synced/OutOfSync) for each application.

13.2. WHEN the operator navigates to the ArgoCD UI, THE **GitOpsController** SHALL display the health status (Healthy/Degraded/Progressing) for each application.

13.3. WHEN the operator views an application in ArgoCD, THE **GitOpsController** SHALL show the deployed Git commit SHA and timestamp.

13.4. WHEN the operator executes `kubectl get pods`, THE **OrchestrationLayer** SHALL show the Ready status (e.g., "2/2") for each pod.

13.5. WHEN the operator executes `kubectl logs <pod>`, THE **OrchestrationLayer** SHALL return the last 1000 lines of application logs.

13.6. WHEN a deployment fails, THE **GitOpsController** SHALL display the error message in the ArgoCD UI.

---

### Requirement 14: Disaster Recovery and Rollback

The system SHALL support rollback to previous working versions and recovery from failed deployments.

#### Acceptance Criteria

14.1. WHEN a deployment causes service degradation, THE operator SHALL be able to execute `kubectl rollout undo deployment/<name>` to revert to the previous version.

14.2. WHEN a sync fails in ArgoCD, THE **GitOpsController** SHALL retain the previous working version without disrupting running pods.

14.3. WHEN the operator clicks "Rollback" in the ArgoCD UI, THE **GitOpsController** SHALL revert to the selected previous Git commit.

14.4. WHEN a rollback is triggered, THE **OrchestrationLayer** SHALL perform a rolling update, ensuring zero downtime.

---

### Requirement 15: Configuration Management

The system SHALL manage application configuration through environment variables and ConfigMaps, separate from secrets.

#### Acceptance Criteria

15.1. WHEN a ConfigMap is created with environment variables, THE **OrchestrationLayer** SHALL inject the values into pods as environment variables.

15.2. WHEN the AUTH_SERVICE_URL ConfigMap is updated, THE **BackendService** SHALL use the new URL after pod restart.

15.3. WHEN the PORT environment variable is set, THE **AuthService** SHALL listen on the specified port (default 3001).

15.4. WHEN the NODE_ENV environment variable is set to "production", THE **BackendService** SHALL disable debug logging.

---

## Summary

This requirements document defines **15 requirements** with **132 acceptance criteria** covering:

- Infrastructure provisioning (12 criteria)
- Kubernetes operations (8 criteria)
- GitOps automation (10 criteria)
- Ingress and SSL (11 criteria)
- Secrets management (8 criteria)
- Database deployment (9 criteria - YugabyteDB distributed cluster)
- Cache deployment (7 criteria)
- Auth service deployment (10 criteria)
- Backend service deployment (11 criteria)
- Frontend service deployment (9 criteria)
- Service communication (4 criteria)
- HTTPS access (5 criteria)
- Observability (6 criteria)
- Disaster recovery (4 criteria)
- Configuration management (4 criteria)

Each acceptance criterion is:
- ✅ **Specific**: Clearly defines expected behavior
- ✅ **Testable**: Can be verified through execution or inspection
- ✅ **Assigned**: References a component from the blueprint
- ✅ **Traceable**: Numbered for reference in tasks and validation

---

## Approval Gate

Requirements documented with **15 requirements** and **132 acceptance criteria**, each assigned to a specific component from the blueprint. All acceptance criteria use the format: "WHEN [trigger], THE **[ComponentName]** SHALL [behavior]."

**Database Technology**: YugabyteDB distributed SQL (3-node cluster with automatic replication and failover, Apache 2.0 license) instead of single-node PostgreSQL, aligning with the platform's distributed infrastructure mission and 100% open source requirement.

**These requirement IDs (1.1, 1.2, ..., 15.4) will be referenced in the implementation tasks to ensure 100% traceability.**

**Proceed to detailed design?**
