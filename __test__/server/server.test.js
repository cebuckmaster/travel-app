const removeTrip = require('../../src/server/server');

test('Testing Removing aTrip', () =>{
    let req = {
        body: {
            id: ''
        }
    };
    expect(removeTrip(req)).toBe(false);
});