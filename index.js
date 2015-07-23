var mutil = require('miaow-util');
var recast = require('recast');

var getRelativeId = require('./getRelativeId');
var pkg = require('./package.json');

function parse(option, cb) {
  var ast = recast.parse(this.contents.toString());
  var types = recast.types;
  var n = types.namedTypes;
  var defineNode;
  var requireNode;

  //查询define语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (n.Identifier.check(node.callee)) {
        if (node.callee.name === 'define') {
          defineNode = node;
        }

        if (node.callee.name === 'require') {
          requireNode = node;
        }
      }

      this.traverse(path);
    }
  });

  //如果已经有define或是require语句, 就不用再做包装了
  if (defineNode || requireNode) {
    return cb();
  }

  var b = recast.types.builders;

  var defineExpr = b.callExpression(b.identifier('define'), [
    b.literal(getRelativeId(this.output, this)),
    b.functionExpression(
      null,
      [],
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
