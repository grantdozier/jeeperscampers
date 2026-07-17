# Badland Campers

Customer-facing storefront and option builder for Badland off-road camper trailers. Customers can configure a camper, review transparent pricing, and pay in full or reserve a build with a 50% deposit through Stripe Checkout.

## Local development

1. Run `npm install`.
2. Copy `.env.example` to `.env.local` and set `REACT_APP_CHECKOUT_API_BASE` to the deployed Vercel project URL.
3. Run `npm start`.

Use `npm test -- --watchAll=false` for the test suite and `npm run build` for a production build. Stripe/Vercel setup and sandbox test instructions are in [SETUP.md](SETUP.md).

## Deployment

The storefront deploys to GitHub Pages when `main` is pushed. The Stripe API routes in `api/` deploy separately on Vercel and require the environment variables documented in [SETUP.md](SETUP.md).

Launch runbooks:

- [Stripe Checkout](STRIPE-LAUNCH.md)
- [ROAM / Shopify Collective](ROAM-SHOPIFY-COLLECTIVE.md)
- [Deposit Terms](TERMS-DRAFT.md)

---

## Create React App reference

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
