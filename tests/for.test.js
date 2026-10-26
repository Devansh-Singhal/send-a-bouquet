const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/for');

test('opening gate is personalized before JavaScript loads', () => {
  let html;
  handler({url:'/f?t=Riya%20%24%26%20%3C3',headers:{host:'example.com'}},{setHeader(){},end(value){html=value;}});
  assert.match(html, /id="g1">Riya \$&amp; &lt;3<\/span>/);
  assert.doesNotMatch(html, /id="g1">for you/);
});

test('unnamed gift has a friendly fallback in the first response', () => {
  let html;
  handler({url:'/f',headers:{}},{setHeader(){},end(value){html=value;}});
  assert.match(html, /id="g1">for you<\/span>/);
});
