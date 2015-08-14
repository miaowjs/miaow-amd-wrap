var mutil = require('miaow-util');
var recast = require('recast');

var getRelativeId = require('./getRelativeId');
var pkg = require('./package.json');

function parse(option, cb) {
  var contents = this.contents.toString();

  if (!contents.trim()) {
    return cb();
  }

  var ast = recast.parse(contents);
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

  var id = this.srcPath + '\'s id holder';
  var b = recast.types.builders;

  var defineExpr = b.callExpression(b.identifier('define'), [
    b.literal(id),
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

  // 添加ID回写的钩子
  var module = this;
  this.addHook(function (cb) {
    var contents = module.contents.toString();
    module.contents = new Buffer(contents.replace(id, getRelativeId(module.output, module)));
    cb();
  });

  cb();
}

module.exports = mutil.plugin(pkg.name, pkg.version, parse);
