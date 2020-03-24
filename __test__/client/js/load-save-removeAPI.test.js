const removeCurrentTrip = require('../../../src/client/js/load-save-removeAPI');

let loadedTrip = {
    id: ''
};

test('Testing Removing of current Trip', () => {
    expect(removeCurrentTrip(loadedTrip)).toBe(false);
});