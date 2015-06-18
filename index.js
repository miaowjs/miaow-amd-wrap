var recast = require('recast');

module.exports = function (option, cb) {
  var ast = recast.parse(this.file.contents.toString());
  var types = recast.types;
  var n = types.namedTypes;
  var defineNode;

  //查询define语句
  types.visit(ast, {
    visitCallExpression: function (path) {
      var node = path.node;

      if (
        n.Identifier.check(node.callee) &&
        node.callee.name === 'define'
      ) {
        defineNode = node;
      }

      this.traverse(path);
    }
  });

  //如果已经有define语句, 就不用再做包装了
  if (defineNode) {
    return cb();
  }

  var b = recast.types.builders;

  var defineExpr = b.callExpression(b.identifier('define'), [
    b.literal(this.url || this.destPathWithHash),
    b.functionExpression(
      null,
      [],
      b.blockStatement(ast.program.body)
    )
  ]);

  ast.program.body = [
    b.expressionStatement(defineExpr)
  ];

  this.file.contents = new Buffer(recast.print(ast).code);

  cb();
};
