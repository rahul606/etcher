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

const chalk = require('chalk');
const inquirer = require('inquirer');
const _ = require('lodash');

const DynamicList = require('./dynamic-list');
const scanner = require('./drive-scanner');

inquirer.registerPrompt('dynamicList', DynamicList);

/**
 * @summary Drive comparer function
 *
 * @description
 * Two criteria are used for comparison:
 * - Removable drives are smaller than fixed drives
 * - Within same type, drives are compared by size
 *
 * @private
 * @param {Object} drive1 Drive object (as returned by `drivelist`)
 * @param {Object} drive2 Drive object (as returned by `drivelist`)
 * @returns {number}
 */
const driveCompareFn = (drive1, drive2) => {
  // Removable drives first
  if (drive1.system !== drive2.system) {
    return drive1.system - drive2.system;
  }
  return drive1.size - drive2.size;
};

const driveToChoiceFn = (minimumSizeToEnable) => {

  /**
   * Map a drive object to a `inquirer` choice object
   * @param {object} drive - Drive object as returned by `drivelist`
   * @private
   * @returns {{name: string, value: object}}
   */
  const driveToChoice = (drive) => {
    const size = drive.size / 1000000000;

    const driveLabel = drive.system ? chalk.red(' FIXED DRIVE') : '';
    const displayName = `${drive.device} (${size.toFixed(1)} GB) - ${drive.description}${driveLabel}`;

    const choice = {
      name: displayName,
      value: drive
    };
    if (drive.size < minimumSizeToEnable) {
      choice.disabled = 'TOO SMALL FOR IMAGE';
    }
    return choice;
  };

  return driveToChoice;
};

module.exports = function(initialDrives, confirmationRequired, minimumAllowableDriveSize) {

  /**
   * Returns true iff `inquirer` should prompt in the case of a fixed drive selected
   * @param {object} answers - The answers given so far
   * @returns {boolean}
   */
  const confirmWriteToFixedDrive = (answers) => {
    if (!confirmationRequired || !answers.yes) {
      return false;
    }
    return answers.drive.system;
  };

  initialDrives.sort(driveCompareFn);

  return inquirer.prompt([ {
    message: 'Select drive',
    type: 'dynamicList',
    name: 'drive',
    choices: initialDrives.map(driveToChoiceFn(minimumAllowableDriveSize)),
    emitter: scanner,
    mapFn: driveToChoiceFn(minimumAllowableDriveSize),
    sort: true,
    compareFn: (choice1, choice2) => {
      return driveCompareFn(choice1.value, choice2.value);
    }
  }, {
    message: 'This will erase the selected drive. Are you sure?',
    type: 'confirm',
    name: 'yes',
    default: false,
    when: _.constant(confirmationRequired)
  }, {
    message: `You have selected a ${chalk.red('NON REMOVABLE DRIVE')}. Do you want to continue?`,
    type: 'confirm',
    name: 'yes',
    default: false,
    when: confirmWriteToFixedDrive
  } ]).then((answers) => {
    if (confirmationRequired && !answers.yes) {
      throw new Error('Abort');
    }
    return answers.drive;
  });
};
