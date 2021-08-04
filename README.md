# BEEP

## Table of contents

1. [Abstraction](#abstraction)
2. [Environments](#environments)
3. [Get started](#get-started)
   1. [Test environment .ENV](#env)
   2. [Installation](#installation)
   3. [Start F&B && Loyalty](#start-ordering-loyalty)
   4. [Start Beep Entrance](#beep-entrance)
   5. [Online Debug](#online-debug)
4. [Customize Workbox Service Workers](#customize-workbox-service-workers)
5. [I18N JSON File Style Guide](#i18n-json-style-guide)
6. [Style Guide](#style-guide)
7. [Analyzing bundle size](#analyzing-bundle-size)
8. [Trouble Shooting](#trouble-shooting)
9. [Heap name convention for loggly](https://storehub.atlassian.net/wiki/spaces/SHFET/pages/617087695/Heap+name+convention)
10. [Release Flow](https://github.com/storehubnet/beep-v1-web/wiki/Release-Flow)
11. [Test URL](https://github.com/storehubnet/beep-v1-web/wiki/Test-URL)

<a name="abstraction"></a>

## Abstraction

Front end of this project is bootstrapped by [CRA (Create React App)](https://create-react-app.dev/docs/getting-started).

<a name="environments"></a>

## Environments

- nvm
- node 12.17.x
- yarn

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

### Test environment .ENV

Please contact the project administrator to access apollo https://apollo.shub.us/config.html?#/appid=beep-v1-web , Some local environment variables need to use the value of the test environment

<a name="start-ordering-loyalty"></a>

### Start F&B && Loyalty

1. Set local domain

{business} name can pick one account name from https://storehub.atlassian.net/wiki/spaces/QA/pages/1272873047/Test+Account

```sh
(sudo) vim /etc/hosts (on Mac)
127.0.0.1 {business}.local.beep.shub.us
```

2. Update .env
   Update to `HOST={business}.local.beep.shub.us` on `frontend/.env` (1. local domain)
   Update `REACT_APP_GOOGLE_MAPS_API_KEY, REACT_APP_CLEVER_TAP_ID, REACT_APP_CLEVER_TAP_SCRIPT_REGION` on `frontend/.env` (2. from Apollo)

3. Start project
   > [Beep(F&B and Cashback) Setup](<https://storehub.atlassian.net/wiki/spaces/DP/pages/141820051#id-%E6%96%B0%E6%89%8B%E5%85%A5%E9%97%A8%E6%8C%87%E5%8D%97%EF%BC%88%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%EF%BC%89---Beep(F&BandCashback)Setup>): Steps to start core api and ecommerce api

- Quickly start ordering using the test environment (Recommendation)
  [Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development/)

  > 1. Update `PROXY=https://{business}.beep.test{11~19}.shub.us` of `frontend/.env` (please confirm with project owner)
  > 2. `cd frontend/ && yarn start`
  > 3. Visiting URL: {business}.local.beep.shub.us:3000
  > 4. Set \_\_s to local ordering page cookie from PROXY testing environment
  > 5. Set deliveryAddress to local sessionStorage from PROXY testing environment

- Start ordering on backend (Recommend to back-end developers)

  > 1. Start mongo
  > 2. Start redis `redis-server`
  > 3. Please clone [core-api](https://github.com/storehubnet/core-api.git) and [ecommerce-v1-api](https://github.com/storehubnet/ecommerce-v1-api.git) to locale and start
  > 4. Back to `beep-v1-web` and update `PROXY=http://localhost:7000` of `frontend/.env`
  > 5. `cd frontend/ && yarn build`
  > 6. Update `backend/.env`
  > 7. `cd backend/ && yarn start`
  > 8. Visiting URL: {business}.local.beep.shub.us:7000

- Start ordering using local backend
  > 1. Start mongo
  > 2. Start redis `redis-server`
  > 3. Please clone [core-api](https://github.com/storehubnet/core-api.git) and [ecommerce-v1-api](https://github.com/storehubnet/ecommerce-v1-api.git) to locale and start
  > 4. Update `backend/.env`
  > 5. `cd backend/ && yarn start`
  > 6. Back to `beep-v1-web` and update `PROXY=http://localhost:7000` of `frontend/.env`
  > 7. `cd frontend/ && yarn start`
  > 8. Visiting URL: {business}.local.beep.shub.us:3000

<a name="beep-entrance"></a>

### Beep Entrance

1. Update .env

```sh
REACT_APP_MERCHANT_STORE_URL=http://%business%.beep.local.shub.us:3000
REACT_APP_QR_SCAN_DOMAINS={business}.local.beep.shub.us

```

2. Start site
   > 1. `cd frontend/ && yarn start`
   > 2. Visiting Site URL: {business}.local.beep.shub.us:3000/home
   > 3. Visiting Scan Page URL: {business}.local.beep.shub.us:3000/qrscan

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
   #### on uat environment
   ```sh
   yarn serve:sourcemap --bucket beep-v2-uat
   ```

<a name="customize-workbox-service-workers"></a>

## Customize Workbox Service Workers

Get more from [Using Custom Workbox Service Workers with Create-React-App (without ejecting)
](https://karannagupta.com/using-custom-workbox-service-workers-with-create-react-app/)

<a name="i18n-json-style-guide"></a>

## I18N JSON File Style Guide

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
