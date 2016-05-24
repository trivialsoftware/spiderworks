# Deluge

Deluge is a flat-file, markdown based CMS. It's designed to be very easy to get started with, and infinitely extensible.
Building a static website with Deluge should be trivial.

If you can't figure it out from here, then we didn't want you using us anyway! <br>
(_Note: replace that line once we write docs._)

## Site Configuration

...

## Pages

A 'page' in Deluge is a markdown file with a `YML` section at the top (frequently refered to as 'frontmatter'). Here's
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
however, a few tags that Deluge looks for that control some of the options for how the page gets rendered.

### Options

...

## Static Files

...

## TODO

* [ ] Generation
    * [ ] Create stub site
	* [X] Generate pages from Markdown
	* [X] Copy static files
	* [X] Multiple Renderers Support
        * [X] HTML Renderer
        * [X] JSON Renderer
        * [ ] TrivialDB Renderer
* [ ] Utility
    * [ ] CLI
        * [ ] `create` - Creates a new site
        * [X] `clean` - Cleans the generated files
        * [X] `generate` - Generates the site from source code
        * [ ] `watch` - Starts a development server, and watched the source directory for changes
    * [ ] Development Server
        * [ ] File Watcher (rebuilds when there's changes)
        * [ ] HTTP Server
    * [ ] Nunjucks Filters
        * [ ] `date` filter (moment.js)
        * [ ] `fromNow` filter (moment.js)
* [ ] Documentation
