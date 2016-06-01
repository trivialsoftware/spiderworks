# Spiderworks

Spiderworks is a flat-file, markdown based CMS. It's designed to be very easy to get started with, and infinitely extensible.
Building a static website with Spiderworks should be trivial.

## Site Configuration

...

## Pages

A 'page' in Spiderworks is a markdown file with a `YML` section at the top (frequently refered to as 'frontmatter'). Here's
a simple example:

```markdown
    ---
    filename: 'index.html'
    baseURL: '/'
    title: 'Home Page'
    ---

    # Example Site

    This is a nice, little example site, showing how the CMS will work. I rather enjoy it, tbh.
    It's elegant, simple, and should let people do whatever the hell they want to, with it.

    We can also put a table in here:

    | Things | Stuff |
    |:------:|:-----:|
    |   20   |   3   |
    |   54   |   4   |
    |   9    | 9999  |

    After that, there's not much else to worry about.
```

The frontmatter is appended to the page's context when it's being rendered, and supports arbitrary tags. There are,
however, a few tags that Spiderworks looks for that control some of the options for how the page gets rendered.

### Options

...

## Static Files

...

## Customization

...

## CLI

...

## TODO

* [X] Generation
    * [X] Create stub site
	* [X] Generate pages from Markdown
	* [X] Copy static files
	* [X] Multiple Renderers Support
        * [X] HTML Renderer
        * [X] JSON Renderer
* [X] Utility
    * [X] CLI
        * [X] `create` - Creates a new site
        * [X] `clean` - Cleans the generated files
        * [X] `generate` - Generates the site from source code
        * [X] `watch` - Starts a development server, and watched the source directory for changes
    * [X] Development Server
        * [X] File Watcher (rebuilds when there's changes)
        * [X] HTTP Server
    * [X] Nunjucks Filters
        * [X] `date` filter (moment.js)
        * [X] `fromNow` filter (moment.js)
    * [X] Customization Support
        * [X] `marked` customization
        * [X] Nunjucks customization (add filters, etc.)
* [ ] Documentation
