# Deploy
### Deploy command
``` bash
sls deploy --aws-profile profile => dev stage by default
```

### Deploy to specific stage
```bash
sls deploy --stage (staging, prod) --aws-profile profile
```

# Local run for testing purposes
### Run a single function
```bash
sls invoke local \
--function \ # function name from serverless.yml
--path <path-to-json-event> \ # event that the handler method receives
--contextPath # context to store, not mandatory
```

### Run the whole application locally
#### Plugins: serverless-dynamdb-local, serverless-offline
#### Config plugins in serverless.yml
```yaml
custom:
 serverless-offline:
  port: 3003
```

#### Install and run dynamodb locally
```bash
sls dynamodb install && sls dynamodb start
```
#### Start application offline:
```bash
sls offline
```