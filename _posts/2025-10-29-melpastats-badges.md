---
layout:       post
title:        Melpastats badges
primary_img:  /img/post/badges.jpg
date:         2025-10-28
summary:      Swag up your MELPA package with some flashy badges
categories:   [emacs, melpa, github, gitlab, badges, clojure, babashka]
tags:         [emacs, melpa, github, gitlab, badges, clojure, babashka]
---

> Cersei Lannister: I shall wear this as a badge of honor.<br/>
> Robert Barathon: Wear it in silence or I'll honor you again.<br/>
> -- George R. R. Martin

# TL;DR

Have a project called `fizzbuzz` that you deploy on [MELPA][melpa]?
Add the following snippet to your `README.md` in order to add a download count badge:

```markdown
[![downloads](https://melpastats-2761cf.gitlab.io/badges/fizzbuzz.svg)](http://melpa.org/#/fizzbuzz)
```

or if `org-mode` is your poison:

```markdown
[[https://melpa.org/#/fizzbuzz][https://melpastats-2761cf.gitlab.io/badges/fizzbuzz-badge.svg]]

```

It looks like this (taken from my own project [`plantuml-mode`][plantuml-mode]):

[![downloads](https://melpastats-2761cf.gitlab.io/badges/plantuml-mode-badge.svg)](http://melpa.org/#/plantuml-mode)

# The quest

I was recently busy with some cleanup and improvements of my open source projects, which resulted into [deflate][deflate], a
pure elisp implementation of the Deflate compression algorithm. After a few day that the package was published on MELPA, I was
curious to check whether it was being downloaded (mostly as a sidecar to `plantuml-mode`, which is the only thing in the world
that depends on it currently).

Fortunately enough, MELPA publishes your download counts and -- oh boy! The tears in my eyes when I did see some downloads action there! I *needed* to boast about it and showcase the download count
prominently in the project `README.org`. I needed badges.

# Eat your own parenthesis

I'm sure there are million ways to make a badge / shield happen. Heck, maybe someone else already did it and I haven't found it (spoiler: I haven't searched 😱). Anyways I was craving some custom coding
and so it was decided: I'll make a new project called [`melpastats`][melpastats]. What it offers:

- 🖼️ pregenerated `.svg` badges with the download count
- 📦 assets are hosted on Gitlab pages
- ⏲️ refresh the download counts every 6 hours
- 💄 different [background colors][bgcolors] depending on the total downloads count
- ~~📈 full history of the download count updates~~ (maybe, in the far future)

I went for a simple [`babashka`][babashka] script, which uses [`svg-clj`][svg-clj] to render the actual image from Hiccup syntax.
For the uninitiated, here's how it looks like:

```clojure
[:svg {:xmlns "http://www.w3.org/2000/svg"
           :width full-width
           :height height
           :role "img"
           :aria-label (str "MELPA: " package-name)}
     [:title (str "MELPA: " package-name)]
     ;; ...
     ]
```

You can see the full [hiccup][hiccup] stuff in the sources of course. The overall process is intentionally dumb as a rock, namely:

1. gitlab CI: download and parse the [packages list][melpa-archive] and [download counts][melpa-downloads] JSON files
2. babashka: for each package, render the actual `SVG` file using its download count
3. ensure the folder with the SVGs is published in Gitlab pages

It took just a few hours of non-continuous work to make that happen. Now it's live for a month or two and I'm confident enough with
it that it's time for this post to happen. Hope it's of any use for anyone out there.

Bye bye 🇬🇧 / tot ziens 🇳🇱 / a si biri (alas, no emoji for [Sardinian][sard] :sadface:)


[melpa]: https://melpa.org
[plantuml-mode]: https://github.com/skuro/plantuml-mode
[melpastats]: https://gitlab.com/codehopper-bv/melpastats
[bgcolors]: https://gitlab.com/codehopper-bv/melpastats/-/blob/main/src/melpastats/update.bb#L22
[babashka]: https://babashka.org/
[hiccup]: https://gitlab.com/codehopper-bv/melpastats/-/blob/main/src/melpastats/update.bb?ref_type=heads#L31
[melpa-archive]: https://melpa.org/archive.json
[melpa-downloads]: https://melpa.org/download_counts.json
[sard]: https://en.wikipedia.org/wiki/Sardinian_language
[svg-clj]: https://github.com/adam-james-v/svg-clj
[deflate]: https://github.com/skuro/deflate
