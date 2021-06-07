# GCP Cloud Function with NodeJS connecting to VM with SQL Server 

PoC of Cloud Function with NodeJS 14 connecting to SQL Server of a GCP Compute Engine VM Instance.

## Setting up the environment
1. Create GCP account and create a project (https://cloud.google.com)
2. Create a project in console GCP (https://console.cloud.google.com/projectcreate). For this demo the project is `Pandero-PoCs`
3. Download and install GCP Cloud SDK (https://cloud.google.com/sdk/docs/install)
4. Install NodeJS v14 (Optional: could be use Node Version Manager NVM)
5. Install Functions Framework 
```bash
npm install -g @google-cloud/functions-emulator
```

## Installing

1. Install dependencies of package.json (restricted with package-lock.json) with NPM
```bash
npm install
```

2. Create a file called `.env-dev.yaml` (file yaml for environment) in the dir root. This file will be in .gitignore
```bash
NODE_ENV: dev
DB_HOST: localhost
DB_PORT: '1433'
DB_NAME: AdventureWorksLT2017
DB_INSTANCE: MSSQLSERVER
DB_USERNAME: demo
DB_PASSWORD: [encryptedStrongPassword] ## should be save in vault
```

## Running locally

1. Run express server locally using Functions-framework. (This use script `start` that converts the `.env-dev.yaml` to json file then execute env-cmd to load env variables to Functions-Framework)
```bash
npm run start
```

### Deploying to GCP
1. Login to GCP and set project
```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
gcloud config list # To check our GCP local config
```

2. Deploy to GCP.  (This use script `deploy` that deploy briefly to GCP)
```bash
npm run deploy

#Or use directly
gcloud functions deploy myDemoFunction --runtime=nodejs14 --trigger-http --allow-unauthenticated --env-vars-file .env-prod.yaml
```