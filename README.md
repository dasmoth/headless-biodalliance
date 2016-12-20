Headless Biodalliance
=======================

The [Biodalliance](https://www.biodalliance.org/) genome browser
in command line form!

Currently somewhat-aspirational: it's slower than in needs to be (does
some "wasted" work building a user interface that will never be seen),
and can be a bit of a pain to install on some platforms because it
depends on the node-canvas library.  It does, however, work if you need
to produce genome pictures in batch mode, and serves as an example of
how to use Biodalliance as a library rather than a standalone application.

Installation should just be:

      npm install
      npm link

And invoke with something like:

      headless-biodalliance --config sample-config.json --region 22:30000000-30500000 --output test.svg

