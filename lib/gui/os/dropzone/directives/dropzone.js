/*
 * Copyright 2016 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const _ = require('lodash');
const fs = require('fs');

/**
 * @summary Dropzone directive
 * @function
 * @public
 *
 * @description
 * This directive provides an attribute to detect a file
 * being dropped into the element.
 *
 * @param {Object} $timeout - Angular's timeout wrapper
 * @returns {Object} directive
 *
 * @example
 * <div os-dropzone="doSomething($file)">Drag a file here</div>
 */
module.exports = ($timeout) => {
  return {
    restrict: 'A',
    scope: {
      osDropzone: '&'
    },
    link: (scope, element) => {
      const domElement = element[0];
      const overlay = domElement.querySelectorAll('.drop-overlay');
      let dragCounter = 0;

      // See https://github.com/electron/electron/blob/master/docs/api/file-object.md

      // We're not interested in this event
      domElement.ondragleave = _.constant(false);

      // Toggle dropzone overlay
      domElement.ondragover = (event) => {
        // Needed to make ondrop trigger
        event.preventDefault();
        _.map(overlay, (elem) => {
          elem.classList.add('drop-hover');
        });
      };
      domElement.ondragend = () => {
        _.map(overlay, (elem) => {
          elem.classList.remove('drop-hover');
        });
      };

      // Entered (another) child of the initial drag element
      _.map(overlay, (elem) => {
        elem.ondragenter = () => {
          dragCounter += 1;
        };
      });

      // Left a drag element
      _.map(overlay, (elem) => {
        elem.ondragleave = () => {
          dragCounter -= 1;

          // Left the initiating drag element
          if (dragCounter === 0) {
            _.map(overlay, (overElem) => {
              overElem.classList.remove('drop-hover');
            });
          }
        };
      });

      // Use the overlay(s) *or* domElement to drop the file
      _.map(_.concat(overlay, domElement), (elem) => {
        elem.ondrop = (event) => {
          event.preventDefault();

          // Reset
          dragCounter = 0;

          // Hide dropzone overlay(s)
          _.map(overlay, (overElem) => {
            overElem.classList.remove('drop-hover');
          });

          const filename = event.dataTransfer.files[0].path;

          // Safely bring this to the word of Angular
          $timeout(() => {
            scope.osDropzone({

              // Pass the filename as a named
              // parameter called `$file`
              $file: {
                path: filename,
                size: fs.statSync(filename).size
              }

            });
          });

          return false;
        };
      });
    }
  };
};
