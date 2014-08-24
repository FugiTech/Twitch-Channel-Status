=====================
Twitch Channel Status
=====================

A simple library for adding stream status images to your website.

Usage
=====

Add the following anywhere on your webpage to include the library:

.. code-block:: html
    
    <script src="https://code.jquery.com/jquery-1.11.1.min.js"></script>
    <script src="https://raw.githubusercontent.com/Fugiman/Twitch-Channel-Status/master/twitch-channel-status.min.js"></script>

Then create image tags on your webpage to display if a channel is online or offline:

.. code-block:: html
    
    <img data-twitch-channel="riotgames">

Configuration
=============

When loading the library, you can add additional arguments to the script tag to customize it's behavior.

data-attribute :
    Instead of using ``data-twitch-channel`` to identify which images to overwrite, it uses the value of this attribue.

data-interval :
    By default the library will only fetch channel status on page load, but if this attribute is provided it'll refresh the status based on the number provided (in seconds).

data-online-image :
    The image used if a channel is online. By default this is a green circle.

data-offline-image :
    The image used if a channel is offline. By default this is a red circle.

Additionally, each individual image can also specify ``data-online-image`` and ``data-offline-image``.

License
=======

Twitch Channel Stuatus is (c) 2014 Christopher Gamble and is made available under the MIT license.