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

/**
 * @module Etcher.Models.DriveConstraints
 */

const angular = require('angular');
const MODULE_NAME = 'Etcher.Models.DriveConstraints';
const SelectionStateModel = angular.module(MODULE_NAME, []);

const DriveConstraints = require('../../src/drive-constraints');

SelectionStateModel.service('DriveConstraintsModel', DriveConstraints);

module.exports = MODULE_NAME;
