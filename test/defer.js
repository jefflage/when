(function(buster, when) {

var assert, fail;

assert = buster.assert;
fail = buster.assertions.fail;

function fakeResolved(val) {
	return {
		then: function(callback) {
			return fakeResolved(callback ? callback(val) : val);
		}
	};
}

function fakeRejected(reason) {
	return {
		then: function(callback, errback) {
			return errback ? fakeResolved(errback(reason)) : fakeRejected(reason);
		}
	};
}

buster.testCase('when.defer', {

	'should resolve': function(done) {
		var d = when.defer();

		d.promise.then(
			function(val) {
				assert.equals(val, 1);
			},
			fail
		).always(done());

		d.resolve(1);
	},

	'should resolve with promised value': function(done) {
		var d = when.defer();

		d.promise.then(
			function(val) {
				assert.equals(val, 1);
			},
			fail
		).always(done);

		d.resolve(fakeResolved(1));

	},

	'should reject': function(done) {
		var d = when.defer();

		d.promise.then(
			fail,
			function(val) {
				assert.equals(val, 1);
			}
		).always(done);

		d.reject(1);
	},

	'should reject when resolved with rejected promise': function(done) {
		var d = when.defer();

		d.promise.then(
			fail,
			function(val) {
				assert.equals(val, 1);
			}
		).always(done);

		d.resolve(fakeRejected(1));
	},

	'should progress': function(done) {
		var d = when.defer();

		d.promise.then(
			fail,
			fail,
			function(val) {
				assert.equals(val, 1);
				done();
			}
		);

		d.progress(1);
	},

	'should allow resolve after progress': function(done) {
		var d = when.defer();

		var progressed = false;
		d.promise.then(
			function(val) {
				assert(progressed);
				assert.equals(val, 2);
				done();
			},
			function() {
				buster.fail();
				done();
			},
			function(val) {
				assert.equals(val, 1);
				progressed = true;
			}
		);

		d.progress(1);
		d.resolve(2);
	},

	'should allow reject after progress': function(done) {
		var d = when.defer();

		var progressed = false;
		d.promise.then(
			function() {
				buster.fail();
				done();
			},
			function(val) {
				assert(progressed);
				assert.equals(val, 2);
				done();
			},
			function(val) {
				assert.equals(val, 1);
				progressed = true;
			}
		);

		d.progress(1);
		d.reject(2);
	},

	'should throw if resolved when already resolved': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.resolve();
		});
	},

	'should throw if rejected when already resolved': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.reject();
		});
	},

	'should throw on progress when already resolved': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.progress();
		});
	},

	'should throw if resolved when already rejected': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.resolve();
		});
	},

	'should throw if rejected when already rejected': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.reject();
		});
	},

	'should throw on progress when already rejected': function() {
		var d = when.defer();
		d.resolve(1);

		assert.exception(function() {
			d.progress();
		});
	},

	'should invoke newly added callback when already resolved': function(done) {
		var d = when.defer();

		d.resolve(1);

		d.promise.then(
			function(val) {
				assert.equals(val, 1);
				done();
			},
			function() {
				buster.fail();
				done();
			}
		);
	},

	'should invoke newly added errback when already rejected': function(done) {
		var d = when.defer();

		d.reject(1);

		d.promise.then(
			function () {
				buster.fail();
				done();
			},
			function (val) {
				assert.equals(val, 1);
				done();
			}
		);
	}

});

})(
	this.buster || require('buster'),
	this.when   || require('..')
);
