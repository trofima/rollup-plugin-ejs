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
            compilerOpts: {client: true} // any options supported by ejs compiler
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

