'use strict';

const m = require('mochainon');
const angular = require('angular');
require('angular-mocks');

describe('Browser: SelectionState', function() {

  beforeEach(angular.mock.module(
    require('../../../lib/gui/models/drive-constraints')
  ));

  describe('DriveConstraintsModel', function() {

    let DriveConstraintsModel;

    beforeEach(angular.mock.inject(function(_DriveConstraintsModel_) {
      DriveConstraintsModel = _DriveConstraintsModel_;
    }));

    it('should be an instance of `lib.src.DriveConstraints`', function() {
      const DriveConstraints = require('../../../lib/src/drive-constraints');
      m.chai.expect(DriveConstraintsModel).to.be.an.instanceof(DriveConstraints);
    });

  });

});
