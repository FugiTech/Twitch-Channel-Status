// Polyfill for document.currentScript - https://github.com/JamesMGreene/document.currentScript
!function(){function a(a){if("string"==typeof a&&a)for(var b=0,c=i.length;c>b;b++)if(i[b].src===a)return i[b]}function b(){for(var a,b=0,c=i.length;c>b;b++)if(!i[b].src){if(a)return void 0;a=i[b]}return a}function c(){var a=0;return"undefined"!=typeof e&&e&&"number"==typeof e.skipStackDepth&&(a=e.skipStackDepth),a}function d(a,b){var e,f,g,h="number"==typeof b;return b=h?b:c(),"string"==typeof a&&a&&(h?f=a.match(/((?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/):(f=a.match(/^(?:|[^:@]*@|.+\)@(?=blob|http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/),f&&f[1]||(f=a.match(/\)@((?:|blob:)(?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/),f&&f[1]&&(e=f[1]))),f&&f[1]&&(b>0?(g=a.slice(a.indexOf(f[0])+f[0].length),e=d(g,b-1)):e=f[1])),e}function e(){if(0!==i.length){if(1===i.length)return i[0];if("readyState"in i[0])for(var c=i.length;c--;)if("interactive"===i[c].readyState)return i[c];if("loading"===document.readyState)return i[i.length-1];var e,j=new Error;if(f&&(e=j.stack),!e&&g)try{throw j}catch(k){e=k.stack}if(e){var l=d(e),m=a(l);return m||l!==h||(m=b()),m}}}var f=!1,g=!1;!function(){try{var a=new Error;throw f="string"==typeof a.stack&&!!a.stack,a}catch(b){g="string"==typeof b.stack&&!!b.stack}}();var h=window.location.href,i=document.getElementsByTagName("script");e.skipStackDepth=1;var j=!("currentScript"in document),k=document.__defineGetter__,l="function"==typeof Object.defineProperty&&function(){var a;try{Object.defineProperty(document,"_xyz",{value:"blah",enumerable:!0,writable:!1,configurable:!1}),a="blah"===document._xyz,delete document._xyz}catch(b){a=!1}return a}();document._currentScript=e,j&&(l?Object.defineProperty(document,"currentScript",{get:e,enumerable:!0,configurable:!1}):k&&document.__defineGetter__("currentScript",e))}();

// Create a closure with a reference to our script
(function (document, $script) {
  // Allow customizing the script with various data-* attributes
  var attribute = $script.attr("data-attribute") || "data-twitch-channel",
      interval = parseInt($script.attr("data-interval")) || false,
      onlineImage = $script.attr("data-online-image") || 'data:image/svg+xml,<?xml version="1.0"?><svg height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="green"/></svg>',
      offlineImage = $script.attr("data-offline-image") || 'data:image/svg+xml,<?xml version="1.0"?><svg height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" fill="red"/></svg>',
      minInterval = 30; // seconds

  document.refreshTwitchChannelStatuses = function () {
    var channels = {};

    // Create a mapping of channel name -> images to update based on that channel's status
    $("img[" + attribute + "]").each(function () {
      var $this = $(this),
          channel = $this.attr(attribute).toLowerCase();

      channels[channel] = channels[channel] || [];
      channels[channel].push($this);

      // If there's no image set already, default to offline
      if (!$this.attr("src")) {
        $this.attr("src", $this.attr("data-offline-image") || offlineImage);
      }
    });

    // Don't try to load statuses for nothing
    if (!Object.keys(channels).length) {
      if (interval) {
        setTimeout(document.refreshTwitchChannelStatuses, Math.max(interval, minInterval) * 1000);
      }
      return;
    }

    // Ask twitch for the status of all channels at once
    $.ajax({
      url: "https://api.twitch.tv/kraken/streams",
      data: {"channel": Object.keys(channels).join(","), "limit": Object.keys(channels).length},
      cache: false,
      dataType: "jsonp"
    }).done(function (data) {
      // We can only handle 100 online channels at a time :(
      if (data.streams.length < data._total) {
        console.warn("refreshTwitchChannelStatuses couldn't load all online channels! Please reduce the number of channels you are trying to check.");
      }

      // Build a hash of who's online for performance
      var streams = {};
      for (var i=0; i < data.streams.length; i++) {
        streams[data.streams[i].channel.name] = true;
      }

      // Iterate through all the channels we are checking...
      for (var channel in channels) {
        if (!channels.hasOwnProperty(channel)) continue;
        var online = streams[channel],
            image = online ? onlineImage : offlineImage,
            imgs = channels[channel];

        // ...and all the images for each channel...
        for (var i=0; i < imgs.length; i++) {
          /// ...and set the image appropriately
          var $img = imgs[i];
          var src = $img.attr("data-" + (online ? "online" : "offline") + "-image") || image;
          $img.attr("src", src);
        }
      }

      // If explicitly asked to refresh the results, do so, but not too fast
      if (interval) {
        setTimeout(document.refreshTwitchChannelStatuses, Math.max(interval, minInterval) * 1000);
      }
    }).fail(function () {
      // In the event of failure, wait 5 seconds and try again
      setTimeout(document.refreshTwitchChannelStatuses, 5000);
    });
  };

  // Automatically load status on page load
  $(document.refreshTwitchChannelStatuses);
})(document, $(document.currentScript));