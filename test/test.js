var assert = require('assert');
var fs = require('fs');
var miaow = require('miaow');
var path = require('path');

var parse = require('../index');
describe('miaow-amd-wrap', function () {
  this.timeout(10e3);

  var log;

  before(function (done) {
    miaow.compile({
      cwd: path.resolve(__dirname, './fixtures'),
      output: path.resolve(__dirname, './output'),
      pack: false,
      module: {
        tasks: [
          {
            test: /\.js$/,
            plugins: [parse]
          }
        ]
      }
    }, function (err) {
      if (err) {
        console.error(err.toString());
        process.exit(1);
      }
      log = JSON.parse(fs.readFileSync(path.resolve(__dirname, './output/miaow.log.json')));
      done();
    });
  });

  it('接口是否存在', function () {
    assert(!!parse);
  });

  it('非AMD模块的封装', function () {
    assert.equal(log.modules['foo.js'].hash, 'b49a2c676956fb0438d3f79bc0992338');
  });

  it('不处理AMD模块', function () {
    assert.equal(log.modules['baz.js'].hash, '5beb7b0c870e68432ed9b2bf283ab8c2');
    assert.equal(log.modules['bar.js'].hash, 'a353c2587d553e94cf29a953f7ea630b');
  });
});
