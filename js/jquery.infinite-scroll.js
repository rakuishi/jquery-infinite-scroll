;(function($, undefined) {
  'use strict';
  $.fn.runInfiniteScroll = function(options) {

    var
    settings = $.extend({
      container: '.container',
      content: '.content',
      next: '.next'
    }, options),

    windowHeight = typeof window.outerHeight !== 'undefined'
      ? Math.max(window.outerHeight, $(window).height())
      : $(window).height(),
    documentHeight = $(document).height(),
    isLoadingNextContent = false,
    contents = new Array(),
    currentPosition = 0,

    replaceHisotryAndUpdateTitle = function(content) {
      history.replaceState(null, content.title, content.url);
      $('title').html(content.title);
    },

    pushContent = function(html, url) {
      var position = $(settings.content).length - 1;
      contents.push({
        title: html == null ? $('title').text() : $(html).filter('title').text(),
        url: url,
        offset: $(settings.content).eq(position).offset().top,
      });
    },

    loadNextContent = function() {
      if (isLoadingNextContent) { return; }

      var position = $(settings.content).length - 1;
      var url = $(settings.content).eq(position)
          .find(settings.next).first()
          .find('[rel=next]').first().attr('href');
      if (url === undefined) { return false; }

      isLoadingNextContent = true;
      $.ajax({
        url: url,
        dataType: 'html',
        success: function(html) {
          var $html = $(html);
          if ($html.find(settings.content) === undefined) { return false; }
          $(settings.container).append($html.find(settings.content));
          pushContent(html, url);
          var position = contents.length - 2;
          $(settings.content).eq(position).find(settings.next).hide();
          documentHeight = $(document).height();
          isLoadingNextContent = false;
        }
      });
    },

    updateCurrentPosition = function(currentHeight) {
      var position = currentHeight + windowHeight / 2;

      for (var i = 0; i < contents.length; i++) {
        // 配列数 1、末尾、次の要素がありその中間点に存在する場合
        if (i + 1 == contents.length || i + 1 < contents.length && contents[i].offset <= position && position < contents[i + 1].offset) {
          if (currentPosition != i) {
            replaceHisotryAndUpdateTitle(contents[i]);
          }
          currentPosition = i;
          return false;
        }
      }
    },

    init = function() {
      pushContent(null, $(location).attr('href'));

      $(window).scroll(function() {
        var currentHeight = $(window).scrollTop();
        updateCurrentPosition(currentHeight);

        if (currentHeight + windowHeight >= documentHeight) {
          loadNextContent();
        }
      });
    };

    init();
  };
})(jQuery);
