# BEEP

## Table of contents

1. [Abstraction](#abstraction)
2. [Environments](#environments)
3. [Get started](#get-started)
    1. [.ENV file](#env)
    2. [Installation](#installation)
    3. [Start F&B && Loyalty](#start-ordering-loyalty)
    4. [Start Beep Entrance](#beep-entrance)
    4. [Online Debug](#online-debug)
5. [Customize Workbox Service Workers](#customize-workbox-service-workers)
6. [I18N JSON File Style Guide](#i18n-json-style-guide)
7. [Style Guide](#style-guide)
8. [Analyzing bundle size](#analyzing-bundle-size)
9. <a href="https://github.com/storehubnet/beep-v1-web/wiki/Release-Flow" target="_blank">Release Flow</a>
10. [Test URL](https://github.com/storehubnet/beep-v1-web/wiki/Test-URL){:target="_blank"}

<a name="abstraction"></a>
## Abstraction

Beep project contains some products of StoreHub, they are

1. F&B (Ordering)
2. Loyalty (Cashback)
3. Beep Entrance (Site)

Front end of this project is bootstrapped by [CRA (Create React App)](https://create-react-app.dev/docs/getting-started){:target="_blank"}.

<a name="environments"></a>
## Environments

- node 12.x
- yarn
- mongod >= 4
- redis >= 5

<a name="get-started"></a>
## Get started

<a name="env"></a>
### .ENV
Please contact the project administrator to access apollo https://apollo.shub.us/config.html?#/appid=beep-v1-web

<a name="installation"></a>
### Installation

```sh
cd frontend/ && cp .env.example .env
yarn
```

```sh
cd ./backend
git submodule update --init -f
cp .env.example .env
yarn
```

<a name="start-ordering-loyalty"></a>
### Start F&B && Loyalty

1. Set local domain
```sh
(sudo) vim /etc/hosts (on Mac)
127.0.0.1 {business}.local.beep.test16.shub.us
```

2. Update .env
Update to `HOST={business}.local.beep.test16.shub.us` on `frontend/.env` (1. local domain)

3. Start project
> [Beep(F&B and Cashback) Setup](https://storehub.atlassian.net/wiki/spaces/DP/pages/141820051#id-%E6%96%B0%E6%89%8B%E5%85%A5%E9%97%A8%E6%8C%87%E5%8D%97%EF%BC%88%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%EF%BC%89---Beep(F&BandCashback)Setup){:target="_blank"}: Steps to start core api and ecommerce api

* Quickly start ordering using the test environment (Recommendation)
    [Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development/)
    > 1. Update `PROXY=https://{business}.beep.test{11~19}.shub.us` of `frontend/.env` (please confirm with project owner)
    > 2. `cd frontend/ && yarn start`
    > 3. Visiting URL: {business}.local.beep.test16.shub.us:3000
    > 4. Set __s to local ordering page cookie from PROXY testing environment
    > 5. Set deliveryAddress to local sessionStorage from PROXY testing environment

* Start ordering on backend (Recommend to back-end developers)
    > 1. Start mongo
    > 2. Start redis `redis-server`
    > 3. Please clone [core-api](https://github.com/storehubnet/core-api.git) and [ecommerce-v1-api](https://github.com/storehubnet/ecommerce-v1-api.git) to locale and start
    > 4. Back to `beep-v1-web` and update `PROXY=http://localhost:7000` of `frontend/.env`
    > 5. `cd frontend/ && yarn build`
    > 6. Update `backend/.env`
    > 7. `cd backend/ && yarn start`
    > 8. Visiting URL: {business}.local.beep.test16.shub.us:7000

* Start ordering using local backend
    > 1. Start mongo
    > 2. Start redis `redis-server`
    > 3. Please clone [core-api](https://github.com/storehubnet/core-api.git) and [ecommerce-v1-api](https://github.com/storehubnet/ecommerce-v1-api.git) to locale and start
    > 4. Update `backend/.env`
    > 5. `cd backend/ && yarn start`
    > 6. Back to `beep-v1-web` and update `PROXY=http://localhost:7000` of `frontend/.env`
    > 7. `cd frontend/ && yarn start`
    > 8. Visiting URL: {business}.local.beep.test16.shub.us:3000

<a name="beep-entrance"></a>
### Beep Entrance

1. Update .env
  ```sh
  REACT_APP_MERCHANT_STORE_URL=https://%business%.beep.test{11~19}.shub.us
  REACT_APP_QR_SCAN_DOMAINS={business}.beepit.co,beepit.com,www.beepit.com
  HOST={business}.beepit.co
  ```

2. Start site
    > 1. `cd frontend/ && yarn start`
    > 2. Visiting Site URL: {business}.beepit.co
    > 3. Visiting Scan Page URL: {business}.beepit.co/qrscan

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
    
  * Please use upper camel case (eg: OrderingHome)

### Key name rules:
    
  * Please use upper camel case no including underscores and spaces
  * Phrase remove spaces as key (eg: "OrderNow": "Order now")
  * Paragraphs use descriptive phrases as keys (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
    
### Content rules:
    
  * Only the first letter can be capitalized for phrase, except for words like "OK" (eg: "OrderNow": "Order now")
  * Paragraphs have only the first letter of each sentence capitalized (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
  * Follow English written rules

When you want to use html tag in translation, please use like:

  ```jsx
  <Trans ns="Ordering" i18nKey="Greeting">hello, <span>User</span></Trans>
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

<a name="heap-tracking-code"></a>
## Heap tracking code

Refer to: [Heap name convention](https://storehub.atlassian.net/wiki/spaces/SHFET/pages/617087695/Heap+name+convention)

<a name="analyzing-bundle-size"></a>
## Analyzing bundle size

```shell script
yarn build && yarn analyze
```

You will get a web page tool automatically opened for you.
