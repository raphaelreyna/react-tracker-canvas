#! /bin/bash

export BABEL_ENV="production"
jsdoc -d . src
mkdir jsdoc
mv index.html jsdoc
sed -ie '30 i\'$'\n''<div id="Demo"></div>' jsdoc/index.html
webpack --mode production
rm -rf jsdoc
unset BABEL_ENV
