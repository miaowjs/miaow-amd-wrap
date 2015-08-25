var mutil = require('miaow-util');
var recast = require('recast');

var pkg = require('./package.json');

function parse(option, cb) {
  var contents = this.contents.toString();

  if (!contents.trim()) {
    return cb();
  }

  var ast = recast.parse(contents);
  var types = recast.types;
  var n = types.namedTypes;
  var isAMD;

  //查询define语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (n.Identifier.check(node.callee)) {
        if (node.callee.name === 'define') {
          isAMD = true;
        }

        if (node.callee.name === 'require' && n.ArrayExpression.check(node.arguments[0])) {
          isAMD = true;
        }
      }

      if (!isAMD) {
        this.traverse(path);
      } else {
        return false;
      }
    }
  });

  //如果已经是AMD了
  if (isAMD) {
    return cb();
  }

  var b = recast.types.builders;

  var defineExpr = b.callExpression(b.identifier('define'), [
    b.functionExpression(
      null,
      [b.identifier('require'), b.identifier('exports'), b.identifier('module')],
      b.blockStatement(ast.program.body)
    )
  ]);

  ast.program.body = [
    b.expressionStatement(defineExpr)
  ];

  this.contents = new Buffer(recast.print(ast).code);

  cb();
}

module.exports = mutil.plugin(pkg.name, pkg.version, parse);
