This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
## development mode with mock data

run `yarn mockstart` in the backend <br>
run `yarn start` in the frontend <br>
this way allow you to start project with mock data.

## API demo

Start up `marketplace-api`, and let's adapt it with `graphql-faker` tool (because our api project is not allowed with CORS).

```
graphql-faker --extend http://localhost:5000/graphql
```

## Customize Workbox Service Workers

[Using Custom Workbox Service Workers with Create-React-App (without ejecting)
](https://karannagupta.com/using-custom-workbox-service-workers-with-create-react-app/)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## i18n

i18next v10+
i18next-browser-languagedetector
react-i18next

### Load using a backend plugin

github document: https://github.com/i18next/i18next-xhr-backend

### localization json file rules

```
JSON file name rules:

1.  Please use upper camel case (eg: OrderingHome)

Key name rules:

1. Please use upper camel case no including underscores and spaces
2. Phrase remove spaces as key (eg: "OrderNow": "Order now")
3. Paragraphs use descriptive phrases as keys (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")

Content rules:

1. Only the first letter can be capitalized for phrase, except for words like "OK" (eg: "OrderNow": "Order now")
2. Paragraphs have only the first letter of each sentence capitalized (eg: "ClaimedProcessingText": "You've earned more cashback! We'll add it once it's been processed.")
3. Follow English written rules
```
