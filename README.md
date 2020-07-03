# BEEP Project

<a name="abstraction"></a>
## Abstraction

BEEP project contains some sub applications, they are

1. BEEP Ordering
1. BEEP Cashback (Loyalty)
1. BEEP QRScaner

This project is bootstrapped by [CRA (Create React App)](https://create-react-app.dev/docs/getting-started), which
is now so popular for quick started and production friendly.

## Table of contents

1. [Abstraction](#abstraction)
1. [Developing components in Isolation](#isolation-components)
1. [Get started](#get-started)
    1. [Pre install stuffs](#pre-install-stuffs)
    1. [Quick start](#quick-start)
    1. [when use local mockdata as backend](#quick-start-mockdata-mode)
    1. [when use UAT as backend](#quick-start-uat-integration-mode)
1. [Get started with beepit.com](#get-started-site)
1. [Customize Workbox Service Workers](#customize-workbox-service-workers)
1. [I18N JSON File Style Guide](#i18n-json-style-guide)
1. [Analyzing bundle size](#analyzing-bundle-size)

<a name="isolation-components"></a>
## Developing components in Isolation

If you are a component developer, read this section.

We added `storybook` in project, no need configuring project, just run story book.

```shell script
yarn storybook
``` 

> browser will automatically start on port `9009`  

<a name="get-started"></a>
## Get started

<a name="pre-install-stuffs"></a>
### Pre install stuffs

1. Install `nvm` with Homebrew

    $ `brew install nvm`

2. Install `node` with NVM

    $ `nvm install v8.17.0`

3. Install `yarn` with Homebrew

    $ `brew install yarn`

<a name="quick-start"></a>
### Quick start

1. Init projects

    install dependency

    ```bash
    nvm use v8.17.0
    
    (cd ./frontend; yarn install)
   
    (cd ./backend; git submodule update --init && yarn install)
    ```
   
    > PS, once you change the domain, you need to update
    > 1. `"proxy": "http://nike.storehub.net:7000",` in `./frontend/package.json` file
    > 2. `HOST=nike.storehub.net` in `./frontend/.env` file, if you connect backend
    > 3. restart frontend

2. Init env files

    $ `(cd ./frontend; cp .env.example .env)`
    
    $ `(cd ./backend; cp .env.example .env)`

3. Init backend static folder from frontend

    $ `(cd ./frontend; yarn build)`
    
    build frontend will automatically trigger copy `./frontend/build` to `./backend/client/build`. 
    So backend will use it as static folder to load `index.html` file in it for browsering urls directly.
    
    if you want page to load **static** files from another domain, just set env `PUBLIC_URL` in `.env` file, 
    Eg. `PUBLIC_URL=http://localhost:7070`, means page will load all **static** files from it.
    
    if you want page to call api to **bff** when in development, set up `proxy` in `package.json`, 
    Eg. `"proxy": "http://localhost:7000`, means dev server proxies requests to the **bff**.
    
    Read more to get help from [Proxying API Requests in Development](https://create-react-app.dev/docs/proxying-api-requests-in-development).

<a name="quick-start-mockdata-mode"></a>
#### when use local mockdata as backend

1. Init local domain

    add `127.0.0.1 nike.storehub.net` into `/etc/hosts` file.

    
2. Start mock mode backend and assets server

    start backend in mock api mode:

    $ `(cd ./backend; yarn mockstart)`
    
    start assets server making a show of cdn 😊

    $ `(cd ./backend; yarn publicstart)`
    
    then browse http://nike.storehub.net:7000/ to see result, and this triggers to make cookies ready for frontend dev server as well.

3. Start frontend dev server

    $ `(cd ./frontend; yarn start)`

    then browse http://nike.storehub.net:3000/ to see result

<a name="quick-start-uat-integration-mode"></a>
#### when use UAT as backend

1. Setup to use production back-end. Let's say to use https://ck.beep.test12.shub.us of production as api server. 

    Fill in  `127.0.0.1 ck.local.beep.test12.shub.us` in `/etc/hosts` file
    
    Fill in `HOST=ck.local.beep.test12.shub.us` in `./frontend/.env` file,
    so that dev server bypass domain from frontend to backend.

    Fill in `"proxy": "https://ck.beep.test12.shub.us",` in `./frontend/package.json` file

2. Start up dev

    $ `yarn start`
    
    Browser will open for you.

3. Adjust cookie

    Browse origin site which is behind proxy https://ck.beep.test12.shub.us,
    and edit `domain` of cookies make them `.beep.test12.shub.us` 
    to share with the domain of dev server.
    
4. See result

    Browse dev server site http://ck.local.beep.test12.shub.us

<a name="get-started-site"></a>
## Get started with beepit.com

1. What is beepit.com

this Beep project serves two kind of sites:

  - beepit.com
    * this is a customer landing page, they can discover stores here
    * this is a customer quick qr scan tool as well
  - {business}.beepit.co
    * this is a business store site for customer buy foods
      - can by foods by delivery, pick-up even eating in the hall

2. Configure .env file to support your local domain

for example for `{business}.beep.test15.shub.us` in testing environment,
 to visit by `localhost:3000` host, and HTTPS supported for scanning QR  

```text
REACT_APP_MERCHANT_STORE_URL=https://%business%.beep.test15.shub.us
REACT_APP_QR_SCAN_DOMAINS=localhost,beepit.com,www.beepit.com
HOST=localhost
HTTPS=true
```

3. Restart your front-end then it will work
 

<a name="customize-workbox-service-workers"></a>
## Customize Workbox Service Workers

Get more from [Using Custom Workbox Service Workers with Create-React-App (without ejecting)
](https://karannagupta.com/using-custom-workbox-service-workers-with-create-react-app/)

<a name="i18n-json-style-guide"></a>
## I18N JSON File Style Guide

JSON file name rules:
    
  1. Please use upper camel case (eg: OrderingHome)

Key name rules:
    
  1. Please use upper camel case no including underscores and spaces
  2. Phrase remove spaces as key (eg: "OrderNow": "Order now")
  3. Paragraphs use descriptive phrases as keys (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
    
Content rules:
    
  1. Only the first letter can be capitalized for phrase, except for words like "OK" (eg: "OrderNow": "Order now")
  2. Paragraphs have only the first letter of each sentence capitalized (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
  3. Follow English written rules

When you want to use html tag in translation, please use like:

  ```jsx
  <Trans ns="Ordering" i18nKey="Greeting">hello, <span>User</span></Trans>
  ```

<a name="analyzing-bundle-size"></a>
## Analyzing bundle size

```shell script
yarn build && yarn analyze
```

You will get a web page tool automatically opened for you.
