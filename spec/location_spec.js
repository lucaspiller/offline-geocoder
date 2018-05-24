const geocoder = require('../src/index.js')();

describe('geocoder.location', () => {
  describe('.find', () => {
    it('performs a lookup by id', (done) => {
      geocoder.location().find(3169070)
        .then(function(result) {
          expect(result).toEqual({
            id: 3169070,
            name: 'Rome',
            formatted: 'Rome, Latium, Italy',
            country: { id: 'IT', name: 'Italy' },
            admin1: { id: 7, name: 'Latium' },
            coordinates: { latitude: 41.89193, longitude: 12.51133 }
          });
          done();
        });
    });

    it("resolves undefined when a location can't be found", (done) => {
      geocoder.location().find(-1)
        .then(function(result) {
          expect(result).toEqual(undefined);
          done();
        });
    });
  });
});
