
Do('http://img3.douban.com/js/lib/packed_hotkeys644869918.js', function(){
  $(function(){var h=-1,a=0,f=$("#statuses"),i=$(document),b=$(window),j,l=f.find(".status-item"),e=function(m){f.find(".status-current").removeClass("status-current");l.eq(m).addClass("status-current")},k=function(){var o=$(".thispage").next(),m=o.text()|o;if(m){self.location.href=self.location.pathname+"?p="+m}},g=function(){var o=$(".thispage").prev(),m=o.text()|o;if(m){self.location.href=self.location.pathname+"?p="+m}},d=function(){if(j){window.clearTimeout(j)}var n,m;if(h+1>=l.length){k();return}h++;m=l.eq(h);n=m.offset().top;if(m.css("display")==="none"){d();return}e(h);window.scrollTo(0,n-20)},c=function(){if(j){window.clearTimeout(j)}var m=l.eq((h-1<0)?0:h-1),n=m.offset().top;if(h-1<0){h=0;g();return}h--;if(m.css("display")==="none"){c();return}e(h);window.scrollTo(0,n-20)};if(l.length){b.bind("scroll",function(m){if(j){window.clearTimeout(j)}j=window.setTimeout(function(){var p=i.scrollTop(),o,n;if(p<l.eq(0).offset().top-20){h=0;return}for(o=0,n=l.length;o<n;o++){if(l.eq(o).pos().y>p){h=o;break}}},100)})}$.hotKeys([{keys:[191],handler:function(){var m=$("input[name=search_text]");if(m.length){m.focus();setTimeout(function(){m.val("")},10)}}},{keys:["j"],handler:d},{keys:[73],handler:function(){var m,n=f.find(".status-current");if(n.length===0){return}m=n.find(".comment-text");if(m.length>0){setTimeout(function(){m[0].focus()},20)}}},{keys:[65],handler:function(){var m,n=f.find(".status-current");if(n.length===0){return}m=n.find(".btn-key-like");if(m.length>0){m.click()}}},{keys:[84],handler:function(){var m,n=f.find(".status-current");if(n.length===0){return}m=n.find(".btn-key-reshare");if(m.length>0){m.click()}}},{keys:[71,71],handler:function(){window.scrollTo(0,0)}},{keys:[82],handler:function(o){var m,n=f.find(".status-current");if(n.length===0){return}m=n.find(".btn-action-reply");if(m.length){m.eq(0).click()}}},{keys:[78],handler:function(m){window.scrollTo(0,0);setTimeout(function(){if(Do._init_isay){Do._init_isay()}else{$("#isay-cont").focus()}},10)}},{keys:[71],shift:true,handler:function(){window.scrollTo(0,$("body").innerHeight())}},{keys:["k"],handler:c},{keys:[70],handler:function(){document.body.webkitRequestFullScreen&&l.eq(h)[0].webkitRequestFullScreen()}},{keys:["}"],shift:1,handler:k},{keys:["{"],shift:1,handler:g},{keys:[80,49],handler:function(){self.location.href=self.location.pathname}}])});
});
Do(function(){
  $('.lnk-back-old').click(function(e){
    e.preventDefault();
    $.post_withck('/j/remain_oldstyle', {oldstyle:'1'}, function(){
      location.href="/";
    });
  });
  $('.lnk-sw-new').click(function(e){
    e.preventDefault();
    $.post_withck('/j/remain_oldstyle', function(){
      location.href="/";
    });
  });

});
