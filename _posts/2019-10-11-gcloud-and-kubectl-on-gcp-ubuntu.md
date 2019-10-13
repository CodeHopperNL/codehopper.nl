---
title: gcloud and kubectl on GCP ubuntu images
layout: post
primary_img: /img/post/entangled.jpg
tags: [kubernetes, gcp, google, cloud, devops]
meta-description: Fixing kubernetes authentication issues with gcloud SDK
keywords: [kubernetes, gcp, google, cloud, devops]
---

> morning glory!<br />
> the well bucket-entangled,<br />
> I ask for water<br />
> -- Fukuda Chiyo-ni

## Yet another versioning issue

Versioning is [a recurring PITA in my life][old-article], it seems. Today I ran (for the second time on the same machine, actually) into an issue with [`kubectl`][kubectl] commands run from my CI server:

    Get https://172.16.0.2/api?timeout=32s: error executing access token command "/snap/google-cloud-sdk/100/bin/gcloud config config-helper --format=json": err=fork/exec /snap/google-cloud-sdk/100/bin/gcloud: no such file or directory output= stderr=

The actual error message was longer than that, but it basically tells me that my `kubectl` commands that I run to deploy new versions of some applications in our `k8s` cluster failed. More
specifically, it encountered an `error executing acces token command ...`. What's that? And how to fix it? Well there are a few ingredients to the mix.

### tl;dr

Use the `/snap/google-cloud-sdk/current` symlink instead of the bespoke snap version number of your `gcloud` SDK:

```sh
$ sed -E -ibak 's/(\/snap\/google-cloud-sdk\/)(.*)(\/bin\/gcloud)/\1current\3/' ~/.kube/config
```

Explanation:

```sh
sed -E             # extended regex
    -ibak          # edit in place, create a ~/.kube/config.bak backup file
    's/(\/snap\/google-cloud-sdk\/)(.*)(\/bin\/gcloud)/\1current\3/' # replace the version number with `current`
    ~/.kube/config # file to update
```

### Authentication in `kubectl`

If you want more low level details you should definitely go to [the official documentation][kube-auth]. Here, suffice it so say that I used the following command to configure my `kubectl` access to
the cluster[[↪][gcloud-get-cred]]:

    gcloud container clusters get-credentials <my-cluster-name> --zone <my-cluster-zone>

That's automagically creating your `~/.kube/config` file with everything you need to connect to a specific cluster. Then you're supposed to `kubectl` happily ever after, with `gcloud` being directly
invoked to retrieve the authentication tokens automagically. Until..

### Oh, snap!

The thing I didn't expect was a poor synergy with the Google Cloud SDK installation and the produced `kubectl` configuration. There's a few ingredients to the mix:

- the machine that's running all of the above commands was created using the Google official [`ubuntu-1804-lts` image][ubuntu-image]
- in that machine, the Google Cloud SDK is installed using [Snapcraft][https://snapcraft.io/]
- `gcloud` stores it's own binary *full path* within `~/.kubectl/config` which is what shows up in the above error message, e.g.:

```yaml
    auth-provider:
      config:
        ...
        cmd-args: config config-helper --format=json
        cmd-path: /snap/google-cloud-sdk/100/bin/gcloud

```
- snaps are updated [frequently][snap-up], installing new versions into `/snap/google-cloud-sdk/$VERSION`

The salvation is provided by the `/snap/google-cloud-sdk/current` symlink which is always updated by `snapd` upon installation, making the `sed` script above fix the issue once and for
all. Kinda. There are multiple users on the machine I'm using, and the above configuration is user specific. Hence why I faced this issue *twice* on the same machine. Welp.


[kubectl]: https://kubernetes.io/docs/tasks/tools/install-kubectl/
[kube-auth]: https://kubernetes.io/docs/reference/access-authn-authz/authentication/
[old-article]: /2018/05/28/a-tale-of-emacs-clojure-and-pinned-packages/
[gcloud-get-cred]: https://cloud.google.com/sdk/gcloud/reference/container/clusters/get-credentials
[ubuntu-image]: https://cloud.google.com/compute/docs/images#os-compute-support
[snap-up]: https://snapcraft.io/docs/keeping-snaps-up-to-date
