


Do(function(){
  
    var noti_ids = {"num": 0};
    var noti_api = 'http://www.douban.com/j/notification/read_notis';

  // 不再提醒
  Douban.init_delete_reply_notify=function(b){var a=function(g){g.preventDefault();var c=$(g.target);var h=c[0].href.split("#")[1];$.get("/j/accounts/remove_notify?id="+h);var d=c.closest(".item-req");if($.contains($(".top-nav-reminder")[0],d[0])){d=d.parent();var f=d.siblings().length;d.fadeOut(function(){d.remove()});if(f===0){d.closest(".bd").find(".no-new-notis").show()}}else{d.fadeOut()}};if(b.type==="click"){a(b)}else{$(b).click(a)}};
  Douban.init_discard_notify=function(b){var a=function(i){i.preventDefault();var c="/j/notification/discard";var f=$(i.target);var d=f[0].name;$.post_withck(c,{id:d},function(e){},"json");var g=f.closest(".item-req");if($.contains($(".top-nav-reminder")[0],g[0])){g=g.parent();var h=g.siblings().length;g.fadeOut(function(){g.remove()});if(h===0){g.closest(".bd").find(".no-new-notis").show()}}else{g.fadeOut()}};if(b.type==="click"){a(b)}else{$(b).click(a)}};
  (function(b){var e=document;var a=[];var d=function(h,f,j,p,g){var q=g.createElement("form");var l,r,m,o;var n=function(i,s){var k=g.createElement("input");k.type="hidden";k.name=i;k.value=s;return k};q.target=p;q.action=h;q.method=f;for(l in j){if(j.hasOwnProperty(l)){r=j[l];if(typeof r==="object"&&Object.prototype.toString.call(r).search(/array/i)){m=r.length;while(m--){o=n(l,r[m]);q.appendChild(o)}}o=n(l,r);q.appendChild(o)}}return q};var c=function(){a.push(0);return"_xpost_iframe_"+a.length};b.xPost=function(h,j){var k=c();var i;var g;var f;if("ActiveXObject" in window){f=new ActiveXObject("htmlfile");f.open();f.write('<html><body><iframe id="xpost-proxy-iframe'+k+'"></iframe></body></html>');f.close();g=f.getElementById("xpost-proxy-iframe"+k);g.contentWindow.name=k;i=d(h,"post",j,k,f);f.body.appendChild(i);f=f.body}else{g=e.createElement("iframe");g.width=0;g.name=k;g.height=0;g.style.position="absolute";g.style.visibility="hidden";g.src="javascript:false;";f=e.body;f.appendChild(g);i=d(h,"post",j,k,e);f.appendChild(i)}g.onload=function(){};i.submit()}})(jQuery);var popup;var nav=$("#db-global-nav");var more=nav.find(".bn-more");nav.delegate(".bn-more, .top-nav-reminder .lnk-remind","click",function(f){f.preventDefault();var c=$(this);var d=c.parent();if(popup){popup.parent().removeClass("more-active");if($.contains(d[0],popup[0])){popup=null;return false}}d.addClass("more-active");popup=d.find(".more-items");if(c.hasClass("lnk-remind")&&noti_ids.num){var a=nav.find(".top-nav-reminder .num");var b=(a.find("span").text()|0)-noti_ids.num;b=b<=0?0:b;if(b===0){a.hide()}else{a.find("span").text(b)}noti_ids.num=0;$.xPost(noti_api,$.extend({ck:get_cookie("ck")},noti_ids))}return false});$(document).click(function(a){if($(a.target).closest(".more-items").length){return}if(popup){popup.parent().removeClass("more-active");popup=null}});
});

Do(function(){
  var nav = $('#db-nav-sns');
  var inp=$("#inp-query"),label=inp.closest(".nav-search").find("label");if(inp.val()!==""){label.hide()}inp.parent().click(function(){inp.focus();label.hide()}).end().focusin(function(){label.hide()}).focusout(function(){if($.trim(this.value)===""){label.show()}else{label.hide()}}).keydown(function(){label.hide()});nav.find(".lnk-more, .lnk-account").click(function(b){b.preventDefault();var d,a=$(this),c=a.hasClass("lnk-more")?$("#db-productions"):$("#db-usr-setting");if(!c.data("init")){d=a.offset();c.css({"margin-left":(d.left-$(window).width()/2-c.width()+a.width()+parseInt(a.css("padding-right"),10))+"px",left:"50%",top:d.top+a.height()+"px"});c.data("init",1);c.hide();$("body").click(function(g){var f=$(g.target);if(f.hasClass("lnk-more")||f.hasClass("lnk-account")||f.closest("#db-usr-setting").length||f.closest("#db-productions").length){return}c.hide()})}if(c.css("display")==="none"){$(".dropdown").hide();c.show()}else{$(".dropdown").hide()}});
});

var tagsug_src = "http://img3.douban.com/js/lib/packed_tagsug2640635463.js";
window.Do=window.Do||function(a){typeof a=="function"&&setTimeout(a,0)};Do.add_js=function add_js(b){var a=document.createElement("script");a.src=b;document.getElementsByTagName("head")[0].appendChild(a)};Do.add_css=function add_css(c,b){var a=document.createElement("link");a.rel="stylesheet";a.href=c;document.getElementsByTagName("head")[0].appendChild(a)};Do.check_js=function check_js(a,c){var b=a();if(b){c(b)}else{setTimeout(function(){check_js(a,c)},33)}};Do(function(){var a=$("#inp-query,#search_text");a.one("focus",function(){Do.add_js(tagsug_src);Do.check_js(function(){return $.fn.tagsug&&window.Mustache},function(){a.tagsug({max:8,useUid:true,tips:"@某人，直达其个人主页"});var b=a._tagsug_api[0];b.on("choose",function(d,c){window.location="/people/"+c+"/"});a.tagsug({wordLimit:30,url:"",max:null,haltLink:false,customData:{cls:"sug-quick-search",items:[{name_cn:"图书",url:"http://book.douban.com/subject_search?cat=1003&search_text="},{name_cn:"电影",url:"http://movie.douban.com/subject_search?cat=1002&search_text="},{name_cn:"音乐",url:"http://movie.douban.com/subject_search?cat=1001&search_text="},{name_cn:"同城活动",url:"http://www.douban.com/event/search?search_text="}]},listTmpl:'<ul class="{{cls}}">{{#items}}<li><a href="{{url}}{{q}}">搜索 <b>{{q}}</b> 的{{name_cn}}</a></li>{{/items}}</ul>',leadChar:"%",tips:null})})})});

    Do(function() {
      var bn_status_more = $('.bn-status-more');
      var status_cate = $('.status-cate');
      bn_status_more.click(function(e) {
        var el = $(this);
        el.parent().toggleClass('status-more-active');
        return false;
      });
      $('html').click(function(e) {
        if (!$(e.target).hasClass('cate-list-title')) {
            status_cate.removeClass('status-more-active');
        }
      });
    });
    
Do(function () {
  function add_js(src) {
    var js = document.createElement('script');
    js.src = src;
    document.getElementsByTagName('head')[0].appendChild(js);
  }
  add_js("http://img3.douban.com/js/sns/widgets/packed_isay2799024300.js");
  var thelabel = $('#isay-label');
  var thetextarea = $('#isay-cont');
  var root = $('#db-isay');

  function check(elem) {
    if (Do.ISay) {
        Do.ISay.init(elem);
        thelabel.html('说点什么吧...');
        if (!$.fn.tagsug) add_js("http://img3.douban.com/js/lib/packed_tagsug2640635463.js");
    } else {
      setTimeout(function() {
        check(elem);
      }, 80);
    }
  }

  function initDragAndDrop() {
    if (Do.ISay) {
      Do.ISay.initials.dargAndDrop(thetextarea);
    } else {
      setTimeout(initDragAndDrop, 80);
    }
  }

  function init_isay(e) {
    init_isay = null;
    if (!Do.ISay) {
      thelabel.html('正在初始化...');
    }
    var elem = e.target;
    if (elem.tagName.toUpperCase() == 'INPUT') {
      // for upload file..
      setTimeout(function() {
        check(elem);
      }, 100);
      return;
    }
    thetextarea.focus();
    check(elem);
    if (elem.tagName.toUpperCase() == 'A') e.preventDefault();
    e.stopPropagation();
  }

  // to prevent trigger more than one time
  function handleEvent(e) {
    init_isay && init_isay(e);
  }

  setTimeout(function() {
    if (thetextarea.val()) thelabel.hide();
  }, 50);

  $('#isay-upload-inp').one('change', handleEvent);
  thetextarea.one('focus dragenter', handleEvent);
  initDragAndDrop();
  root.one('click', handleEvent);
  if (location.search) {
    var params = location.search.substring(1).split('&');
    var topic;
    for ( var i = 0 ; i < params.length; i++ ) {
        var _m = params[i].split('=');
        if (_m[0] === 'topic') {
            topic = decodeURIComponent(_m[1]);
        }
    }

    if (topic) {
        thetextarea.val('#' + topic + '# ');
        var el = thetextarea[0];
        if (el.setSelectionRange) {
           el.focus();
           el.setSelectionRange(el.value.length, el.value.length)
        } else {
           range = el.createTextRange();
           range.collapse(false);
           range.select();
        }
    }
  }
});

Do.add('tagsug', { path: "http://img3.douban.com/js/lib/packed_tagsug2640635463.js" });
Do('http://img3.douban.com/js/packed_statuses905027013.js', function(){
  var uid='Dexter_Yy';
$(function(){var a=$(".stream-items");window.crt_uid=uid;a.find(".mod").each(function(c,e){var d=$(this),f=d.attr("data-status-id");var b=new Status($(this),f);b.init()});a.find(".btn[data-action-type=expend-all]").click(function(b){b.preventDefault();$(this).parent().prevAll(".status-item").show().end().remove()});a.delegate(".video-overlay","click",function(b){$(this).next(".video-object").show();$(b.target).hide().prev().hide()}).delegate(".video-object .back","click",function(b){b.preventDefault();$(this).parent().hide().prevAll().show()}).delegate(".bd blockquote a, .comments-items a:not(.btn)","click",function(h){var f=$(h.target).parents(".status-item");var b=f.attr("data-sid");var g=f.attr("data-action");var d=f.attr("data-target-type");var c=f.attr("data-object-kind");moreurl(this,{from:"nmbp-"+b,action:g,target_type:d,object_kind:c})})});
});

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
