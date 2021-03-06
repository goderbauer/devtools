// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// URI parameter to control DevTools analytics collection:
//
//   &gtags=enabled                 // Analytics will display opt-in dialog, if accepted when enabled collects GA.
//   &gtags=disabled                // Default is disabled implies no GA, opt-in not displayed even if opt-in accepted
//                                  // gtags=disabled GA will NEVER be collected.
//   &gtags=reset                   // Resets/deletes user's collection answer in local storage.

// Used for GA collecting (communicating to https://www.googletagmanager.com/gtag/js script).
window.dataLayer = window.dataLayer || [];
function gtag() {
  if (gtagsEnabled()) {
      dataLayer.push(arguments);
  }
}

// Parse the URI parameters.
let _gtagsValue = new URLSearchParams(window.location.search).get('gtags');
let _gtagsReset = _gtagsValue == 'reset';
// By default GA is enabled, if &gtags= is not specified. GA is ONLY collected if opt-in dialog was accepted.
let _gtagsEnabled = _gtagsValue == null || _gtagsValue == 'enabled';
let _gtagsDisabled = _gtagsValue == 'disabled';

function gtagsEnabled() {
  return _gtagsEnabled
}

if (_gtagsReset) {
  localStorage.removeItem(GA_DEVTOOLS_PROPERTY);
}

// Values in local storage:
const _GA_COLLECT = 'collect';
function gaStorageCollect() {
  return _GA_COLLECT;
}
const _GA_DONT_COLLECT = 'do-not-collect';
function gaStorageDontCollect() {
  return _GA_DONT_COLLECT;
}

function gaCollectionAllowed() {
  return localStorage.getItem(GA_DEVTOOLS_PROPERTY) == _GA_COLLECT;
}

let _initializedGA = false;
function isGaInitialized() {
  return gtagsEnabled() && _initializedGA;
}

// InitializeGA with our dimensions. Both the name and order (dimension #) should match the those in gtags.dart
function _initializeGA() {
  if (gtagsEnabled() && gaCollectionAllowed() && !_initializedGA) {
    gtag('js', new Date());
    gtag('config', GA_DEVTOOLS_PROPERTY, {
           'custom_map': {
             // Custom dimensions:
             dimension1: 'user_app',
             dimension2: 'user_build',
             dimension3: 'user_platform',
             dimension4: 'devtools_platform',
             dimension5: 'devtools_chrome',
             dimension6: 'devtools_version',

             // Custom metrics:
             metric1: 'gpu_duration',
             metric2: 'ui_duration',
           }
         });

    _initializedGA = true;
  }
}

_initializeGA();

if (gtagsEnabled()) {
// Record when DevTools browser tab is selected (visible), not selected (hidden) or browser minimized.
    document.addEventListener("visibilitychange", function (e) {
        if (gaCollectionAllowed()) {
            gtag('event', document.visibilityState, {
                event_category: 'application',
            });
        }
    });
}