module.exports = function(babel) {
  var t = babel.types,
      covSet,
      codeSet,
      filename, 
      code;

  var js_cover = '_$jscoverage';

  var covVisitor = {
    Statement: {
      exit: function(path){
        var loc = path.node.loc;
        if(loc && path.node.type !== 'BlockStatement'){
          var subCode = code.slice(path.node.start, path.node.end).split(/\n/g)[0];
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

        filename = state.file.opts.filename.replace(/^[^\/]*\//,'');
        code = state.file.code;
        covSet = new Set();
        codeSet = [];
      },
      exit: function(path, state){
        var body = path.get('body')[0];
        if(!body) return;

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

        body.insertBefore(node);

        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier(js_cover), 
            t.stringLiteral(filename),
            true
          ),
          t.arrayExpression([])
        ));

        body.insertBefore(node);      

        var covArr = Array.from(covSet).sort((a,b)=>a-b);
        var len = covArr.length;

        for(var i = 0; i < covArr.length; i++){
          var node = t.expressionStatement(t.assignmentExpression(
            '=',
            t.memberExpression(
              t.memberExpression(
                t.identifier(js_cover), 
                t.stringLiteral(filename),
                true
              ), 
              t.numericLiteral(covArr[i]),
              true
            ),
            t.numericLiteral(0)
          ));
          body.insertBefore(node);
        }

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

        body.insertBefore(node);  
      }
    }
  };

  return {visitor: covVisitor};
};