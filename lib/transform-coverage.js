module.exports = function(babel) {
  var t = babel.types,
      covSet = new Set(),
      codeSet = [],
      filename, code;

  var js_cover = '_$jscoverage';

  var covVisitor = {
    Statement: {
      exit: function(path){
        var loc = path.node.loc;
        if(loc && path.node.type !== 'BlockStatement'){
          var subCode = code.slice(path.node.start, path.node.end);
          var line = loc.start.line;

          codeSet[line] = (codeSet[line]||'') + subCode;

          if(line && !covSet.has(line)){
            var node = t.expressionStatement(t.updateExpression(
              '++',
              t.memberExpression(
                t.memberExpression(
                  t.identifier(js_cover), 
                  t.stringLiteral(filename), true
                ),
                t.numericLiteral(line), true
              )
            ));

            covSet.add(line);

            path.insertBefore(node);

            //path.traverse(covVisitor);
          }
        }
      }
    },
    Program: {
      enter: function(path, state){
        //filename = state.file.opts.sourceFileName;
        filename = state.file.opts.filename;
        code = state.file.code;
      },
      exit: function(path, state){
        var covArr = Array.from(covSet);
        var len = covArr.length;

        for(var i = 0; i < codeSet.length; i++){
          codeSet[i] = t.stringLiteral(codeSet[i] || '');
        }

        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.memberExpression(
              t.identifier(js_cover), 
              t.stringLiteral(filename),
              true
            ), 
            t.identifier('source')
          ),
          t.arrayExpression(codeSet)
        ));

        path.get('body')[0].insertBefore(node);        

        for(var i = 0; i < covArr.length; i++){
          var node = t.expressionStatement(t.assignmentExpression(
            '=',
            t.memberExpression(
              t.memberExpression(
                t.identifier(js_cover), 
                t.stringLiteral(filename),
                true
              ), 
              t.numericLiteral(covArr[len - i - 1]),
              true
            ),
            t.numericLiteral(0)
          ));
          path.get('body')[0].insertBefore(node);
        }

        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier(js_cover), 
            t.stringLiteral(filename),
            true
          ),
          t.arrayExpression([])
        ));

        path.get('body')[0].insertBefore(node);

        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier('global'),
            t.identifier(js_cover)
          ),
          t.logicalExpression(
            '||',
            t.memberExpression(
              t.identifier('global'),
              t.identifier(js_cover)
            ),
            t.objectExpression([])
          )
        ));

        path.get('body')[0].insertBefore(node);
      }
    }
  };

  return {visitor: covVisitor};
};