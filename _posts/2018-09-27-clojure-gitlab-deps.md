---
title: Clojure GitLab deps
layout: post
primary_img: /img/post/dependency.png
tags: [clojure, deps.edn, gitlab]
meta-description: Using GitLab dependencies with clojure `deps.edn` requires a bit of configuration when downloaded through SSH
keywords: [clojure, deps.edn, gitlab]
---

> People addicted with technology. <br />
> Technology has indulged mankind. <br />
> Beware of technology dependency! <br />
> -- Toba Beta

## TL;DR:

You need to force the `ssh-rsa` host key instead of the default one picked up by the tooling:

```
$ ssh-keygen -R gitlab.com
$ cat <<EOF >> ~/.ssh/config

Host gitlab.com
  HostKeyAlgorithms ssh-rsa

EOF
$ ssh git@gitlab.com
```

## [CSI][csi] version of the above

You are using the brand new [dependency resolution][deps] from the Clojure core team for the first time. You like the idea of fetching your dependency straight from git. You host all of your repos on
[GitLab][gitlab], it just makes sense, right? Right.

You go ahead and start your new project, you just need to bring in the usual `me/my-awesome-lib` that you use everywhere. That's just a new, empty folder in which you configure your `deps.edn` like
the following:

```clojure
{:deps {my-awesome-lib {:git/url "git@gitlab.com:me/my-awesome-lib.git" :sha "031aa264afc2cf6dee9e12de8b88c608faefea80"}}}
```

No more `lein new`, no more templates, no more nothing. You mentally pat yourself on the shoulder.

You're now at the terminal, ready to sprinkle your clojure fairy powder all over. You fire `clj -m my-awesome-lib.main` and stand in awe as the tool fetches bits from GitLab and...

```
Cloning: git@gitlab.com:me/my-awesome-lib.git
Error building classpath. git@gitlab.com:me/my-awesome-lib.git: UnknownHostKey: gitlab.com. RSA key fingerprint is b6:03:0e:39:97:9e:d0:e7:24:ce:a3:77:3e:01:42:09
org.eclipse.jgit.api.errors.TransportException: git@gitlab.com:me/my-awesome-lib.git: UnknownHostKey: gitlab.com. RSA key fingerprint is b6:03:0e:39:97:9e:d0:e7:24:ce:a3:77:3e:01:42:09
```

Damn! Damn. Really? Mhhhhh...

```
$ ssh git@gitlab.com
PTY allocation request failed on channel 0
Welcome to GitLab, @carlo.sciolla!
Connection to gitlab.com closed.
```

Seems all good. One final check:

```
$ grep gitlab ~/.ssh/known_hosts
gitlab.com,35.231.145.151 ecdsa-sha2-nistp256 ****
```

Things are getting creepy. Worse of it all, you got stuck there. Fortunately, you have a [little bird][henrik] spilling some relevant beans: the specific host key crypto algorithm
(`ecdsa-sha2-nistp256` in the above) might be relevant! A lead is a lead, and this feels like a good one. Let's explore.

First things first, you need to start from a clean slate. Let's remove the currently installed host key:

```
$ ssh-keygen -R gitlab.com
```

Good. Now let's have a look at what keys are provided by GitLab, just to have a feel for what could be a sensible one to pick:

```
$ ssh -Q key git@gitlab.com
ssh-ed25519
ssh-ed25519-cert-v01@openssh.com
ssh-rsa
ssh-dss
ecdsa-sha2-nistp256
ecdsa-sha2-nistp384
ecdsa-sha2-nistp521
ssh-rsa-cert-v01@openssh.com
ssh-dss-cert-v01@openssh.com
ecdsa-sha2-nistp256-cert-v01@openssh.com
ecdsa-sha2-nistp384-cert-v01@openssh.com
ecdsa-sha2-nistp521-cert-v01@openssh.com
```

Whoa! That's quite a rich of a menu to choose from. But your spidey senses are tingling: that `ssh-rsa` feels good. Warm. Homey. Or maybe it's just the closest to what the original error message
said. Whatever, lets tell SSH to pick that one:

```
$ cat <<EOF >> ~/.ssh/config

Host gitlab.com
  HostKeyAlgorithms ssh-rsa

EOF
```

Alright, time to shine. Let it fly, once again:

```
$ clj -m my-awesome-lib.main
Cloning: git@gitlab.com:me/my-awesome-lib.git
Error building classpath. git@gitlab.com:me/my-awesome-lib.git: UnknownHostKey: gitlab.com. RSA key fingerprint is b6:03:0e:39:97:9e:d0:e7:24:ce:a3:77:3e:01:42:09
org.eclipse.jgit.api.errors.TransportException: git@gitlab.com:me/my-awesome-lib.git: UnknownHostKey: gitlab.com. RSA key fingerprint is b6:03:0e:39:97:9e:d0:e7:24:ce:a3:77:3e:01:42:09
```

Damn! Really?! "Oh wait!" you think, as you realize that maybe now you need to first get the new host key:

```
$ ssh git@gitlab.com
The authenticity of host 'gitlab.com (35.231.145.151)' can't be established.
RSA key fingerprint is SHA256:ROQFvPThGrW4RuWLoL9tq9I9zJ42fK4XywyRtbOz/EQ.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added 'gitlab.com,35.231.145.151' (RSA) to the list of known hosts.
PTY allocation request failed on channel 0
Welcome to GitLab, @carlo.sciolla!
Connection to gitlab.com closed.
```

Good! Now, what if... you just did it? "Well, here goes nothing." you think, mindlessly typing that dreaded command one last time:

```
$ clj -m my-awesome-lib.main
Cloning: git@gitlab.com:me/my-awesome-lib.git
Checking out: git@gitlab.com:me/my-awesome-lib.git at 031aa264afc2cf6dee9e12de8b88c608faefea80
Welcome to MyProject!
```

Good. That's good, really. You feel like you deserve a coffee now. And you do.

[csi]: https://en.wikipedia.org/wiki/CSI:_Crime_Scene_Investigation
[deps]: https://clojure.org/guides/deps_and_cli
[gitlab]: https://gitlab.com
[henrik]: https://github.com/eneroth
