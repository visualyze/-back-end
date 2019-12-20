'use strict';

const handle500 = require('../middleware/500');
const handle404 = require('../middleware/404');

describe('Test middleware status and error', () => {

  it('500 status and error', (done) => {
    const error = {
      error: 'testing',
    };

    const response = {
      status: (code) => {
        expect(code).toEqual(500);
        return {
          json: (obj) => {
            expect(obj.error).toEqual('testing');
            return {
              end: () => done(),
            };
          },
        };
      },
    };

    handle500(error, null, response);
  });

  it('404 status and error', (done) => {
    const error = {
      error: 'Resource Not Found',
    };

    const response = {
      status: (code) => {
        expect(code).toEqual(404);
        return {
          json: (obj) => {
            expect(obj.error).toEqual(error.error);
            return {
              end: () => done(),
            };
          },
        };
      },
    };

    handle404(null, response);
  });

});
