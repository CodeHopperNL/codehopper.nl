---
layout:      post
title:       The DEFLATE algorithm, visualized
primary_img: /img/post/compress.jpg
date:        2025-06-15
summary:     A commentary and visual representation of the DEFLATE compression algorithm (RFC 1951)
tags:        [algorithm, compression, deflate, gzipa]
keywords:    [algorithm, compression, deflate, gzipa]
---

> The compression of time one experiences when you're a small person underneath this huge avalanche is amazing.<br />
> -- Conrad Anker

# The DEFLATE algorithm, visualized

I've recently got on a [small journey][skuro/deflate] to implement the [RFC 1951 DEFLATE algorithm][rfc].
While I'm not done yet, I got to a good point where I can compress data that's accepted by `gzip` and `zlib`
in general. Yay! 🥳

Along the way, I found countless good resources while I was trying to grok the various details of the algorithm
itself. I think there's plenty of good content on the web except for good-quality visuals to better show what's
happening under the hood. I'll try to focus on the visuals here, for me to be able to remember how this algo works
in 10 years from now.

## Lempel Ziv 77

Let's begin with the core idea of the compession algorithm: [LZ77][lz77]. In order to compress data, we leverage the fact that repetition of (potentially big) chunks of content occur at a rate that
it's convenient for us, size wize, to just skip writing the repetition verbatim but rather use a sort of "pointer" to a previous occurrence of such chunk. Such "pointers" are provided as a pair of `(length,
distance)`, meaning that the string of lenght `length` starting at the current point is a repetition of the same `length` string starting at `distance` characters back. For example:

![LZ77-encoded string](/img/post/deflate/lz77_1.svg)

encodes the following string:

![LZ77-encoded string](/img/post/deflate/lz77_3.svg)

This is because we encounter a `(length=3, distance=4)` pointer at the string index `4`. Hence, we go back 4 characters, landing on the `A` and repeat the `length=3` characters starting from it:

![LZ77-encoded string](/img/post/deflate/lz77_2.svg)

![LZ77-encoded string](/img/post/deflate/lz77_3.svg)


The DEFLATE spec mandates a few extra constraints, for instance that the window within which repetitions are searched is maximum 32k, from which constraints on max `length` and `distance` values are
derived. Also, the repeat `length` must be at least 3 characters.

## Visualizing the process

The following little gimmick (courtesy of [Claude][claude] for the most part) shows how the encoding algorithm works when using a search window of 12 characters, step by step. You can provide your own
string if you want to see how it would perform:

<iframe style="width: 100%"
        sandbox="allow-same-origin allow-scripts"
        onload="this.style.height=(this.contentWindow.document.body.scrollHeight+20)+'px';"
        src="/_pages/embed/lz77.html"></iframe>

NOTE: the `Current encoded size` calculates each `length, distance` pair as length-2, because the compressed output does indeed include dedicated tokens for `length` and `distance`.

## Huffman coding

In the previous paragraph I mentioned the "compressed output", but how does that look like in practice? You can imagine that we will output one "thing" per each of the entities

In order to answer that question we first need to dive into the magical world of [Huffman
coding][huffman]. In Wikipedia terms:

> a Huffman code is a particular type of optimal prefix code that is commonly used for lossless data compression

So in DEFLATE, instead of outputting the character `A` we output a specific sequence of bits which represents the Huffman code for the character `A`. But what's the Huffman code for `A`? As for many
things in life, it depends.

We begin with counting the frequency with which each symbol occurs in our data. As in the previous step, let's start with the following LZ77 sequence of symbols:

![LZ77-encoded string](/img/post/deflate/lz77_2.svg)

Let's count occurrences of each symbol. For now,

[skuro/deflate]: https://github.com/skuro/deflate
[rfc]: https://datatracker.ietf.org/doc/html/rfc1951
[lz77]: https://en.wikipedia.org/wiki/LZ77_and_LZ78#LZ77
[claude]: https://claude.ai/
[huffman]: https://en.wikipedia.org/wiki/Huffman_coding
