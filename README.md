# rollup-plugin-ejs
.ejs(embedded javascript) templates loader plugin for rollup.js

Supports loading of any files with proper ejs content.

## Installation
```
npm install rollup-plugin-ejs --save
```

## Usage
Construction
```javascript
import tpl from './tpl.ejs';
```
will return you function the execution result of [ejs.compile](https://github.com/mde/ejs#usage) function.
This function should be executed with data to return parsed html string.
By default data goes to the 'locals' variable of the template (see following usage example).
You can change ejs compiler [options](https://github.com/mde/ejs#options) when setting up the ejs rollup plugin.


rollup.config.js
```javascript
import { rollup } from 'rollup';
import ejs from 'rollup-plugin-ejs';

rollup({
    entry: 'main.js',
    plugins: [
        ejs({
            include: ['**/*.ejs', '**/*.html'], // optional, '**/*.ejs' by default
            exclude: ['**/index.html'], // optional, undefined by default
            compilerOptions: {client: true} // optional, any options supported by ejs compiler
        })
    ]
});
```

someModule.js
```javascript
import tpl from './tpl.ejs';

const domNode = document.createElement('div');

domNode.innerHTML = tpl({text: 'Hello World'});

document.body.appendChild(domNode);
```

tpl.ejs
```html
<p><%= locals.text %></p>
```

### Compiling your template in Node
Passing in a data object will result in ejs rendering your template and returning a string.

rollup.config.js
```javascript
import { rollup } from 'rollup';
import ejs from 'rollup-plugin-ejs';

rollup({
    entry: 'main.js',
    plugins: [
        ejs({
            include: ['**/*.ejs', '**/*.html'], // optional, '**/*.ejs' by default
            compilerOptions: {client: false, filename: 'src/template.ejs.html'}, // See [ejs.compile](https://github.com/mde/ejs#usage) for more options
            data: templateData, // Your data object for your template
            htmlMinifierOptions: { // See [html-minifier](https://github.com/kangax/html-minifier) for all options
                ignoreCustomFragments: [/<!--#[\s\S]*?-->/],
                collapseWhitespace: true,
                removeAttributeQuotes: true
            }
        })
    ]
});
```

## Advanced options

It might be useful first of all for those are using [webcomponents.js](https://github.com/webcomponents/webcomponentsjs).
By the webcomponents spec v1 you can use ```<link rel="stylesheet" href="...">``` tags in your shadow dom to load styles.
But unfortunately only chrome by now (May 2017) supports this.
[ShadyCSS](https://github.com/webcomponents/shadycss) doesn't help here, because it works only for <style>...</style> tags in your shadow dom.
So for ShadyCSS to process your styles loaded by link tags you have to replace ```<link>``` tags with ```<style>``` tags containing css rules from linked css file.
To achieve this on loading a template ejs/html file you can use this plugin:

rollup.config.js
```javascript
import { rollup } from 'rollup';
import ejs from 'rollup-plugin-ejs';

rollup({
    entry: 'main.js',
    plugins: [
        ejs({
            include: ['**/*.ejs', '**/*.html'],
            loadCss: true, // false by default
        })
    ]
});
```

tpl.ejs
```html
<link rel="stylesheet" href="./style.css">
<h1>My custom component</h1>
<slot></slot>
```

style.css
```css
:host {
    background: red;
    display: block;
}
```

The resulted compiled template string will look like this:

```html
<style>
    :host {
        background: red;
        display: block;
    }
</style>

<h1>My custom component</h1>
<slot></slot>
```

Now ShadyCSS is able to process the html content in a right way.

It will (should at least ;) work for multiple ```<link>``` tags.
And also it should work even for ```<template>``` tags containing ```<link>``` tags.


Enjoy. And fill free to pull request.
