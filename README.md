# BEEP Project

## Abstraction

BEEP project contains some sub applications, they are

1. BEEP Ordering
1. BEEP Cashback (Loyalty)
1. BEEP QRScaner

This project is bootstrapped by [CRA (Create React App)](https://create-react-app.dev/docs/getting-started), which
is now so popular for quick started and production friendly.

## Get Started

### Pre install stuffs

1. Install `nvm` with Homebrew

    $ `brew install nvm`

2. Install `node` with NVM

    $ `nvm install v8.17.0`

3. Install `yarn` with Homebrew

    $ `brew install yarn`

### Quick Start

1. Init project

    ```shell script
    nvm use v8.17.0
    
    cd ./frontend
    yarn install
    ```

2. Setup to use production back-end. Let's say to use https://ck.beep.test12.shub.us of production as api server. 

    $ `sudo vim /etc/hosts`

    Fill in  `127.0.0.1 ck.local.beep.test12.shub.us`
    
    $ `cp .env.example .env`

    $ `vim .env`
    
    Fill in `HOST=ck.local.beep.test12.shub.us`, to help CRA can open browser for correct domain of dev server.
    
    $ `vim ./package.json`
    
    Fill in `"proxy": "https://ck.beep.test12.shub.us",`

3. Start up dev

    $ `yarn start`
    
    Browser will open for you.

4. Adjust cookie

    Browse origin site which is behind proxy https://ck.beep.test12.shub.us,
    and edit `domain` of cookies make them `.beep.test12.shub.us` 
    to share with the domain of dev server.
    
5. See result

    Browse dev server site http://ck.local.beep.test12.shub.us

## Mock data

### Development Mode With Mock Data

> TODO: we have a standalone mock server named `frontend-dev-mock-server` 

run `yarn mockstart` in the backend <br>
run `yarn start` in the frontend <br>
this way allow you to start project with mock data.

## Customize Workbox Service Workers

Get more from [Using Custom Workbox Service Workers with Create-React-App (without ejecting)
](https://karannagupta.com/using-custom-workbox-service-workers-with-create-react-app/)


### I18N JSON File Style Guilde

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

## Analyzing Bundle Size

```shell script
yarn build
yarn analyze
```

You will get a web page tool automatically opened for you.
