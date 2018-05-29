---
title: A tale of Emacs, Clojure and pinned packages
layout: post
primary_img: /img/post/blackhole.jpg
tags: [clojure, emacs, elisp]
meta-description: When CIDER and `clj-refactor` stop working, Emacs and package pinning come to the rescue
keywords: [clojure, emacs, elisp]
---

> It's like trying to pin down a kangaroo on a trampoline.
> -- Sid Waddel

If you do any clojure[script] development, [chances are][ide-war] that
you do so through Emacs and [CIDER][cider]. The experience is
generally nothing short of [awesome][awe], but every now and then you
bump into some quirks. That was the case for me when the latest CIDER
came out, mostly due to how I like to keep my Emacs.

### *tl;dr*

CIDER and `clj-refactor` have incompatible stable releases for which
you need to make sure the latter comes from `melpa-unstable`

## Stable vs unstable

I use Clojure [to pay the bills][synple], and as such I cannot afford
myself to walk too much on the bleeding edge. That's why I made sure
all of my Emacs packages come from a slightly trustworthier stream of
stable releases:

``` emacs-lisp
(require 'package)

(setq package-archives
      '(("gnu" . "https://elpa.gnu.org/packages/")
        ("melpa" . "https://stable.melpa.org/packages/")
        ("melpa-unstable" . "https://melpa.org/packages/")))

(setq package-archive-priorities
      '(("melpa" . 50)
        ("gnu" . 10)
        ("melpa-unstable" . 0)))
```

The priorities set on the package archives make sure that released
packages (from [`melpa-stable`][melpa-stable]) will be installed in
place of their unstable snapshots if they exist. Ideally I'd love to
remove `melpa-unstable` from my configuration, but there are cases in
which that's some necessary evil to keep. Like the reason why I'm
writing this up.

## CIDER and `clj-refactor` and pinning

The latest and gratest CIDER (`v0.17.0`) earlier in May 2018, while
the latest `clj-refactor` release is pretty ancient, dating back to
June 2017. The two packages are now not compatible, and if you
installed both in your Emacs your REPL will fail to start. This has
been reported many, many, many times in the `clj-refactor` issue
tracker, but Java 9 compatibility is [holding back][sad-face] any new
releases of `clj-refactor`, which means we might be waiting quite some
time before we can have a stable clojure IDE including
refactorings. We need to fiddle around ourselves:

``` emacs-lisp
;; manual package pinning:
(add-to-list 'package-pinned-packages '(clj-refactor . "melpa-unstable") t)

;; or if you're using `use-package' to install packages:
(use-package clj-refactor
  :ensure t
  :pin "melpa-unstable"
  ...)

```

That's it. You can now safely upgrade your packages and enjoy your
clojure IDE once again.

---------------------------------------

As duly noted by `dantheobserver` [in the comments][dan-comment], `use-package`
itself is [pending a stable release][use-package-release] for some time now. As
such, you only have one way to properly pin it, similarly to the first option
above:

``` emacs-lisp
(add-to-list 'package-pinned-packages '(use-package . "melpa-unstable") t)
```

Happy hacking!

[ide-war]: https://static1.squarespace.com/static/5372821be4b0aefc6719057e/t/5aafdd7e562fa73957a7b46b/1521474957333/editor.png?format=1000w
[cider]: https://github.com/clojure-emacs
[awe]: https://ih1.redbubble.net/image.118710403.1747/flat,800x800,075,f.u2.jpg
[synple]: https://synple.eu/en/index
[melpa-stable]: https://stable.melpa.org/
[sad-face]: https://github.com/clojure-emacs/clj-refactor.el/issues/403#issuecomment-357631244
[dan-comment]: http://disq.us/p/1svamen
[use-package-release]: https://github.com/jwiegley/use-package/issues/602
