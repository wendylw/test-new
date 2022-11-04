/**
 * Use this tool to serve production build in the build folder.
 * The api requests will be forwarded to a FAT env, using the same logic as in the dev server.
 *
 * Usage:
 *
 * Before running this script, you should run `yarn build` to generate the production build. (PUBLIC_URL should be unset)
 *
 * Set the following env variables in .env:
 * - PROXY: the backend url you want to forward the api requests to
 *
 * run `yarn start:serve-prod-build [-p <port>]` Default port is 3001
 */

 const path = require('path');
 const fs = require('fs-extra');
 const args = require('yargs')
   .default('port', 3000)
   .alias('port', 'p').argv;
 require('dotenv').config(path.resolve(__dirname, '../'));
 const setupProxy = require('../src/setupProxy');
 
 const express = require('express');
 
 const app = express();
 
 app.use(
   '/i18n',
   express.static(path.resolve(__dirname, '../build/i18n'), {
     maxAge: '30d',
   })
 );
 
 app.use(
   '/static',
   express.static(path.resolve(__dirname, '../build/static'), {
     maxAge: '30d',
   })
 );
 
 setupProxy(app);
 
 // copied from backend/handlers/ogPage.js
 function enablePreloadTags(html, req) {
   let output = html;
   const { path, ogSource } = req;
   const lang = req.acceptsLanguages('en', 'th') || 'en';
   const trimmedPath = path.replace(/\/$/, '');
   let pageName = '';
   if (ogSource === 'beepit.com') {
     if (trimmedPath === '' || trimmedPath === '/home') {
       pageName = 'SITE_HM';
     }
   } else {
     const pageNameMap = {
       '/ordering': 'ORD_MNU',
       '/ordering/cart': 'ORD_SC',
       '/ordering/payment': 'ORD_PMT',
       '/ordering/thank-you': 'ORD_TY',
       '/ordering/login': 'ORD_PL',
       '/home': 'SITE_HM',
       '/loyalty/claim': 'CB_CL',
     };
     pageName = pageNameMap[trimmedPath] || '';
   }
   try {
     if (lang && pageName) {
       const preloadKey = `${lang}/${pageName}`;
       // strip the surrounding comment tags "<!--[PRELOAD:xxx] <link/> -->" will be "<link/>"
       // .*? is a non-greedy match (i.e. it will match the shortest possible string)
       output = output.replace(new RegExp(`<!--\\[PRELOAD:${preloadKey}\\](.*?)-->`), '$1');
     }
     // remove unused preload tags to save data
     output = output.replace(new RegExp(`<!--\\[PRELOAD:.*?\\](.*?)-->`, 'g'), '');
   } catch (error) {
     output = html;
     req.logger.error(error);
   }
   return output;
 }
 
 app.use('*', async (req, res) => {
   try {
     let html = await fs.readFile(path.resolve(__dirname, '../build/index.html'), 'utf8');
     html = enablePreloadTags(html, req);
     res.send(html);
   } catch (err) {
     res.status(500).send(err);
   }
 });
 
 app.listen(args.port, () => {
   console.log(`Serving production build on port ${args.port}!`);
 });