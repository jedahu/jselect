function makeRoot(s) {
  var r = document.createElement('div');
  r.innerHTML = s;
  return r;
}

function dfill(rootNode, queryMap) {
  JSelect.fill(rootNode, queryMap, JSelect.defaultCssSelector);
}

describe('JSelect', function() {
  describe('fill', function() {
    it('should replace with text', function() {
      var root = makeRoot('The <verb>quick</verb> brown fox');
      dfill(root, [['verb', 'SLOW']]);
      chai.assert.equal(root.innerHTML, 'The SLOW brown fox');
    });
    it('should replace with node', function() {
      var root = makeRoot('The <verb>quick</verb> brown fox'),
          repl = document.createElement('mood');
      repl.innerText = 'grumpy';
      dfill(root, [['verb', repl]]);
      chai.assert.equal(root.innerHTML, 'The <mood>grumpy</mood> brown fox');
    });
    it('should replace with function return', function() {
      var root = makeRoot('The <verb>quick</verb> brown fox');
      function replFn(elm) {
        var repl = document.createElement('speed');
        repl.innerText = elm.innerText;
        return repl;
      }
      dfill(root, [['verb', replFn]]);
      chai.assert.equal(root.innerHTML, 'The <speed>quick</speed> brown fox');
    });
    it('should modify in-place', function() {
      var root = makeRoot('The <verb>quick</verb> brown fox');
      dfill(root, [['verb', function(elm) { elm.outerText = 'SLOW' }]]);
      chai.assert.equal(root.innerHTML, 'The SLOW brown fox');
    });
    it('should replace multiple matches', function() {
      var root = makeRoot('The <adj>little</adj> <adj>squirmy</adj> worm');
      dfill(root, [['adj', 'ADJECTIVE']]);
      chai.assert.equal(root.innerHTML, 'The ADJECTIVE ADJECTIVE worm');
    });
    it('should ignore non-matching queries', function() {
      var root = makeRoot('foo');
      dfill(root, [['.nothing', 'NEVER SEEN']]);
      chai.assert.equal(root.innerHTML, 'foo');
    });
    it('should process queries in order', function() {
      function rootFn() {
        return makeRoot('The <span class="outer">quick <span class="inner">brown</span></span> fox');
      }
      function outerRepl(elem) {
        var inner = elem.firstElementChild;
        if (inner) inner.className = 'color';
      }
      var root0 = rootFn(),
          root1 = rootFn();
      dfill(root0, [['.outer', outerRepl], ['.inner', 'red']]);
      dfill(root1, [['.inner', 'red'], ['.outer', outerRepl]]);
      chai.assert.equal(root0.innerHTML,
        'The <span class="outer">quick <span class="color">brown</span></span> fox');
      chai.assert.equal(root1.innerHTML,
        'The <span class="outer">quick red</span> fox');
    });
  });

  describe('getSelector', function() {
    it('should prefer Sizzle', function() {
      chai.assert.equal(JSelect.getSelector(null), JSelect.sizzleSelector);
    });
  });

  describe('sizzleSelector', function() {
    it('should work', function() {
      var root = makeRoot('A <adj>little</adj> <adj>squirmy</adj> worm');
      JSelect.fill(root, [['adj', 'ADJ']]);
      chai.assert.equal(root.innerHTML, 'A ADJ ADJ worm');
    });
  });
});
