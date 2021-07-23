// const puppeteer = require('puppeteer');

// (async () => {
// //   const pathToExtension = require('path').join(__dirname, 'my-extension');
// /*   const browser = await puppeteer.launch({
//     headless: false,
//     args: [
//       `--disable-extensions-except=${pathToExtension}`,
//       `--load-extension=${pathToExtension}`
//     ]
//   }); */

//   const webExtensionAddress = "/home/empeor/work/COLLEGE/final_year_project/application/git/System/ferdias_fyp/BrowserPlugin/";

//   const customArgs = [
//     `--start-maximized`,
//     `--load-extension=${webExtensionAddress}`
//   ];

//   const browser = await puppeteer.launch({
//     product: "firefox",
//     headless: false,
//     slowMo:50,
//     ignoreDefaultArgs: ["--disable-extensions"],
//     args: customArgs
//   });
// //   const targets = await browser.targets();
// //   const backgroundPageTarget = targets.find(target => target.type() === 'background_page');
// //   const backgroundPage = await backgroundPageTarget.page();
//   // Test the background page as you would any other page.
//   const page2 = await browser.newPage();

// //   await page2.setViewport({
// //       "width": 1440,
// //       "height":10000
// //   })

//   await page2.goto("https://blog.jonudell.net/2019/09/23/controlling-a-browser-extension-with-puppeteer/")
  
  
  
// //   await browser.close();
// })();