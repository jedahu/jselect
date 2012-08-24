/*.
jselect.js
==========

Selector functions take a root node, a query, and return a sequence of
descendent nodes that match the query. This makes it easy to change the selector
implementation to whatever system is desires (e.g. XPath).
.*/

var JSelect = (function(d) {
  /*.
  .+name:defaultCssSelector[] (rootNode, query) => Array<Node>+
  Two selector functions are provided by JSelect. The first wraps the browser’s
  implementation of `querySelectorAll`.
  .*/
  function defaultCssSelector(rootNode, query) {
    return rootNode.querySelectorAll(query);
  }

  /*.
  .+name:sizzleSelector[] (rootNode, query) => Array<Node>+
  The second uses http://sizzlejs.com[Sizzle].
  .*/
  function sizzleSelector(rootNode, query) {
    return Sizzle(query, rootNode);
  }

  /*.
  .+name:getSelector[] (selectorFn|null) => selector+
  If no selector function is provided to <<fill>> and `window.Sizzle` exists,
  <<sizzleSelector>> is used, otherwise <<defaultCssSelector>> is used.
  .*/
  function getSelector(selectorFn) {
    var selector = selectorFn ||
      (typeof Sizzle !== 'undefined' && sizzleSelector) ||
      (d.querySelectorAll && defaultCssSelector);
    if (selector) return selector;
    throw new Error('No usable selector function found. Please supply one.');
  }

  /*.
  .+name:wrapReplacement[] (r) => Node|null+
  Replacement values can be Nodes or text (which is wrapped in a new Text node).
  .*/
  function wrapReplacement(r) {
    if (!r) return null;
    return r instanceof Node ? r : d.createTextNode(r);
  }

  /*.
  .+name:replace[] (rep, matchedNode) => replacement|null+
  A replacement can be a value or a function.
  .*/
  function replace(rep, matchedNode) {
    return wrapReplacement(typeof rep === 'function' ? rep(matchedNode) : rep);
  }

  /*.
  .+name:replaceNode[] (oldNode, newNode) => oldNode+
  The <<fill>> function uses this helper function to replace one node with
  another.
  .*/
  function replaceNode(oldNode, newNode) {
    oldNode.parentNode.replaceChild(newNode, oldNode);
  }

  /*.
  .+name:fill[] (rootNode, queryMap, selectorFn) => undefined+
  The `fill` function takes a root node, a map from queries to replacements, and
  an optional selector function. `fill` simply iterates through each query in
  the map and applies the replacement to each matching node. The replacement can
  be either a value, which will simply replace the matched node, or a function,
  which must take a single node argument and may do one of two things:

  1. return a single node to replace the matched node;
  2. return `nil`, and modify the matched node in place.
  .*/
  function fill(rootNode, queryMap, selectorFn) {
    var i,
        query,
        newNode,
        matchedNode,
        matchedNodes,
        replacement,
        select = getSelector(selectorFn);
    for (i in queryMap) {
      query = queryMap[i][0];
      replacement = queryMap[i][1];
      matchedNodes = select(rootNode, query);
      for (i = 0; i < matchedNodes.length; ++i) {
        matchedNode = matchedNodes[i];
        newNode = replace(replacement, matchedNode);
        if (newNode) {
          replaceNode(matchedNode, newNode);
        }
      }
    }
  }

  return {
    fill: fill,
    getSelector: getSelector,
    defaultCssSelector: defaultCssSelector,
    sizzleSelector: sizzleSelector
  };
})(document);
