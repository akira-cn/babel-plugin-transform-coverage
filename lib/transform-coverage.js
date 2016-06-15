module.exports = function(babel) {
  var t = babel.types,
      coverageSet,
      filename;

  const jscover = '_$jscoverage';

  var covVisitor = {
    Statement: {
      exit: function(path){
        //insert `_$jscoverage[{filename}][{line}]++` before each statement
        var loc = path.node.loc;

        //ignore BlockStatement
        if(loc && path.node.type !== 'BlockStatement'){

          var line = loc.start.line;

          if(line && !coverageSet.has(line)){
            var node = t.expressionStatement(t.updateExpression(
              '++',
              t.memberExpression(
                t.memberExpression(
                  t.identifier(jscover), 
                  t.stringLiteral(filename), true
                ),
                t.numericLiteral(line), true
              )
            ));

            coverageSet.add(line);

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
        coverageSet = new Set();
      },
      exit: function(path, state){
        var body = path.get('body')[0];
        
        //exit if file is empty
        if(!body) return;

        //global._$jscoverage = global._$jscoverage || {}
        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier('global'),
            t.identifier(jscover)
          ),
          t.logicalExpression(
            '||',
            t.memberExpression(
              t.identifier('global'),
              t.identifier(jscover)
            ),
            t.objectExpression([])
          )
        ));

        body.insertBefore(node);

        //_$jscoverage[{$filename}] = [];
        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.identifier(jscover), 
            t.stringLiteral(filename),
            true
          ),
          t.arrayExpression([])
        ));

        body.insertBefore(node);      

        /**
          _$jscoverage[{$filename}][{$line}] = 0;
          ...
         */
        var lines = Array.from(coverageSet).sort((a,b)=>a-b);

        for(var i = 0; i < lines.length; i++){
          var node = t.expressionStatement(t.assignmentExpression(
            '=',
            t.memberExpression(
              t.memberExpression(
                t.identifier(jscover), 
                t.stringLiteral(filename),
                true
              ), 
              t.numericLiteral(lines[i]),
              true
            ),
            t.numericLiteral(0)
          ));
          body.insertBefore(node);
        }

        //_$jscoverage[{$filename}].source = [...codes]
        var codeList = state.file.code.split(/\n/g);
        
        for(var i = 0; i < codeList.length; i++){
          codeList[i] = t.stringLiteral(codeList[i] || '');
        }

        var node = t.expressionStatement(t.assignmentExpression(
          '=',
          t.memberExpression(
            t.memberExpression(
              t.identifier(jscover), 
              t.stringLiteral(filename),
              true
            ), 
            t.identifier('source')
          ),
          t.arrayExpression(codeList)
        ));

        body.insertBefore(node);  
      }
    }
  };

  return {visitor: covVisitor};
};