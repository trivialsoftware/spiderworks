# Spiderworks

Spiderworks is a flat-file, markdown based CMS, with support for server-side templates. It's designed to be very easy to
build static sites with, and is infinitely extensible, thanks to Node.js. It is also setup to be easy to use inside of
free hosting solutions, such as [GitLab Pages](https://pages.gitlab.io/).

## What does Spiderworks do?

Spiderworks, at it's heart, is just a content generation tool. It could (in theory) be replaced with a build tool, such
as [Grunt](http://gruntjs.com/) or [Gulp](http://gulpjs.com/). Heck, it could even be replaced by a moderately complex
[Makefile](https://www.wikiwand.com/en/Makefile). There is nothing it does that can't be done by other tools.

So what _does_ it bring to the table?

That's simple: ease of use and sane (if opinionated) defaults. Spiderworks provides simple (if sometimes limited) ways
to accomplish common tasks, and anything beyond that it stands back and lets you do whatever you want. It can be as
complicated as building all of this by hand, or as simple as writing a single markdown file. The choice is yours,
Spiderworks is just here to do whatever you tell it to.

What's great about this approach is that, should you ever outgrow Spiderworks (or need a server-side component), all
your hard work isn't wasted. At the end of the day, you have a simple website that uses client-side rendering; you can
trivially switch to using an [express](http://expressjs.com/) app, directly integrating
[nunjucks](https://mozilla.github.io/nunjucks/getting-started.html#usage). All you had to do was write the express app;
nothing else needed to change.

## What doesn't Spiderworks do?

First and foremost: Spiderworks does not provide any sort of server-side or dynamic component. There's no database, no
administration section. It just generates static content, nothing more. Allow me to reiterate:

**There is no admin component. There is no database.**

This might sound like a bad thing, and you're right that it's not suited to some applications. However, the majority of
web sites are still static: blogs, homepages, simple storefronts, etc.

But why _wouldn't_ I use a dynamic site, like an express app?

Because, my friend, there are wonderfully free (or cheap) hosting solutions for purely static content. Things like
[Amazon S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html), [GitLab Pages](https://pages.gitlab.io/),
or [GitHub Pages](https://pages.github.com/) are beautiful solutions to cheap or free hosting if all you've really got
is static content.

Take the blog example. Blog pages tend to be written once, and then (maybe) edited on occasion. There's no reason that
can't be a static site; why do you need to store your blog post in a database? You're not providing full text searching
are you? (And if you are, perhaps you might want to look into doing something [client-side](http://lunrjs.com/).)

"But", I hear you say, "I don't want to write my markdown in a text editor, and then use source control to publish it."
Ok, that's fair. But, GitHub and GitLab both have beautiful editing UIs that natively understand markdown. They even
allow for file creation. And, best of all, with minimal setup, if you use GitLab Pages, you can have your site
regenerated automatically every time you make a change. (See [GitLab Pages Setup](#gitlab-pages-setup) below.)

## Installation

Installing Spiderworks is very easy. You need to have [Node.js](https://nodejs.org/en/) and npm installed, and then
simply do the following:

```bash
$ npm install -g spiderworks
```

It's really just that easy.

## Getting Started

Building a site with Spiderworks is as simple as making a folder an putting a blank `config.yml` file in it. But, that
won't get you a _useful_ site. To do that, there's a little more you need to do.

### Concepts

There are a couple of useful concepts to cover before we explain exactly how to build a site. (We are making the
assumption that you are already familiar with [YML](https://www.wikiwand.com/en/YAML) and
[markdown](https://www.wikiwand.com/en/Markdown)).

A Spiderworks site is made up of _pages_, _templates_, and _static files_. Using the _pages_ and _templates_ as input,
it generates pure html (or json) output files (and copies the static files without touching them). _Pages_ are processed
with _renderers_, which control how the page is output. By default, pages are run through
[nunjucks](https://mozilla.github.io/nunjucks/), and output as html.

#### Static Files

By default, Spiderworks looks for a folder named `static` and simply copies it (and all of it's contents) into the
output directory. (You can change this name via `config.yml`. See [Site Configuration](#site-configuration) below.)

All a static file is, is something you want copied into your output directory (like say, an image) without Spiderworks
trying to mess with it. (Javascript and CSS files are also great examples.)

#### Templates

By default, Spiderworks looks for a folder named `templates` to contain any and all templates your site uses. You will
need at least _one_ template, otherwise Spiderworks won't be able to output a valid html page. Again, by default,
Spiderworks assumes the default template is named `default.html`. You will want it to contain, at a minimum, the
following html:

```html
<html>
    <head>
        <title>{{ title }}</title>
    </head>
    <body>
        {{ content }}
    </body>
</html>
```

Chances are, you will want much more in your default template. We recommend reading about
[nunjucks templates](https://mozilla.github.io/nunjucks/templating.html) in general, and specifically leveraging
[template inheritance](https://mozilla.github.io/nunjucks/templating.html#template-inheritance) if it makes sense for
your site.

##### Context

Every template is rendered with a context, which is pulled from the `YML` frontmatter in the markdown file (See
[Pages](#pages) below). The following variables are always added to the context:

* `created` - A date object representing when the file was created.
* `modified` - A date object representing when the file was last modified.
* `content` - The parsed markdown content of the page.
* `baseURL` - The base url of this page, relative to the root of the site. (ex: `/blog`)
* `filename` - The filename of this page, including the extension. (ex: `home.html`)
* `title` - The title of the page. (Note: this will be undefined if not specified in the frontmatter.)

Any additional variables you put in the frontmatter will be included directly in the context.

#### Pages

A 'page' in Spiderworks is a markdown file with a `YML` section at the top (frequently refered to as 'frontmatter').
Here's a simple example:

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

    Isn't Markdown Great?
```

(This file will be parsed as markdown, and then will be passed through the nunjucks renderer to allow the use of nunjucks
templating inside of the markdown files.)

The frontmatter is appended to the page's context when it's being rendered, and supports arbitrary properties. However,
there are a few properties that Spiderworks looks for that control how the page gets rendered.

* `baseURL` - This is the path to the current page. (By default, this is based on the folder structure of your site.)
* `filename` - The name of the output file. (By default, the same name as the markdown file, except with a `.html` extension in place of a `.md` extension.)
* `slug` - A unique, human readable URL for this page. This overrides `baseURL` and `filename`. (See [Slugs](#slugs) below.)
* `renderer` - Either the string name of the renderer to render this page with, or an object with the `name` property. (All other properties will be passed as options.)

As was mentioned in the [Templates](#templates) section, any additional properties will be made available on the
template's context, making them available to render inside the template. (Ex: a list of tags for a blogpost)

##### Slugs

A [slug](https://www.wikiwand.com/en/Semantic_URL#/Slug) is defined as a portion of a url that identifies a page in
human readable keywords. This is the end portion of the url, and is frequently used in blogposts.

Spiderworks allows for slugs to be used in place of `filename`. When specified, it will append the slug to `baseURL` and
force `filename` to be index.html. So, for example, if `baseURL` is `'blog'` and `slug` is `'slugs-are-cool'`, then the
page will be available at `/blog/slugs-are-cool`, or `/blogs/slugs-are-cool/index.html`.

The way Spiderworks does this is to create a folder inside of `baseURL` with the same name as `slug`, and then puts the
page inside the slug folder, named `index.html`. As some people might not like a bunch of folders being created, using
slugs are optional, and a similar effect can be had by changing `filename` to `slugs-are-cool.html`. This has the
downside of adding `.html` to your slugs, but each page is it's own file, without making directories.

##### Renderers

Every page can specify a renerer to use. By default, all pages are rendered via the `'nunjucks'` renderer. However we
also support a `'json'` renderer.

You can pass the `prettyPrint` option to have the json files pretty printed.

### Creating a new site

You have two options for creation, either manually or via `spiderworks create <project>`. Either works, but we highly
recommend just use the `create` command.

#### Manual Creation

As mentioned above, all Spiderworks _needs_ is a `config.yml`. However, in order to be useful, it expects a folder with
the following layout:

```
my-project
├── site.js
├── config.yml
├── pages
│   └── index.md
├── static
│   └── <any static assets>
└── templates
    ├── base.html
    └── default.html
```

You can see a good example of this by looking at the [template](./template) we use for creating new projects. You can
customize the directories that Spiderworks looks in, however, we picked what we felt were the most sane names.

##### `site.js`

This is a customization file for the nunjucks renderer. (See [Site Configuration](#customizing-the-nunjucks-renderer-via-sitejs) below.)

##### `config.yml`

This is your site configuration file. It is **required**. (See [Site Configuration](#site-configuration) below.)

##### `pages`

This is the directory that (by default) Spiderworks scans for markdown files. It will find anything with the extension
`.md` and render that as an html page, keeping the path relative to the `pages` folder the same.

##### `static`

This folder is optional, and holds any static content (images, etc) you wish to host on your site.

##### `templates`

This is the folder that (by default) Spiderworks looks in for nunjucks templates. When you specify a template in your
frontmater, it will look in this folder.

### Site Configuration

You can configure the various folders and other settings Spiderworks uses. By default, this is the configuration
Spiderworks uses:

```yml
# Spiderworks options
directories:
	templates: 'templates'
    static: 'static'
    pages: 'pages'
    output: 'dist'

# Options for the `marked` Markdown parser
marked:
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false

# Options for the `nunjucks` templating system
nunjucks:
    trimBlocks: true
```

All of these options should be self explanatory, or should be easily found by looking at the documentation for
[marked](https://github.com/chjj/marked/blob/master/README.md) or [nunjucks](https://mozilla.github.io/nunjucks/templating.html).

#### Customizing the nunjucks renderer via `site.js`

Sometimes the customization that needs to happen, must happen in code. For exampled, `marked` allows you to customize
the way some tags are rendered. But to do this, you need to use javascript. Spiderworks allows you to specify a `site.js`
file that it will load.

This file _must_ be a nodejs module, and it needs ot export a function named `nunjucks`. It will be called with `nunjucks`
module, the `nunjucks` environment, and the `marked` module.

Here is an example that wraps all tables in a bootstrap table.

```javascript
function nunjucks(nunjucks, env, marked)
{
    // Create a new markdown renderer
    const renderer = new marked.Renderer();

    // Wrap all generated tables in the bootstrap boilerplate to make them responsive
    renderer.table = function(header, body)
    {
        return `<table class="table"><thead>${header}</thead><tbody>${body}</tbody></table>`;
    }; // end table parsing

	// Note: This overrides anything in `config.yml`!!
    // Configure marked parser
    marked.setOptions({
        gfm: true,
        tables: true,
        breaks: false,
        pedantic: false,
        sanitize: false,
        smartLists: true,
        smartypants: false,
        renderer: renderer
    });
} // end nunjucks

module.exports = { nunjucks }
```

## CLI

When you install Spiderworks, you get the `spiderworks` commandline script installed on your system. This gives your
access to several commands that do the heavy lifting of developing or generating your site. To find out what commands
are supported, simply do `spiderworks --help`. Here is an example of the output:

```
$ spiderworks --help

  Usage: spiderworks [options] [command]


  Commands:

    create|new <site>               Creates a new default site with the name <site>.
    clean [directory]               Cleans the generated source files from <directory>.
    generate [options] [directory]  Generates the site from the source files in <directory>.
    watch [options] [directory]     Starts a development server and watches the source folder for changes.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

## GitLab Pages Setup

Just in case you want to deploy your Spiderworks site through GitLab Pages, I've provided an example for you. (This is a
modified version of [this config](https://docs.gitlab.com/ee/pages/README.html#how-gitlab-ci-yml-looks-like-when-using-a-static-generator).)

In your `config.yml`, you will need to set your output directory to `public`:

```yaml
directories:
    output: 'public'
```

Now, add a `.gitlab-ci.yml` file with the following content:

```yaml
image: node:6.2.0

pages:
  cache:
    paths:
    - node_modules/

  script:
  - npm install spiderworks -g

  # Uncomment if you have any custom filters, plugins, or renderers that have dependencies
  #- npm install

  - spiderworks generate

  artifacts:
    paths:
    - public

  only:
    - master
```

This should only rebuild your site when you publish updates to `master`.

## Contributing

All contributions are welcome. Feel free to make an issue and or a pull request.
