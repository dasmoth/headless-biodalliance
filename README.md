Headless Biodalliance
=======================

The [Biodalliance](https://www.biodalliance.org/) genome browser
in command line form!

Currently somewhat-aspirational: it's slower than in needs to be (does
some "wasted" work building a user interface that will never be seen),
and can be a bit of a pain to install on some platforms because it
depends on the node-canvas library.  Both of these are potentially fixable
given some tweaks to the core Biodalliance code.  But for now, it does
work if you need to produce genome images in batch mode, and serves
as a simple example of how to use Biodalliance as a library rather than a
standalone application.

Installation should just be:

      npm install
      npm link

And invoke with something like:

      headless-biodalliance --config sample-config.json --region 22:30000000-30500000 --output test.svg

