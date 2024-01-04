# BEEP

## Table of contents

1. [Abstraction](#abstraction)
2. [Environments](#environments)
3. [Setup](#setup)
4. [Get started](#get-started)
   1. [Installation](#installation)
   2. [Test environment .ENV](#env)
   3. [Set local domain](#set-local-domain)
   4. [Start F&B && Loyalty](#start-ordering-loyalty)
   5. [Start Beep Entrance](#beep-entrance)
   6. [Online Debug](#online-debug)
5. [Customize Workbox Service Workers](#customize-workbox-service-workers)
6. [I18N JSON File Style Guide](#i18n-json-style-guide)
7. [Style Guide](#style-guide)
8. [Analyzing bundle size](#analyzing-bundle-size)
9. [Trouble Shooting](#trouble-shooting)
10. [data-test-id name convention for log](https://storehub.atlassian.net/wiki/spaces/TS/pages/617087695/data-test-id+name+convention)
11. [Test URL](https://github.com/storehubnet/beep-v1-web/wiki/Test-URL)

<a name="abstraction"></a>

## Abstraction

Front end of this project is bootstrapped by [CRA (Create React App)](https://create-react-app.dev/docs/getting-started).

<a name="environments"></a>

## Environments

- nvm
- node 12.17.x
- yarn

<a name="setup"></a>

## Setup

```
# Install npm-cli-login package on global
npm install npm-cli-login -g

# setup the StoreHub private register
npm config set registry https://npm-proxy.fury.io/byP2nuz4Las5rf72y98D/storehub/ && npm config set ca ""

# Login on the register
npm-cli-login -u storehub -e developer@storehub.com -p "a[RF8zZy" -r https://npm-proxy.fury.io/byP2nuz4Las5rf72y98D/storehub/
```

<a name="get-started"></a>

## Get started

<a name="installation"></a>

### Installation

Under the frontend folder

```sh
cp .env.example .env
nvm use v12.17
yarn
```

<a name="test-environment-env"></a>

### Test environment .ENV (Skip if done)

Please contact the project administrator to access apollo https://apollo.shub.us/config.html?#/appid=beep-v1-web , Some local environment variables need to use the value of the test environment

<a name="set-local-domain"></a>

### Set local domain (Skip if done)

{business} name can pick one account name from https://storehub.atlassian.net/wiki/spaces/QA/pages/1272873047/Test+Account

```sh
(sudo) vim /etc/hosts (on Mac)
127.0.0.1 {business}.beep.local.shub.us
127.0.0.1 scan.beep.local.shub.us
```

<a name="start-ordering-loyalty"></a>

### Start F&B && Loyalty

1. Update .env

   > 1. Update to `HOST={business}.beep.local.shub.us` on `frontend/.env` (1. local domain)
   > 2. Update `REACT_APP_GOOGLE_MAPS_API_KEY`, `REACT_APP_CLEVER_TAP_ID` and `REACT_APP_CLEVER_TAP_SCRIPT_REGION` on `frontend/.env` (2. from Apollo FAT)

2. Start project

- Quickly start ordering using the test environment (Recommendation)
  [Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

  > 1. Update `PROXY=https://{business}.beep.test{11~20}.shub.us` of `frontend/.env` (please confirm with project owner)
  > 2. `cd frontend/ && yarn start`
  > 3. Visiting URL: `{business}.beep.local.shub.us:3000`
  > 4. In `{business}.beep.local.shub.us:3000/ordering/location`.If you need to fill in location, please enter KLCC
  > 5. Set \_\_s to local ordering page cookie from PROXY testing environment (optional)
  > 6. Set deliveryAddress to local sessionStorage from PROXY testing environment (optional)

- (Optional) Using HTTPS in Development

  > 1. Run `yarn generate-dev-ssl-cert` to create a certificate authority on your machine and generate certificates for this project.
  > 2. Run `yarn start:https` to serve pages over HTTPS.

- Start ordering using local backend

  > 1. [Set up and Run Backend](https://github.com/storehubnet/beep-v1-web/tree/master/backend#beep)
  > 2. Back to frontend folder
  > 3. Update `PROXY=http://localhost:7000` of `frontend/.env`
  > 4. The remaining steps are the same as steps 3 ~ 6 of `Quickly start ordering using the test environment (Recommendation)`

- Start ordering on backend (Recommend to back-end developers)

  > 1. Update `PROXY=http://localhost:7000` of `frontend/.env`
  > 2. `yarn build` on frontend folder
  > 3. [Set up and Run Backend](https://github.com/storehubnet/beep-v1-web/tree/master/backend#beep)
  > 4. Visiting URL: {business}.beep.local.shub.us:7000

<a name="beep-entrance"></a>

### Beep Entrance

1. Update .env

   > 1. Update to `REACT_APP_MERCHANT_STORE_URL=http://%business%.beep.local.shub.us:3000` on `frontend/.env` (1. local domain)
   > 2. Update to `REACT_APP_QR_SCAN_DOMAINS={business}.beep.local.shub.us` on `frontend/.env` (1. local domain)
   > 3. Update to `HOST=scan.beep.local.shub.us` on `frontend/.env` (1. local domain)

2. Start site

- Quickly start site using the test environment (Recommendation)
  [Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

  > 1. Update `PROXY=https://scan.beep.test{11~20}.shub.us` of `frontend/.env` (please confirm with project owner)
  > 2. `cd frontend/ && yarn start`
  > 3. Visiting Site URL: scan.beep.local.shub.us:3000/home
  > 4. In `scan.beep.local.shub.us:3000/ordering/location`.If you need to fill in location, please enter KLCC
  > 5. Visiting Scan Page URL: scan.beep.local.shub.us:3000/qrscan

- Start ordering using local backend (Same as F&B && Loyalty)

- Start ordering on backend (Same as F&B && Loyalty)

<a name="online-debug"></a>

### Online Debug (Source Map)

1. Setting aws keys

   ```sh
   open ~/.aws/credentials
   ```

   Update `aws_access_key_id` and `aws_secret_access_key`

2. Start source map
   #### on testing environment
   ```sh
   yarn serve:sourcemap --bucket beep-v2-web
   ```
   #### on staging environment
   ```sh
   yarn serve:sourcemap --bucket beep-v2-staging
   ```

<a name="customize-workbox-service-workers"></a>

## Customize Workbox Service Workers

Get more from [Using Custom Workbox Service Workers with Create-React-App (without ejecting)
](https://karannagupta.com/using-custom-workbox-service-workers-with-create-react-app/)

<a name="i18n-json-style-guide"></a>

## I18N JSON File Style Guide

[react-i18next Doc](https://react.i18next.com/)

### JSON file name rules:

- Please use upper camel case (eg: OrderingHome)

### Key name rules:

- Please use upper camel case no including underscores and spaces
- Phrase remove spaces as key (eg: "OrderNow": "Order now")
- Paragraphs use descriptive phrases as keys (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")

### Content rules:

- Only the first letter can be capitalized for phrase, except for words like "OK" (eg: "OrderNow": "Order now")
- Paragraphs have only the first letter of each sentence capitalized (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
- Follow English written rules

When you want to use html tag in translation, please use like:

```jsx
<Trans ns="Ordering" i18nKey="Greeting">
  hello, <span>User</span>
</Trans>
```

<a name="style-guide"></a>

## Style Guide

If you create a public component under `/frontend/src/components/`, please update the library in the style guide

### Start up the Style Guide locally

> browser will automatically start on port `9009`

```shell script
yarn storybook
```

### Manually publish style guide

```shell script
cd ./frontend && yarn && yarn chromatic --project-token=ejo2it5a6d
```

<a name="analyzing-bundle-size"></a>

## Analyzing bundle size

You need to comment some sentry settings on .env of frontend

```shell script
cd ./frontend
# SENTRY_ORG=
# SENTRY_PROJECT=
# SENTRY_AUTH_TOKEN=
# SENTRY_URL=
```

```shell script
yarn build && yarn analyze
```

<a name="trouble-shooting"></a>

## Trouble Shooting

- If you push origin repo, terminal response
  `
  Warning: Setting pre-push script in package.json > scripts will be deprecated
  Please move it to husky.hooks in package.json, a .huskyrc file, or a husky.config.js file
  Or run ./node_modules/.bin/husky-upgrade for automatic update

See https://github.com/typicode/husky for usage

husky > pre-push (node v12.17.0)
sh: ../git_hooks/copy: No such file or directory
husky > pre-push hook failed (add --no-verify to bypass)
error: failed to push some refs to 'https://github.com/storehubnet/beep-v1-web.git'
`

```shell script
rm -rf node_modules/
rm ../.git/hooks/pre-commit
cd ../backend/
yarn prepush
cd ../frontend
git push origin ${branch-name}
```

- If you push origin repo, terminal response
  `-e >>> FILE .env.example NOT FOUND error: failed to push some refs to 'https://github.com/storehubnet/beep-v1-web.git'`

```shell script
cd ../backend/
cp .env.example .env
cd ../frontend
git push origin ${branch-name}
```

If terminal response
`lint-staged requires at least version x.x.x of Node, please upgrade husky > pre-commit hook failed (add --no-verify to bypass)`

```
nvm use v12.17
```

- If `yarn` error - unable to get local issuer certificate

```shell script
yarn config set "strict-ssl" false
```

- If `yarn start`
  `
  There might be a problem with the project dependency tree.
  It is likely not a bug in Create React App, but something you need to fix locally.

  The react-scripts package provided by Create React App requires a dependency:

  "babel-loader": "8.1.0"

  Don't try to install it manually: your package manager does it automatically.
  However, a different version of babel-loader was detected higher up in the tree:

  /Users/alanrussell/Documents/playground/sb-sc-bug-repro/node_modules/babel-loader (version: 8.2.1)

  Manually installing incompatible versions is known to cause hard-to-debug issues.
  `

  ```shell script
  npm i yarn -g
  ```
