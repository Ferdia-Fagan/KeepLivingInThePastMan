var extension;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 327:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {makeUrlAbsolute, parseUrl} = __webpack_require__(898);

function getProvider(host) {
  return host
    .replace(/www[a-zA-Z0-9]*\./, '')
    .replace('.co.', '.')
    .split('.')
    .slice(0, -1)
    .join(' ');
}

function buildRuleSet(ruleSet) {
  return (doc, context) => {
    let maxScore = 0;
    let maxValue;

    for (let currRule = 0; currRule < ruleSet.rules.length; currRule++) {
      const [query, handler] = ruleSet.rules[currRule];

      const elements = Array.from(doc.querySelectorAll(query));

      if(elements.length) {
        for (const element of elements) {
          let score = ruleSet.rules.length - currRule;

          if (ruleSet.scorers) {
            for (const scorer of ruleSet.scorers) {
              const newScore = scorer(element, score);

              if (newScore) {
                score = newScore;
              }
            }
          }

          if (score > maxScore) {
            maxScore = score;
            maxValue = handler(element);
          }
        }
      }
    }

    if (!maxValue && ruleSet.defaultValue) {
      maxValue = ruleSet.defaultValue(context);
    }

    if (maxValue) {
      if (ruleSet.processors) {
        for (const processor of ruleSet.processors) {
          maxValue = processor(maxValue, context);
        }
      }

      if (maxValue.trim) {
        maxValue = maxValue.trim();
      }

      return maxValue;
    }
  };
}

const metadataRuleSets = {
  description: {
    rules: [
      ['meta[property="og:description"]', element => element.getAttribute('content')],
      ['meta[name="description" i]', element => element.getAttribute('content')],
    ],
  },

  icon: {
    rules: [
      ['link[rel="apple-touch-icon"]', element => element.getAttribute('href')],
      ['link[rel="apple-touch-icon-precomposed"]', element => element.getAttribute('href')],
      ['link[rel="icon" i]', element => element.getAttribute('href')],
      ['link[rel="fluid-icon"]', element => element.getAttribute('href')],
      ['link[rel="shortcut icon"]', element => element.getAttribute('href')],
      ['link[rel="Shortcut Icon"]', element => element.getAttribute('href')],
      ['link[rel="mask-icon"]', element => element.getAttribute('href')],
    ],
    scorers: [
      // Handles the case where multiple icons are listed with specific sizes ie
      // <link rel="icon" href="small.png" sizes="16x16">
      // <link rel="icon" href="large.png" sizes="32x32">
      (element, score) => {
        const sizes = element.getAttribute('sizes');

        if (sizes) {
          const sizeMatches = sizes.match(/\d+/g);
          if (sizeMatches) {
            return sizeMatches[0];
          }
        }
      }
    ],
    defaultValue: (context) => 'favicon.ico',
    processors: [
      (icon_url, context) => makeUrlAbsolute(context.url, icon_url)
    ]
  },

  image: {
    rules: [
      ['meta[property="og:image:secure_url"]', element => element.getAttribute('content')],
      ['meta[property="og:image:url"]', element => element.getAttribute('content')],
      ['meta[property="og:image"]', element => element.getAttribute('content')],
      ['meta[name="twitter:image"]', element => element.getAttribute('content')],
      ['meta[property="twitter:image"]', element => element.getAttribute('content')],
      ['meta[name="thumbnail"]', element => element.getAttribute('content')],
    ],
    processors: [
      (image_url, context) => makeUrlAbsolute(context.url, image_url)
    ],
  },

  keywords: {
    rules: [
      ['meta[name="keywords" i]', element => element.getAttribute('content')],
    ],
    processors: [
      (keywords, context) => keywords.split(',').map((keyword) => keyword.trim())
    ]
  },

  title: {
    rules: [
      ['meta[property="og:title"]', element => element.getAttribute('content')],
      ['meta[name="twitter:title"]', element => element.getAttribute('content')],
      ['meta[property="twitter:title"]', element => element.getAttribute('content')],
      ['meta[name="hdl"]', element => element.getAttribute('content')],
      ['title', element => element.text],
    ],
  },

  language: {
    rules: [
      ['html[lang]', element => element.getAttribute('lang')],
      ['meta[name="language" i]', element => element.getAttribute('content')],
    ],
    processors: [
      (language, context) => language.split('-')[0]
    ]
  },

  type: {
    rules: [
      ['meta[property="og:type"]', element => element.getAttribute('content')],
    ],
  },

  url: {
    rules: [
      ['a.amp-canurl', element => element.getAttribute('href')],
      ['link[rel="canonical"]', element => element.getAttribute('href')],
      ['meta[property="og:url"]', element => element.getAttribute('content')],
    ],
    defaultValue: (context) => context.url,
    processors: [
      (url, context) => makeUrlAbsolute(context.url, url)
    ]
  },

  provider: {
    rules: [
      ['meta[property="og:site_name"]', element => element.getAttribute('content')]
    ],
    defaultValue: (context) => getProvider(parseUrl(context.url))
  },
};

function getMetadata(doc, url, customRuleSets) {
  const metadata = {};
  const context = {
    url,
  };

  const ruleSets = customRuleSets || metadataRuleSets;

  Object.keys(ruleSets).map(ruleSetKey => {
    const ruleSet = ruleSets[ruleSetKey];
    const builtRuleSet = buildRuleSet(ruleSet);

    metadata[ruleSetKey] = builtRuleSet(doc, context);
  });

  return metadata;
}

module.exports = {
  buildRuleSet,
  getMetadata,
  getProvider,
  metadataRuleSets
};


/***/ }),

/***/ 898:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

if (__webpack_require__.g.URL !== undefined) {
  // We're in Firefox
  module.exports = {
    makeUrlAbsolute(base, relative) {
      return new URL(relative, base).href;
    },
    parseUrl(url) {
      return new URL(url).host;
    }
  };
} else {
  // We're in Node.js
  const urlparse = __webpack_require__(866);
  module.exports = {
    makeUrlAbsolute(base, relative) {
      const relativeParsed = urlparse.parse(relative);

      if (relativeParsed.host === null) {
        return urlparse.resolve(base, relative);
      }

      return relative;
    },
    parseUrl(url) {
      return urlparse.parse(url).hostname;
    }
  };
}



/***/ }),

/***/ 866:
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var page_metadata_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(327);
/* harmony import */ var page_metadata_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(page_metadata_parser__WEBPACK_IMPORTED_MODULE_0__);


console.log("WebpageExtrractionLayer has been imported")

/**
 * This will listen for messages from the background scripts
 */
browser.runtime.onMessage.addListener(request => {
    if(request.messageType == "askForTitle"){
        console.log("current page being asked for title")

        return Promise.resolve(document.title);
    }
    else if(request.messageType == "askForScrapings"){

        console.log("The page is being asked to scrape")
        
        let webpageMetadata = getWebpageMetadata();

        webpageMetadata["scrapedContent"] = ScrapeWebPage();
        
        return Promise.resolve(webpageMetadata);
    }
    return Promise.resolve({});
});

function getWebpageMetadata(){
    const metadata = page_metadata_parser__WEBPACK_IMPORTED_MODULE_0___default().getMetadata(document, window.location)

    const webpageTitle = encodeURIComponent(metadata.title);
    
    const webpageImageUrl = ((metadata.image !== undefined)? encodeURI(metadata.image):((metadata.icon !== undefined)? encodeURI(metadata.icon) : null));

    const webpageUrl = encodeURI(metadata.url); //TODO: I DONT KNOW IF CANONICAL URL IS BETTER. i THINK IT IS. SHOULD BE REPLACED

    return {title:webpageTitle, url: webpageUrl, imgUrl: webpageImageUrl}
}

/**
 * @description
 * scrapes the web page of 
 * @returns 
 * html body text
 */
function ScrapeWebPage(){
    return document.body.innerText.trim().replace(/[^a-zA-Z ]/g, " ").replace(/\s\s+/g, ' ');
}
})();

extension = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=WebpageExtractionLayer.js.map