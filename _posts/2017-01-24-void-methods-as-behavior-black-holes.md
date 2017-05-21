---
title: Void methods as behavior black holes
layout: post
primary_img: /img/post/blackhole.jpg
tags: [java, clojure, clean code]
meta-description: As much as void methods are commonplace in many OO codebases, they are effectively information sinks which hide their behavior making them harder to test or compose. Learn how to avoid them in many common scenarios.
keywords: [java, clean code, functional programming, object oriented]
---

> This post could have been titled 'Void methods considered harmful',
> if 'considered harmful' essays weren't
> [considered harmful themselves][considered harmful]. Oh welp.

Void methods are ubiquitous in most Object Oriented codebases. A
direct consequence of mutable state or I/O somewhere in your runtime,
you can wrap any behavior that functional programming zealots would
call [impure][impure], which in principle has no meaningful return
value. One common example is during application bootstrap, e.g. in
Java:

```java
@Resource MyClass implements Runnable {

// ...

@PostConstruct
public void init() {
    if(this.enabled) {
        this.executorService.scheduleAtFixedRate(
            this,
            0,
            500,
            TimeOut.MILLISECONDS);
    }
}

// ...
}
```

The above is supposedly fine, but public void methods, and especially
a proliferation of them in a given codebase, are an evident code
smell. Even when coding in Object Oriented style.

# Your `public` interface

Public methods are meant for your class [collaborators][CRC] to
consume, they are the gateway to your class functionality. As such,
they should be as clear as concise as possible, offering the minimal
surface area needed to enable your class behaviors. One major,
self-documenting part of any function definition is naturally its
return type.

Lets start from the previous example:

```java
@Resource MyClass implements Runnable {

// ...

@PostConstruct
public void init() {
    if(this.enabled) {
        this.executorService.scheduleAtFixedRate(
            this,
            0,
            500,
            TimeOut.MILLISECONDS);
    }
}

// ...
}
```

Our class is likely receiving some sort of `executorService` instance
at construction time, possibly obtained from some
[dependency injection][magic] glue code, after which a worker schedule
is started. The likelihood of client code needing to explicitly call
`init()` is typically very low. This suggests that our
`@PostConstruct` method should probably have a more restrictive
visibility, maybe `private` or `protected`, and that would be the end
of it.

But, is it really?

# Testability

Let's say we want to actually test the shutdown
behavior of our worker threads, typically a tricky thing to do. What
you want to do is something along the lines of:

``` java

// changed code from the original MyClass file:
@PostConstruct
public ScheduledFuture<T> init() {
    if(this.enabled) {
        return this.executorService.scheduleAtFixedRate(
            this,
            0,
            500,
            TimeOut.MILLISECONDS);
    }
}


public testExecutorShutdown(){
    ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();
    MyClass c = new MyClass(service, true); // executorService, enabled
    ScheduledFuture<T> scheduled = c.init();
    executorService.shutdown();
    scheduled.get(1, TimeUnit.SECONDS); // throws exception
}
```

The above test code tests that the scheduled action terminates within
1 second (or two scheduled iterations) from the executor
shutdown. Such a test relies on accessing the future object returned
by the init method.

# Self documenting

> it is Human perception that is sealed off behind their current consciousness horizon
>
> -- *Elia Wise*

The change we made to the `init()` method enabled the behavioral test,
but introduced an important side effect: the `ScheduledFuture` object
is now part of `MyClass` public interface, meaning that now any client
code is able to interact with it. Whether this is a desirable property
really depends on the use case `MyClass` is designed to support, and
probably you want to encapsulate the `ScheduledFuture` in a more
friendly class that e.g. only exposes something like `bool
isDone()`.

In any case, keeping the above `init` method void would always end up
in your client code (or developer glancing at the `init` signature
using his/her IDE) being oblivious of what `MyClass.init()` is really
doing. Just look at the different signatures, and think of yourself
coding against each of them:

``` java
public void init()
public ScheduledFuture<T> init()
```

the latter one will save you a brain cycle every time you need to use
it, as it clearly states its produced effects without having to look
at the code or at a deeper level of documentation.

# Do one thing and do it well

Sticking to the idea that your function returns a single value to
explicitly states its behavior is obviously impossible when your
function does more than one thing at a time. Fortunately, that by
itself is a [code smell][single responsibility], and by treating your
return type as the existential purpose of your functions you make it
one step weirder to violate the principle.

# Conclusions

Be nice to your future self and in general to all developers using
your code and never hide such a valuable piece of information like
your return value in your public API, never again.

Hugs & kisses,
c.

[impure]: https://en.wikipedia.org/wiki/Pure_function#Impure_functions_in_pure_expressions
[magic]: http://imgur.com/iZcUNxH
[considered harmful]: http://meyerweb.com/eric/comment/chech.html
[CRC]: https://en.wikipedia.org/wiki/Class-responsibility-collaboration_card
[single responsibility]: https://en.wikipedia.org/wiki/Single_responsibility_principle
