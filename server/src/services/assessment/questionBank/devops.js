/**
 * SkillProof Assessment Question Bank - DevOps & Cloud
 * 
 * Skills:
 * 1. Docker
 * 2. Docker Compose
 * 3. Kubernetes
 * 4. AWS
 * 5. Microsoft Azure
 * 6. Google Cloud
 * 7. CI/CD
 * 8. GitHub Actions
 * 
 * Strictly 5 questions per skill, progressive difficulty (Easy -> Easy/Med -> Med -> Med/Hard -> Hard).
 */

export const DEVOPS_QUESTIONS = {
  // ==========================================
  // 1. Docker
  // ==========================================
  'Docker': [
    {
      id: 'docker_q1',
      skill: 'Docker',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Dockerfile for a Python 3.12 FastAPI application that sets working directory to /app, copies requirements.txt, runs pip install, copies source code, and exposes port 8000 with CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"].',
      starterCode: 'FROM python:3.12-slim\nWORKDIR /app\n',
      expectedAnswer: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]',
      points: 20,
      validationCriteria: {
        requiredElements: ['FROM python:3.12', 'WORKDIR', 'COPY requirements.txt', 'RUN pip install', 'EXPOSE 8000', 'CMD']
      },
      explanation: 'Follows best practices: copies dependencies first for layer caching, sets workdir, exposes port, and executes uvicorn.'
    },
    {
      id: 'docker_q2',
      skill: 'Docker',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write the Docker CLI command to run a container in detached mode named "web_api", publishing port 8080 on the host to port 80 in the container, passing an environment variable ENV=production, using image "my-web-image:latest".',
      starterCode: 'docker run ',
      expectedAnswer: 'docker run -d --name web_api -p 8080:80 -e ENV=production my-web-image:latest',
      points: 20,
      validationCriteria: {
        requiredElements: ['docker run', '-d', '--name web_api', '-p 8080:80', '-e', 'ENV=production', 'my-web-image:latest']
      },
      explanation: 'Uses -d for detached, --name for naming, -p for host:container port binding, and -e for env vars.'
    },
    {
      id: 'docker_q3',
      skill: 'Docker',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a multi-stage Dockerfile for a Node.js application to minimize production image size: Stage 1 ("builder") installs dependencies and runs "npm run build". Stage 2 ("runner") copies built files from the builder stage and runs "node server.js".',
      starterCode: '# Build Stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\n# Production Stage\nFROM node:20-alpine AS runner\nWORKDIR /app\n',
      expectedAnswer: 'FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./package.json\nEXPOSE 3000\nCMD ["node", "dist/server.js"]',
      points: 20,
      validationCriteria: {
        requiredElements: ['AS builder', 'AS runner', 'COPY --from=builder', 'CMD']
      },
      explanation: 'Multi-stage builds leave compiler tools in the build stage, creating lean, secure runtime images.'
    },
    {
      id: 'docker_q4',
      skill: 'Docker',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the Docker commands to create a persistent named volume "pg_data", inspect it, and run a PostgreSQL container named "db" that mounts this volume to "/var/lib/postgresql/data".',
      starterCode: '# Create volume:\ndocker volume create pg_data\n# Run postgres container with volume mount:\n',
      expectedAnswer: 'docker volume create pg_data\ndocker run -d --name db -v pg_data:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret postgres:16',
      points: 20,
      validationCriteria: {
        requiredElements: ['docker volume create', 'pg_data', '-v pg_data:/var/lib/postgresql/data', 'postgres']
      },
      explanation: 'Docker named volumes ensure database state persists beyond container lifecycle.'
    },
    {
      id: 'docker_q5',
      skill: 'Docker',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Given an app container that cannot reach a Redis container on localhost, write the Docker CLI commands to create a user-defined bridge network named "app_net" and connect/run both containers on that network so they can communicate by container name.',
      starterCode: '# Create bridge network:\ndocker network create app_net\n# Run redis on network:\n\n# Run app on network:\n',
      expectedAnswer: 'docker network create app_net\ndocker run -d --name redis --network app_net redis:alpine\ndocker run -d --name app --network app_net -p 8080:8080 myapp:latest',
      points: 20,
      validationCriteria: {
        requiredElements: ['docker network create', 'app_net', '--network app_net', 'redis']
      },
      explanation: 'Containers on a user-defined bridge network resolve each other by container name via embedded DNS.'
    }
  ],

  // ==========================================
  // 2. Docker Compose
  // ==========================================
  'Docker Compose': [
    {
      id: 'docker_compose_q1',
      skill: 'Docker Compose',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic docker-compose.yml file defining a single service "web" built from the current directory ("."), exposing port 3000 to host port 3000.',
      starterCode: 'version: "3.8"\nservices:\n  web:\n',
      expectedAnswer: 'version: "3.8"\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"',
      points: 20,
      validationCriteria: {
        requiredElements: ['services', 'web', 'build', 'ports', '3000:3000']
      },
      explanation: 'Defines a basic service in Compose with build context and port mappings.'
    },
    {
      id: 'docker_compose_q2',
      skill: 'Docker Compose',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a docker-compose configuration containing two services: "backend" (built from ./backend, port 8000:8000) and "db" using image "postgres:16-alpine" with environment variables POSTGRES_DB=testdb and POSTGRES_PASSWORD=secret.',
      starterCode: 'services:\n  backend:\n    build: ./backend\n    ports:\n      - "8000:8000"\n    environment:\n      - DB_HOST=db\n  db:\n',
      expectedAnswer: 'services:\n  backend:\n    build: ./backend\n    ports:\n      - "8000:8000"\n    environment:\n      - DB_HOST=db\n  db:\n    image: postgres:16-alpine\n    environment:\n      - POSTGRES_DB=testdb\n      - POSTGRES_PASSWORD=secret',
      points: 20,
      validationCriteria: {
        requiredElements: ['backend', 'db', 'postgres:16', 'POSTGRES_DB', 'POSTGRES_PASSWORD']
      },
      explanation: 'Configures multi-container communication where backend connects to db by service name.'
    },
    {
      id: 'docker_compose_q3',
      skill: 'Docker Compose',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'In docker-compose, configure "depends_on" with service conditions so that the "web" service only starts when "db" is healthy, including a healthcheck configuration for PostgreSQL using pg_isready.',
      starterCode: 'services:\n  db:\n    image: postgres:16\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n  web:\n    build: .\n    depends_on:\n      db:\n',
      expectedAnswer: 'services:\n  db:\n    image: postgres:16\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U postgres"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n  web:\n    build: .\n    depends_on:\n      db:\n        condition: service_healthy',
      points: 20,
      validationCriteria: {
        requiredElements: ['depends_on', 'condition: service_healthy', 'healthcheck', 'pg_isready']
      },
      explanation: 'condition: service_healthy ensures dependent containers start only after healthchecks pass.'
    },
    {
      id: 'docker_compose_q4',
      skill: 'Docker Compose',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Define named volumes in docker-compose for persistent database storage "db_data" and bind mount host directory "./logs" into "/var/log/app" for the web service.',
      starterCode: 'services:\n  web:\n    image: myapp\n    volumes:\n      # Add host log bind mount\n  db:\n    image: postgres:16\n    volumes:\n      # Add named volume mount\nvolumes:\n  # Declare named volume',
      expectedAnswer: 'services:\n  web:\n    image: myapp\n    volumes:\n      - ./logs:/var/log/app\n  db:\n    image: postgres:16\n    volumes:\n      - db_data:/var/lib/postgresql/data\nvolumes:\n  db_data:',
      points: 20,
      validationCriteria: {
        requiredElements: ['volumes:', 'db_data:', './logs:/var/log/app', 'db_data:/var/lib/postgresql/data']
      },
      explanation: 'Differentiates bind mounts (host relative path) and managed named volumes declared at root.'
    },
    {
      id: 'docker_compose_q5',
      skill: 'Docker Compose',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a docker-compose service configuration specifying restart policy "unless-stopped" and resource limits limiting memory to 512MB and CPU to 0.5 cores under deploy.resources.limits.',
      starterCode: 'services:\n  api:\n    image: api:v1\n    restart: unless-stopped\n    deploy:\n      resources:\n        limits:\n',
      expectedAnswer: 'services:\n  api:\n    image: api:v1\n    restart: unless-stopped\n    deploy:\n      resources:\n        limits:\n          cpus: "0.50"\n          memory: 512M',
      points: 20,
      validationCriteria: {
        requiredElements: ['restart: unless-stopped', 'deploy:', 'resources:', 'limits:', '512M']
      },
      explanation: 'Resource constraints prevent container resource starvation in Docker Compose environments.'
    }
  ],

  // ==========================================
  // 3. Kubernetes
  // ==========================================
  'Kubernetes': [
    {
      id: 'k8s_q1',
      skill: 'Kubernetes',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a Kubernetes Pod manifest in YAML running a container named "nginx-container" using image "nginx:1.25" and listening on containerPort 80.',
      starterCode: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx-pod\nspec:\n  containers:\n',
      expectedAnswer: 'apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx-pod\nspec:\n  containers:\n  - name: nginx-container\n    image: nginx:1.25\n    ports:\n    - containerPort: 80',
      points: 20,
      validationCriteria: {
        requiredElements: ['kind: Pod', 'name: nginx-container', 'image: nginx', 'containerPort: 80']
      },
      explanation: 'Defines the fundamental building block in Kubernetes: a Pod running an Nginx container.'
    },
    {
      id: 'k8s_q2',
      skill: 'Kubernetes',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write a Kubernetes Deployment manifest with 3 replicas, matching labels app: backend, running container "backend-api" with image "myrepo/api:v1".',
      starterCode: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend\n  template:\n',
      expectedAnswer: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend\n  template:\n    metadata:\n      labels:\n        app: backend\n    spec:\n      containers:\n      - name: backend-api\n        image: myrepo/api:v1\n        ports:\n        - containerPort: 8000',
      points: 20,
      validationCriteria: {
        requiredElements: ['kind: Deployment', 'replicas: 3', 'matchLabels:', 'app: backend', 'template:']
      },
      explanation: 'Deployments manage replica sets and declarative rolling updates in Kubernetes.'
    },
    {
      id: 'k8s_q3',
      skill: 'Kubernetes',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a Kubernetes Service YAML of type ClusterIP that exposes targetPort 8000 on port 80, routing traffic to pods with label selector "app: backend".',
      starterCode: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: backend-service\nspec:\n  type: ClusterIP\n  selector:\n',
      expectedAnswer: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: backend-service\nspec:\n  type: ClusterIP\n  selector:\n    app: backend\n  ports:\n  - port: 80\n    targetPort: 8000',
      points: 20,
      validationCriteria: {
        requiredElements: ['kind: Service', 'type: ClusterIP', 'app: backend', 'port: 80', 'targetPort: 8000']
      },
      explanation: 'A ClusterIP Service provides internal load balancing and stable DNS resolution across Pod replicas.'
    },
    {
      id: 'k8s_q4',
      skill: 'Kubernetes',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the pod container spec section injecting an environment variable "DATABASE_URL" from a Secret named "db-credentials" with secret key "url".',
      starterCode: 'env:\n  - name: DATABASE_URL\n    valueFrom:\n      secretKeyRef:\n',
      expectedAnswer: 'env:\n  - name: DATABASE_URL\n    valueFrom:\n      secretKeyRef:\n        name: db-credentials\n        key: url',
      points: 20,
      validationCriteria: {
        requiredElements: ['valueFrom', 'secretKeyRef', 'name: db-credentials', 'key: url']
      },
      explanation: 'secretKeyRef safely mounts sensitive credentials as container environment variables.'
    },
    {
      id: 'k8s_q5',
      skill: 'Kubernetes',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Define an HTTP livenessProbe and readinessProbe for a container checking endpoint "/healthz" on port 8080 with initialDelaySeconds: 15 and periodSeconds: 10.',
      starterCode: 'livenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 15\n  periodSeconds: 10\nreadinessProbe:\n',
      expectedAnswer: 'livenessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 15\n  periodSeconds: 10\nreadinessProbe:\n  httpGet:\n    path: /healthz\n    port: 8080\n  initialDelaySeconds: 5\n  periodSeconds: 5',
      points: 20,
      validationCriteria: {
        requiredElements: ['livenessProbe', 'readinessProbe', 'httpGet', 'path: /healthz', 'initialDelaySeconds']
      },
      explanation: 'Liveness probes restart failed pods; readiness probes ensure traffic is routed only to ready pods.'
    }
  ],

  // ==========================================
  // 4. AWS
  // ==========================================
  'AWS': [
    {
      id: 'aws_q1',
      skill: 'AWS',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Using the AWS SDK for JavaScript or Python (boto3), write code to upload a local file "data.csv" to an S3 bucket named "my-company-assets" with key "uploads/data.csv".',
      starterCode: 'import boto3\n\ns3 = boto3.client("s3")\n# Upload file to S3\n',
      expectedAnswer: 'import boto3\n\ns3 = boto3.client("s3")\ns3.upload_file("data.csv", "my-company-assets", "uploads/data.csv")',
      points: 20,
      validationCriteria: {
        requiredElements: ['boto3', 'upload_file', 'my-company-assets', 'data.csv']
      },
      explanation: 'boto3.client("s3").upload_file() handles multipart upload for files to Amazon S3.'
    },
    {
      id: 'aws_q2',
      skill: 'AWS',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write an AWS IAM policy JSON granting read-only access (s3:GetObject, s3:ListBucket) to a specific bucket "arn:aws:s3:::my-secure-bucket" and its contents.',
      starterCode: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        \n      ],\n      "Resource": [\n        \n      ]\n    }\n  ]\n}',
      expectedAnswer: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": ["s3:GetObject", "s3:ListBucket"],\n      "Resource": ["arn:aws:s3:::my-secure-bucket", "arn:aws:s3:::my-secure-bucket/*"]\n    }\n  ]\n}',
      points: 20,
      validationCriteria: {
        requiredElements: ['Effect": "Allow"', 's3:GetObject', 's3:ListBucket', 'my-secure-bucket']
      },
      explanation: 'IAM policies require permissions on both bucket ARN (for ListBucket) and object wildcard ARN (for GetObject).'
    },
    {
      id: 'aws_q3',
      skill: 'AWS',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a basic AWS Lambda function in Python (lambda_handler(event, context)) that processes an incoming API Gateway proxy event, parses JSON body, and returns a 200 response with JSON headers.',
      starterCode: 'import json\n\ndef lambda_handler(event, context):\n    # Extract body, return response\n',
      expectedAnswer: 'import json\n\ndef lambda_handler(event, context):\n    body = json.loads(event.get("body", "{}"))\n    return {\n        "statusCode": 200,\n        "headers": {"Content-Type": "application/json"},\n        "body": json.dumps({"message": "Processed successfully", "data": body})\n    }',
      points: 20,
      validationCriteria: {
        requiredElements: ['def lambda_handler', 'statusCode', 'headers', 'body', 'json.dumps']
      },
      explanation: 'AWS Lambda handles serverless execution triggered by API Gateway events.'
    },
    {
      id: 'aws_q4',
      skill: 'AWS',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Describe or write the AWS CLI command to launch an EC2 instance with instance type t3.micro, Amazon Linux 2 AMI, associating a key pair "prod-key", and security group "sg-0123456789abcdef0".',
      starterCode: 'aws ec2 run-instances \\\n  --image-id ami-0c55b159cbfafe1f0 \\\n  --instance-type ',
      expectedAnswer: 'aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --instance-type t3.micro --key-name prod-key --security-group-ids sg-0123456789abcdef0 --count 1',
      points: 20,
      validationCriteria: {
        requiredElements: ['aws ec2 run-instances', 't3.micro', 'prod-key', 'security-group']
      },
      explanation: 'aws ec2 run-instances configures compute instances with AMIs, key pairs, and network firewalls.'
    },
    {
      id: 'aws_q5',
      skill: 'AWS',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain how to design high availability across Multi-AZ in AWS for a web application: describe the roles of Route 53, Application Load Balancer (ALB), Auto Scaling Groups across 2 AZs, and RDS Multi-AZ standby replica.',
      starterCode: '# AWS Multi-AZ Architecture:\n# 1. Route 53 & ALB:\n# 2. Compute Auto Scaling:\n# 3. RDS Multi-AZ Replication:\n',
      expectedAnswer: '1. Route 53 routes traffic to public ALB across multiple AZs.\n2. ALB distributes HTTP traffic to an Auto Scaling Group spanning at least 2 Availability Zones.\n3. RDS Multi-AZ maintains synchronous replication to a standby replica in a secondary AZ with automatic failover in under 60 seconds.',
      points: 20,
      validationCriteria: {
        requiredElements: ['ALB', 'Auto Scaling', 'Multi-AZ', 'failover', 'synchronous']
      },
      explanation: 'Multi-AZ architecture eliminates single points of failure across compute, load balancing, and data layers.'
    }
  ],

  // ==========================================
  // 5. Microsoft Azure
  // ==========================================
  'Microsoft Azure': [
    {
      id: 'azure_q1',
      skill: 'Microsoft Azure',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the Azure CLI (az) command to create a new resource group named "rg-production" in the "eastus" region.',
      starterCode: 'az group create ',
      expectedAnswer: 'az group create --name rg-production --location eastus',
      points: 20,
      validationCriteria: {
        requiredElements: ['az group create', '--name rg-production', '--location eastus']
      },
      explanation: 'az group create provisions the logical container for grouping Azure resources.'
    },
    {
      id: 'azure_q2',
      skill: 'Microsoft Azure',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write the Azure CLI command to deploy a Docker container image "mcr.microsoft.com/azuredocs/aci-helloworld" into Azure Container Instances (ACI) named "my-container" within resource group "rg-production".',
      starterCode: 'az container create \\\n  --resource-group rg-production \\\n  --name my-container \\\n',
      expectedAnswer: 'az container create --resource-group rg-production --name my-container --image mcr.microsoft.com/azuredocs/aci-helloworld --dns-name-label mycontainer-demo --ports 80',
      points: 20,
      validationCriteria: {
        requiredElements: ['az container create', 'rg-production', 'my-container', 'image']
      },
      explanation: 'Azure Container Instances run serverless Docker containers without managing VM infrastructure.'
    },
    {
      id: 'azure_q3',
      skill: 'Microsoft Azure',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write code using the Azure Blob Storage SDK in Python to upload a file "report.pdf" to an Azure Storage container named "reports".',
      starterCode: 'from azure.storage.blob import BlobServiceClient\n\nconnection_str = "DefaultEndpointsProtocol=https;..."\nblob_service_client = BlobServiceClient.from_connection_string(connection_str)\n# Upload to container "reports"\n',
      expectedAnswer: 'blob_client = blob_service_client.get_blob_client(container="reports", blob="report.pdf")\nwith open("report.pdf", "rb") as data:\n    blob_client.upload_blob(data, overwrite=True)',
      points: 20,
      validationCriteria: {
        requiredElements: ['get_blob_client', 'reports', 'upload_blob']
      },
      explanation: 'BlobServiceClient.get_blob_client().upload_blob() streams binary data into Azure Blob Storage.'
    },
    {
      id: 'azure_q4',
      skill: 'Microsoft Azure',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the Azure CLI commands to create an Azure App Service Plan "myAppServicePlan" on the B1 (Basic) tier in Linux, and then create a Web App "my-unique-webapp" running Python 3.11.',
      starterCode: '# 1. Create App Service Plan:\naz appservice plan create --name myAppServicePlan --resource-group rg-production --is-linux --sku B1\n# 2. Create Web App:\n',
      expectedAnswer: 'az appservice plan create --name myAppServicePlan --resource-group rg-production --is-linux --sku B1\naz webapp create --resource-group rg-production --plan myAppServicePlan --name my-unique-webapp --runtime "PYTHON:3.11"',
      points: 20,
      validationCriteria: {
        requiredElements: ['az appservice plan create', 'az webapp create', 'PYTHON', 'myAppServicePlan']
      },
      explanation: 'Azure App Service isolates compute pricing tier via Service Plans and hosts managed web apps.'
    },
    {
      id: 'azure_q5',
      skill: 'Microsoft Azure',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the purpose and architecture of Azure Key Vault and Managed Identities: how does a web application running in Azure retrieve secrets without hardcoding any credentials in source code or configuration files?',
      starterCode: '# Azure Key Vault & Managed Identity Flow:\n',
      expectedAnswer: '1. Enable System-Assigned Managed Identity on the Azure Web App or VM.\n2. In Azure Key Vault, grant the application identity "Key Vault Secrets User" role via Azure RBAC.\n3. In application code, use DefaultAzureCredential from the Azure Identity SDK to obtain an Entra ID token automatically without passwords or connection strings to read secrets.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Managed Identity', 'Key Vault', 'DefaultAzureCredential', 'RBAC']
      },
      explanation: 'Managed Identities eliminate hardcoded credentials by using Microsoft Entra ID tokens issued directly to compute instances.'
    }
  ],

  // ==========================================
  // 6. Google Cloud
  // ==========================================
  'Google Cloud': [
    {
      id: 'gcp_q1',
      skill: 'Google Cloud',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write the Google Cloud CLI (gcloud) command to set your active project to "my-gcp-project-123" and default compute region to "us-central1".',
      starterCode: 'gcloud config set project ',
      expectedAnswer: 'gcloud config set project my-gcp-project-123\ngcloud config set compute/region us-central1',
      points: 20,
      validationCriteria: {
        requiredElements: ['gcloud config set project', 'my-gcp-project-123', 'compute/region', 'us-central1']
      },
      explanation: 'Configures default Google Cloud SDK project context and geographic compute region.'
    },
    {
      id: 'gcp_q2',
      skill: 'Google Cloud',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write the gcloud command to deploy a container image "gcr.io/my-project/api-service:latest" to Google Cloud Run with service name "api-service", allowing unauthenticated public invocations in region us-central1.',
      starterCode: 'gcloud run deploy api-service \\\n  --image gcr.io/my-project/api-service:latest \\\n',
      expectedAnswer: 'gcloud run deploy api-service --image gcr.io/my-project/api-service:latest --platform managed --region us-central1 --allow-unauthenticated',
      points: 20,
      validationCriteria: {
        requiredElements: ['gcloud run deploy', 'api-service', 'image', '--allow-unauthenticated']
      },
      explanation: 'Cloud Run provides fully managed serverless containers scaling down to zero.'
    },
    {
      id: 'gcp_q3',
      skill: 'Google Cloud',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Using the google-cloud-storage Python SDK, write code to download a blob "models/classifier.pkl" from bucket "ai-models-bucket" to local file "classifier.pkl".',
      starterCode: 'from google.cloud import storage\n\nclient = storage.Client()\n# Download blob\n',
      expectedAnswer: 'from google.cloud import storage\n\nclient = storage.Client()\nbucket = client.bucket("ai-models-bucket")\nblob = bucket.blob("models/classifier.pkl")\nblob.download_to_filename("classifier.pkl")',
      points: 20,
      validationCriteria: {
        requiredElements: ['storage.Client', 'client.bucket', 'bucket.blob', 'download_to_filename']
      },
      explanation: 'google-cloud-storage downloads cloud objects to local files via bucket.blob().download_to_filename().'
    },
    {
      id: 'gcp_q4',
      skill: 'Google Cloud',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write the gcloud CLI command to create a Google Cloud Pub/Sub topic named "order-events" and a pull subscription named "order-processor-sub" attached to that topic.',
      starterCode: '# 1. Create topic:\ngcloud pubsub topics create order-events\n# 2. Create subscription:\n',
      expectedAnswer: 'gcloud pubsub topics create order-events\ngcloud pubsub subscriptions create order-processor-sub --topic=order-events',
      points: 20,
      validationCriteria: {
        requiredElements: ['gcloud pubsub topics create', 'order-events', 'pubsub subscriptions create', 'order-processor-sub']
      },
      explanation: 'Pub/Sub decouples distributed event producers and subscribers across cloud systems.'
    },
    {
      id: 'gcp_q5',
      skill: 'Google Cloud',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a basic Google Cloud Function (2nd gen) in Python that is triggered by an HTTP request, validates an Authorization header containing a Bearer token, and returns a JSON payload.',
      starterCode: 'import functions_framework\nfrom flask import jsonify, request\n\n@functions_framework.http\ndef handle_request(request):\n    # Validate bearer token\n',
      expectedAnswer: 'import functions_framework\nfrom flask import jsonify, request\n\n@functions_framework.http\ndef handle_request(request):\n    auth_header = request.headers.get("Authorization", "")\n    if not auth_header.startswith("Bearer "):\n        return jsonify({"error": "Unauthorized"}), 401\n    token = auth_header.split(" ")[1]\n    return jsonify({"status": "authenticated", "token_received": True}), 200',
      points: 20,
      validationCriteria: {
        requiredElements: ['@functions_framework.http', 'Authorization', 'Bearer', 'jsonify', '401']
      },
      explanation: 'Cloud Functions 2nd Gen utilizes functions_framework and standard WSGI request objects.'
    }
  ],

  // ==========================================
  // 7. CI/CD
  // ==========================================
  'CI/CD': [
    {
      id: 'cicd_q1',
      skill: 'CI/CD',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Explain the core difference between Continuous Integration (CI) and Continuous Delivery (CD) in modern DevOps pipelines.',
      starterCode: '# Continuous Integration (CI):\n\n# Continuous Delivery (CD):\n',
      expectedAnswer: 'Continuous Integration (CI) automatically builds, lints, and executes automated test suites whenever code is committed to catch bugs early.\nContinuous Delivery (CD) automatically stages and packages verified code so it is always in a deployable state, ready for one-click or automatic production release.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Continuous Integration', 'Continuous Delivery', 'automated test', 'deploy']
      },
      explanation: 'CI validates and merges code changes frequently; CD ensures validated code is safely deployable.'
    },
    {
      id: 'cicd_q2',
      skill: 'CI/CD',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'List the typical sequential stages of a production CI/CD pipeline, and describe what occurs in each stage.',
      starterCode: '# Pipeline Stages:\n# 1. Lint / Static Analysis:\n# 2. Test:\n# 3. Build:\n# 4. Security Scan:\n# 5. Deploy:\n',
      expectedAnswer: '1. Lint/Static Analysis: Code formatting, styling, and static type checks.\n2. Test: Unit, integration, and contract tests.\n3. Build: Compile binaries, bundle assets, and build container images.\n4. Security Scan: Vulnerability scanning of dependencies (Snyk/Trivy) and secrets audit.\n5. Deploy: Deploy artifact to staging/production with healthcheck validation.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Lint', 'Test', 'Build', 'Deploy']
      },
      explanation: 'Standard pipeline stages isolate failures early before consuming expensive deployment resources.'
    },
    {
      id: 'cicd_q3',
      skill: 'CI/CD',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Explain the concept and advantages of Blue-Green deployment strategy compared to rolling updates.',
      starterCode: '# Blue-Green Deployment Architecture:\n',
      expectedAnswer: 'Blue-Green deployment maintains two identical production environments: Blue (active production) and Green (idle/new release). New versions are deployed and tested on Green without impacting users. Once verified, router/load balancer traffic switches instantaneously to Green. If issues arise, traffic reverts instantly to Blue with zero downtime.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Blue', 'Green', 'traffic', 'zero downtime', 'rollback']
      },
      explanation: 'Blue-Green deployments provide instant zero-downtime cutover and immediate rollbacks.'
    },
    {
      id: 'cicd_q4',
      skill: 'CI/CD',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Describe how Canary deployments work and how automated metrics (e.g. error rate, latency) are used for automated rollback.',
      starterCode: '# Canary Deployment Workflow:\n',
      expectedAnswer: 'Canary deployment routes a small percentage (e.g., 5-10%) of live production traffic to the new version while the rest stays on stable version. Monitoring systems track HTTP error rates, CPU/memory, and latency. If telemetry remains healthy, traffic gradually increases to 100%; if anomalies exceed thresholds, traffic automatically rolls back.',
      points: 20,
      validationCriteria: {
        requiredElements: ['Canary', 'percentage', 'traffic', 'error rate', 'rollback']
      },
      explanation: 'Canary releases minimize risk by exposing new code to a small cohort of real traffic.'
    },
    {
      id: 'cicd_q5',
      skill: 'CI/CD',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Explain the principles of GitOps (e.g. with ArgoCD or Flux): how is declarative infrastructure kept in sync with the desired state stored in Git?',
      starterCode: '# GitOps Principles:\n# 1. Declarative Source of Truth:\n# 2. Automated Pull Sync:\n# 3. Drift Detection:\n',
      expectedAnswer: '1. Git repository serves as the single source of truth for desired infrastructure state.\n2. An agent running inside the cluster (e.g., ArgoCD) continuously monitors Git repository state.\n3. The agent detects configuration drift between actual cluster state and desired Git state, automatically synchronizing or alerting to self-heal deviations.',
      points: 20,
      validationCriteria: {
        requiredElements: ['GitOps', 'source of truth', 'declarative', 'drift', 'ArgoCD']
      },
      explanation: 'GitOps uses Git as the authoritative state and reconciles deviations continuously.'
    }
  ],

  // ==========================================
  // 8. GitHub Actions
  // ==========================================
  'GitHub Actions': [
    {
      id: 'ghactions_q1',
      skill: 'GitHub Actions',
      questionNumber: 1,
      difficulty: 'easy',
      type: 'code',
      question: 'Write a basic GitHub Actions workflow YAML (.github/workflows/ci.yml) that triggers on pushes to the "main" branch and runs on "ubuntu-latest".',
      starterCode: 'name: CI\non:\n  push:\n    branches:\n      - main\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n',
      expectedAnswer: 'name: CI\non:\n  push:\n    branches:\n      - main\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo "Running build on main"',
      points: 20,
      validationCriteria: {
        requiredElements: ['name:', 'on:', 'push:', 'branches:', 'main', 'runs-on: ubuntu-latest', 'steps:']
      },
      explanation: 'GitHub Actions triggers workflows on events like pushes to specified branches.'
    },
    {
      id: 'ghactions_q2',
      skill: 'GitHub Actions',
      questionNumber: 2,
      difficulty: 'easy_medium',
      type: 'code',
      question: 'Write the steps in a GitHub Actions workflow to check out code with actions/checkout@v4, setup Node.js 20 using actions/setup-node@v4 with npm caching enabled, and run "npm ci" followed by "npm test".',
      starterCode: 'steps:\n  - name: Checkout Code\n    uses: actions/checkout@v4\n  # Add setup-node and test commands\n',
      expectedAnswer: 'steps:\n  - name: Checkout Code\n    uses: actions/checkout@v4\n  - name: Setup Node.js\n    uses: actions/setup-node@v4\n    with:\n      node-version: 20\n      cache: "npm"\n  - name: Install Dependencies\n    run: npm ci\n  - name: Run Tests\n    run: npm test',
      points: 20,
      validationCriteria: {
        requiredElements: ['actions/checkout@v4', 'actions/setup-node@v4', 'node-version: 20', 'npm ci', 'npm test']
      },
      explanation: 'Uses actions/setup-node with caching to accelerate dependency installations.'
    },
    {
      id: 'ghactions_q3',
      skill: 'GitHub Actions',
      questionNumber: 3,
      difficulty: 'medium',
      type: 'code',
      question: 'Write a matrix strategy in GitHub Actions to test across multiple Node versions (18, 20, 22) and operating systems (ubuntu-latest, macos-latest).',
      starterCode: 'jobs:\n  test:\n    strategy:\n      matrix:\n        # Define node and os matrix\n    runs-on: ${{ matrix.os }}\n',
      expectedAnswer: 'jobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, macos-latest]\n        node-version: [18, 20, 22]\n    runs-on: ${{ matrix.os }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node-version }}',
      points: 20,
      validationCriteria: {
        requiredElements: ['strategy:', 'matrix:', 'os:', 'node-version:', 'matrix.os']
      },
      explanation: 'Matrix builds execute combinations of environments concurrently in parallel runners.'
    },
    {
      id: 'ghactions_q4',
      skill: 'GitHub Actions',
      questionNumber: 4,
      difficulty: 'medium_hard',
      type: 'code',
      question: 'Write a step in a GitHub Actions workflow that securely accesses repository secret ${{ secrets.PROD_API_KEY }} as an environment variable and makes an HTTP request with curl.',
      starterCode: '- name: Deploy Notification\n  env:\n    API_KEY: \n  run: |\n',
      expectedAnswer: '- name: Deploy Notification\n  env:\n    API_KEY: ${{ secrets.PROD_API_KEY }}\n  run: |\n    curl -X POST https://api.example.com/deploy \\\n      -H "Authorization: Bearer $API_KEY" \\\n      -d \'{"status": "success"}\'',
      points: 20,
      validationCriteria: {
        requiredElements: ['secrets.PROD_API_KEY', 'env:', 'curl', 'Bearer']
      },
      explanation: 'Secrets are referenced via ${{ secrets.NAME }} and masked automatically in runner logs.'
    },
    {
      id: 'ghactions_q5',
      skill: 'GitHub Actions',
      questionNumber: 5,
      difficulty: 'hard',
      type: 'code',
      question: 'Write a complete workflow job that builds a Docker image and pushes it to GitHub Container Registry (ghcr.io) using docker/login-action and docker/build-push-action, using ${{ secrets.GITHUB_TOKEN }}.',
      starterCode: 'jobs:\n  publish:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n      # Log into GHCR and build/push image\n',
      expectedAnswer: 'jobs:\n  publish:\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    steps:\n      - uses: actions/checkout@v4\n      - name: Log in to GHCR\n        uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - name: Build and Push Docker image\n        uses: docker/build-push-action@v5\n        with:\n          context: .\n          push: true\n          tags: ghcr.io/${{ github.repository }}:latest',
      points: 20,
      validationCriteria: {
        requiredElements: ['docker/login-action', 'docker/build-push-action', 'ghcr.io', 'GITHUB_TOKEN', 'push: true']
      },
      explanation: 'Uses official Docker actions and the built-in GITHUB_TOKEN with packages: write permissions.'
    }
  ]
};
