/*
try{
    if (top.location.hostname != window.location.hostname && document.referrer.search(/http:\/\/[^\/]+\.douban\.com/i) !== 0) {
        top.location.href =window.location.href;
    }
}
catch(e){
    if (document.referrer.search(/http:\/\/[^\/]+\.douban\.com/i) !== 0) {
        top.location.href = window.location.href;
    }
}
*/

Do = (typeof Do === 'undefined')? function(fn){setTimeout(fn, 0);} : Do;
Douban = new Object();
Douban.errdetail = [
    '','未知错误','文件过大',
    '信息不全','域名错误','分类错误',
    '用户错误','权限不足','没有文件',
    '保存文件错误','不支持的文件格式','超时',
    '文件格式有误','','添加文件出错',
    '已经达到容量上限','不存在的相册','删除失败',
    '错误的MP3文件','有禁用的内容,请修改重试'];

var trace = function(o){
    if(!/^http:\/\/(www|movie|music\.|book|douban\.fm)/.test(location.href) && window.console && window.console.log){
        console.log(o);
    }
}

var report = function(s){$.get('/j/report?e='+s)}

Douban.EventMonitor = function(){
    this.listeners = new Object();
}

Douban.EventMonitor.prototype.broadcast=function(widgetObj, msg, data){
    var lst = this.listeners[msg];
    if(lst != null){
        for(var o in lst){
            lst[o](widgetObj, data);
        }
    }
}

Douban.EventMonitor.prototype.subscribe=function(msg, callback){
    var lst = this.listeners[msg];
    if (lst) {
        lst.push(callback);
    } else {
        this.listeners[msg] = [callback];
    }
}
Douban.EventMonitor.prototype.unsubscribe=function(msg, callback){
    var lst = this.listener[msg];
    if (lst != null){
        lst = lst.filter(function(ele, index, arr){return ele!=callback;});
    }
}

// Page scope event-monitor obj.
var event_monitor = new Douban.EventMonitor();

function load_event_monitor(root) {
    var re = /a_(\w+)/;
    var fns = {};
    $(".j", root).each(function(i) {
        var m = re.exec(this.className);
        if (m) {
            var actionName = m[1],
                f = fns[actionName];
            if (!f) {
                f = eval("Douban.init_"+actionName);
                fns[actionName] = f;
            }
            f && f(this);
        }
    });
}

function request_log_ad_displays() {
    $('div[id^="daslot"]').each(function(i) {
        var id = $(this).attr('id');
        params = id.split("-");
        $.get("/j/da/view?da="+ params[1] + "&dag=" + params[2]
            + "&dac=" + params[3] + "&p=" + params[4] + "&kws="
            + params[5]);
    });
}

Douban.prettify_form = function(form) {
    $('input:submit', form).each(function(i) {
        var btn = $('<a href="#" class="butt"></a>').text($(this).val());
        btn.click(function() {
            if(clean_tip()) form.submit();
            return false;
        });
        $(this).hide().after(btn);
    });
}

var get_form_fields = function(form) {
    var param = {};
    function add_item(name, value) {
      var v = param[name];
      var t = (typeof v);
      if (t == 'string') {
        param[name] = [v, value]
      } else if (t == 'object') {
        param[name].push(value)
      } else {
        param[name] = value
      }
    }
    $(':input', form).each(function(i){
        var name = this.name;
        var val = this.value;
        if ((this.type == 'radio' || this.type == 'checkbox')) {
            if (this.checked) add_item(name, val);
        } else if (this.type == 'submit'){
            if (/selected/.test(this.className)) param[name] = val;
        } else if (name) {
            add_item(name, val);
        }
        if(/notnull/.test(this.className) && this.value == ''){
            $(this).prev().addClass('errnotnull');
            param['err'] = 'notnull';
        }
    });
    return param;
}

var remote_submit_json = function(form, func, disable, action) {
    var fvalue = get_form_fields(form);
    if(fvalue['err'] != undefined) return;
    $(':submit,:input',form).attr('disabled',disable==false?0:1);
    var act = action || form.action;
    $.post_withck(act, fvalue, function(ret){
        func(ret);
    }, 'json');
}

/* entry vote button */
Douban.init_evb = function(o) {
    var eid = $(o).attr("id").split("-")[1];
    $(o).submit(function() {
        var url = "/j/entry/" + eid + "/vote";
        $.post_withck(url, function(ret) {
            var r = eval("("+ret+")");
            event_monitor.broadcast(this, "entry_"+eid+"_voted", r);
            $(o).text("你的投票已经提交，谢谢。")
            $("#nf-"+eid).hide();
            $("#nf_s-"+eid).hide();
        });
        return false;
    });
}

/* entry vote count */
Douban.init_evc = function(o) {
    var eid = $(o).attr("id").split("-")[1];
    event_monitor.subscribe("entry_"+eid+"_voted", function(caller, data) {
        var count = data.rec_count;
        if (count) {
            $(o).text(""+count+"人推荐").removeClass("hidden");
        }
    });
}

/* entry nointerest button */
Douban.init_enb = function(o) {
    var eid = $(o).attr("id").split("-")[1];
    $(o).submit(function() {
        var url = "/j/entry/" + eid + "/nointerest";
        $.post_withck(url, function(ret) {
            $(o).text("你的投票已经提交，谢谢。");
            $("#a_evb-"+eid+",#evb_s-"+eid).hide();
        });
        return false;
    });
}

var voteuse_act = function(useful, id, type, isnew) {
    var url = "/j/" + type + "/" + id + (useful?"/useful":"/useless");
    $.postJSON_withck(url, {}, function(ret){
        if (ret.result) {
            if(isnew){
                var u = $('#ucount'+id+'u'),l = $('#ucount'+id+'l');
                if ((u.text() == ret.usecount) &&
                    (l.text()==ret.totalcount - ret.usecount) &&
                    (ret.result != 'notself')){
                    alert('你已经投过票了');
                }
                u.html(ret.usecount);
                l.html(ret.totalcount-ret.usecount);
            }else{
                $('#voteuse_'+id).html('<span class="m gtleft">你的投票已经提交，谢谢。</span>');
                $('#userate_'+id).html('<p id="userate_%s" class="pl">' + ret.usecount + '/' + ret.totalcount + '的人觉得此评论有用:</p>');
            }
        }
        return false;
    });
}

var vote_type = function(prefix){
    switch(prefix){
    case 'd': return "doulist";
    case 'r': return "review";
    case 'c': return "discussion";
    case 's': return "song";
    }
}

var voteuseful = function(id, isnew) {
    var _ = id.split('-');
    var type = vote_type(_[0]);
    return voteuse_act(true, _[1], type, isnew);
}

var voteuseless = function(id, isnew) {
    var _ = id.split('-');
    var type = vote_type(_[0]);
    return voteuse_act(false, _[1], type, isnew);
}

var remove_movie_discussion = function(path, ck) {
    custome_bt = [
        {
            text: '确认',
            method: function(){
                window.location = path + "remove?ck=" + ck;
            }
        },
        {
            text: '取消',
            method: function(o){
                o.close();
            }
        }
    ];
    var rm_dlg = dui.Dialog({
        isHideClose: true,
        title: "确认删除",
        content: "真的要删除这篇讨论吗?",
        width: 400,
        buttons: custome_bt
    });

    rm_dlg.open().update();
}

/* blog entry folding */
Douban.init_bef = function(o) {
    var eid = $(o).attr('id').split('entry-')[1],
    unfolder = $('.unfolder',o),folder = $('.folder',o),
    s = $('.entry-summary',o), f = $('.entry-full',o);
    unfolder.click(function(){
        if(f.text() == ""){
            var loadtip = $('<div class="loadtip">正在载入...</div>');
            var loadhl = setTimeout(function(){$('.source',o).before(loadtip);}, 200);
            var url = '/j/entry/'+eid+'/';
            $.getJSON(url, function(j){
                clearTimeout(loadhl);
                loadtip.hide();
                $.post_withck(url+'view', {});
                f.html(j.content).find('a').attr('target','_blank');
                f.show();
                s.hide();
            });
        }else{
            f.show();
            s.hide();
        }
        unfolder.hide();
        folder.show();
        return false;
    }).hover_fold('unfolder');

    folder.click(function(){
        s.show();
        f.hide();
        folder.hide();
        unfolder.show();
    }).hover_fold('folder');
}

Douban.init_unfolder_n = function(o){
    $(o).click(function(){
        var rid = $(o).attr('id').split('-')[1];
        var url = '/j/note/'+rid+'/full';
        $.getJSON(url, function(r) {
            $('#note_'+rid+'_short').hide();
            $('#note_'+rid+'_full').html(r.html);
            $('#note_'+rid+'_full').show();
            $('#note_'+rid+'_footer').show();
            $('#naf-'+rid).hide();
            $('#nau-'+rid).show();
            load_event_monitor($('#note_'+rid+'_full'));
        });
        return false;
    }).hover_fold('unfolder');
}

Douban.init_folder_n = function(o){
    $(o).click(function(){
        var rid = $(o).attr('id').split('-')[1];
        $('#note_'+rid+'_full').hide();
        $('#note_'+rid+'_short').show();
        $('#note_'+rid+'_footer').hide();
        $(o).hide();
        $('#naf-'+rid).show();
    }).hover_fold('folder');
}

Douban.init_unfolder = function(o){
    $(o).click(function(){
        var rid = o.id.split('-')[1];
        var sw = o.rel.split('-')[1];
        var url = '/j/review/'+rid+'/fullinfo';
        $.getJSON(url, {show_works:sw}, function(r) {
           var d = document.createElement('div');
           d.innerHTML = r.html;
            $('#review_'+rid+'_short').hide();
            $('#review_'+rid+'_full').html('').append(d);
            $('#review_'+rid+'_full').show();
            $('#af-'+rid).hide();
            $('#au-'+rid).show();
            load_event_monitor($('#review_'+rid+'_full'));
        });
        return false;
    });
}

Douban.init_folder = function(o){
    $(o).click(function(){
        var rid = $(o).attr('id').split('-')[1];
        $('#review_'+rid+'_full').hide();
        $('#review_'+rid+'_short').show();
        $(o).hide();
        $('#af-'+rid).show();
    });
}

/* blog entry voters folding */
Douban.init_bevf = function(o) {
    var eid = $(o).attr('id').split('bevs-')[1];
    var h = $('.voters_header',o);
    if (!h.length) return;
    h.hover(function(){$(this).addClass('clickable_title');},
        function(){$(this).removeClass('clickable_title');});
    var v = $('#vsl',o);
    var l = $('.link', o);
    var m = $('#more_voters',o);

    var fn = function(e) {
        var f = $(".mv",o);
        if (f.length) {
            var d = f.toggle().css('display');
            l.text(d=='none' ? "更多推荐者" : "隐藏");
            if (m.length)
                m.toggle().css('display');
        } else {
            t=$('<li>正在装载...</li>');
            if (v.length) {
                v.append(t);
            } else {
                h.after(v=$('<ul id="vsl" class="user-list pl indent"></ul>'));
                v.append(t);
            }
            var url = '/j/entry/'+eid+'/voters?start=8';
            $.getJSON(url, function(j) {
                t.css('display','none');
                t.before($(j.html));
                if (m.length) {
                    m.css('display','none');
                }
            });
            $('.link', o).text("隐藏");
        }
        return false;
    }
    h.click(fn);
    l.click(fn);
};

Douban.init_guidelink = function(o) {
    $(o).click(function() {
        window.open('/help/guide1', '', 'width=640,height=400');
        return false;
    });
};

Douban.init_closelink = function(o) {
    $('<a href="#">关闭</a>').appendTo($(o)).click(function() {
        window.close();
        return false;
    });
};

function ext_links() {
    es = $('.entry-summary');
    es.each(function (i) {
        var a = $(es[i]).find('a');
        a.each(function (j) {
            a[j].target = '_blank';
        });
    });
}

Douban.init_confirm_link = function(o) {
    if(/recc/.test(o.name)) {
        var _ = o.name.split('-');
        var link = $(o).attr('href').split('/');
        var pid = link[0] != 'http:' ? link[2] : link[4];
        var url = '/j/rec_comment';
        $(o).click(function(){
            var bln = confirm("真的要删除?");
            if(bln){
                $.getJSON(url,{rid: _[1], del_comment: _[2]}, function(){
                    $(o).parent().parent().parent().remove();
                })
            }
            return false;
        })
    } else if(/sayc/.test(o.name)) {
        var _ = o.name.split('-');
        var link = $(o).attr('href').split('/');
        var pid = link[0] != 'http:' ? link[2] : link[4];
        var url = '/j/saying_comment';
        $(o).click(function(){
            var bln = confirm("真的要删除?");
            if(bln){
                $.getJSON(url,{sid: _[1], del_comment: _[2]}, function(){
                    $(o).parent().parent().parent().remove();
                })
            }
            return false;
        })

    } else {
        var o = $(o);
        o.click(function() {
            var text = o.attr('title') || o.text();
            text = (text.slice(0,1) == '!') ? text.slice(1) : "真的要"+text+"?";
            return confirm(text);
        });
    }
}

var populate_tag_btns = function(title, div, tags, hash){
    if (tags.length) {
        var p = $('<dl><dt>'+title+'</dt></dl>'),d = $('<dd></dd>');
        $.each(tags, function(i,tag) {
            var btn = $('<span class="tagbtn"></span>').addClass(hash[tag.toLowerCase()]?'rdact':'gract').text(tag);
            d.append(btn).append(' &nbsp; ');
        });
    p.append(d);
        div.append(p);
    }
}

Douban.init_music_sync_form = function(form) {
    var music = $('form.music-sns'),
        show_sync = $('form.show_sync');
    if(music.length && show_sync.length){
        // 豆瓣音乐分享到豆瓣说及第三方应用, 需在收藏前弹出设置
        $('#overlay, #dialog').hide();
        var auth = dui.Dialog({
            'title': '授权同步信息至豆瓣说与第三方网站',
            'url': '/settings/pop',
            'autoupdate': true,
            'callback': function(data, o){
                $('a#btn-later', o.node).bind('click', function(){
                    $('div.dui-dialog').remove();
                    $('#overlay, #dialog').show();
                    return false;
                });
                $('a#btn-never', o.node).bind('click', function(e){
                    e.preventDefault();
                    $.post_withck('/settings/never_pop_sync_settings', {}, function(){
                        $('div.dui-dialog').remove();
                        $('#overlay, #dialog').show();
                    });
                    return false;
                });
                $('a.dui-dialog-close', o.node).bind('click', function(){
                    $('div.dui-dialog').remove();
                    $('#overlay, #dialog').show();
                    return false;
                });
            }
        });
        auth.open();

        $('a#btn-auth').live('click', function() {
            $.post_withck('/settings/pop_sync', {}, function(data) {
                var node = auth.node;
                if(node.find('.bd').find('#pop-sync').length == 0){
                    node.find('.bd').append(data);
                    auth.update();
                }
            });
        });
    }
}

Douban.init_interest_form = function(form) {
    Douban.init_music_sync_form(form);
    var oFrm = $(form),
        btns = {},
        selected = {},
        oShare = $('.share-label', form);

    $('body').data('shuo-conf', true);
    $('body').data('sina-conf', true);
    $('body').data('tencent-conf', true);

    if (oFrm.data('bind') === 'true') {
        return;
    } else {
        oFrm.data('bind', 'true');
    }

    var select = function(tl) {
        if (btns[tl]) {
            selected[tl] = true;
            $.each(btns[tl], function(i, btn) {
                $(btn).removeClass('gract').addClass('rdact');
            });
        }
    }
    var deselect = function(tl) {
        if (btns[tl]) {
            delete selected[tl];
            $.each(btns[tl], function(i, btn) {
                $(btn).removeClass('rdact').addClass('gract');
            });
        }
    }
    var update = function() {
        var tags = $.trim(form.tags.value.toLowerCase()).split(' '), hash = {};
        $.each(tags, function(i, t){
            if (t != '') { select(t); hash[t] = true; }
        });
        for (t in selected) { if (!hash[t]) deselect(t) }
    }
    var changePrivate = function() {
        var oPrivate = $('#inp-private'),
            labels = oPrivate.parents('form').find('.share-label');
            checked = oPrivate.attr("checked");
        if (checked) {
          labels.addClass('greyinput').find('input').each(function(i, item) {
            item.__checked = item.checked;
            item.disabled = true;
            item.checked = false;
          });
        } else {
          labels.removeClass('greyinput').find('input').each(function(i, item) {
            if ('__checked' in item) {
              item.checked = item.__checked;
            }
            item.disabled = false;
          });
        }
    }
    var changeShare = function(e) {
        var key = e.data.key,
            conf = $('body').data(key);
        if (conf == true) { conf = false } else { conf = true };
        $('body').data(key, conf);
    }

    update();
    if($(form).data('comment')){
        form.comment.focus();
    }
    else if($('#foldcollect').val() == 'U'){
        form.tags.focus();
    }

    $(form).submit(function() {
        var sid = $(this).attr('action').split('/')[3];
        remote_submit_json(this, function(data){
            var shuo = $('#dialog .shuo :input[type=checkbox]'),
                movie = $('div#dialog form.movie-sns');
                book = $('div#dialog form.book-sns');
            if (data.r != 0){
                $('#saving').remove();
                $('#submits').show();
                $('#error').html(Douban.errdetail[data.r]);
                refine_dialog();
                return
            }
            $("#collect_form_"+sid).html('');

            if (shuo.length && shuo[0].checked) {
              close_dialog();
              if (typeof DoubanShare !== 'undefined') {
                DoubanShare.share(data);
                DoubanShare.onDialogClose(function(){
                  self.location.replace(self.location.href);
                });
              }
              return;
            /*
            }else if(movie.length && data.pop_sync){
            // 豆瓣电影分享到豆瓣说及第三方应用(已废弃)
                close_dialog();
                var auth = dui.Dialog({
                    'title': '授权同步信息至豆瓣说与第三方网站',
                    'url': '/settings/pop',
                    'autoupdate': true,
                    'callback': function(data, o){
                        $('a#btn-later', o.node).bind('click', function(){
                            $('div.dui-dialog').remove();
                            self.location.replace(self.location.href);
                            return false;
                        });
                        $('a#btn-never', o.node).bind('click', function(e){
                            e.preventDefault();
                            $.post_withck('/settings/never_pop_sync_settings', {}, function(){
                                $('div.dui-dialog').remove();
                                self.location.replace(self.location.href);
                            });
                            return false;
                        });
                        $('a.dui-dialog-close', o.node).bind('click', function(){
                            self.location.replace(self.location.href);
                            return false;
                        });
                    }
                });

                auth.open();
            */
            }else if(movie.length && data.cid){
            // 豆瓣电影优惠券发放
                close_dialog();
                var cid = data.cid, pid = data.pid;
                var dlg = dui.Dialog({
                    'title': '已保存为想看',
                    'url': '/j/coupon_info?coupon_id=' + cid,
                    'autoupdate': true,
                    'callback': function(data, o){
                        $('a#btn-giveup', o.node).bind('click', function(){
                            $('div.dui-dialog').remove();
                            self.location.replace(self.location.href);
                            return false;
                        });
                        $('a#btn-accept', o.node).bind('click', function(e){
                            e.preventDefault();
                            $.post_withck('/ticket/coupon/get/'+pid+'/accept?cid='+cid, {}, function(){
                                $('div.dui-dialog').remove();
                                self.location.replace(self.location.href);
                            });
                            return false;
                        });
                    }
                });

                dlg.open();
            }else if(book.length && data.book_pop_sync){
            // 豆瓣读书分享到豆瓣说及第三方应用
                close_dialog();
                var auth = dui.Dialog({
                    'title': '授权同步信息至豆瓣说与第三方网站',
                    'url': '/settings/pop',
                    'autoupdate': true,
                    'callback': function(data, o){
                        $('a#btn-later', o.node).bind('click', function(){
                            $('div.dui-dialog').remove();
                            self.location.replace(self.location.href);
                            return false;
                        });
                        $('a#btn-never', o.node).bind('click', function(e){
                            e.preventDefault();
                            $.post_withck('/settings/never_pop_sync_settings', {}, function(){
                                $('div.dui-dialog').remove();
                                self.location.replace(self.location.href);
                            });
                            return false;
                        });
                        $('a.dui-dialog-close', o.node).bind('click', function(){
                            self.location.replace(self.location.href);
                            return false;
                        });
                    }
                });

                auth.open();
            }

            if ($(form).data('reload')) {
                if (/subject\/\d+\/comments/.test(location.href)){
                    location.href = location.href.split('?sort')[0] + '?sort=time';
                }else if (/people\/[^\/]+\/(edittag|all|do|wish|collect)/.test(location.href)){
                    location.href = location.href;
                }else{
                    location.href = location.href.split('?')[0];
                }
            }else{
                close_dialog();
            }
        },false);
        $('#submits').hide().after('<div id="saving" class="m">正在保存...</div>');
        refine_dialog();
        return false;
    });
    if(oShare){
      $('#inp-private').click(changePrivate);
      $('input[name=share-shuo]').bind('click', {key:'shuo-conf'}, changeShare);
      $('input[name=share-sina]').bind('click', {key:'sina-conf'}, changeShare);
      $('input[name=share-tencent]').bind('click', {key:'tencent-conf'}, changeShare);
    };
    $(form.cancel).click(function(){
        var sid = $(form).attr('action').split('/')[3];
        $("#collect_form_"+sid).html('');
    });

    $('.tagbtn', form).each(function(i){
        var tl = $(this).text().toLowerCase();
        if (btns[tl]) btns[tl].push(this);
        else btns[tl] = [this];
    }).click(function(){
        var tag = $(this).text();
        var tags = $.trim(form.tags.value).split(' '), present=false, tl=tag.toLowerCase(), i;
        tags = $.grep(tags, function(t, i) {
            if (t.toLowerCase() == tl) {
                deselect(tl);
                present = true;
                return false;
            } else {
                return true;
            }
        });
        if (!present) { tags.push(tag); select(tl); }
        var content = tags.join(' ');
        form.tags.value = (content.length > 1) ? content+' ' : content;
        form.tags.focus();
    });

    $(form.tags).keyup(update);
}

Douban.init_stars = function(o){
    var ratewords = {1:'很差', 2:'较差', 3:'还行', 4:'推荐', 5:'力荐'},
    n = $('#n_rating', o), s = $('#stars img', o),
    f = function(i) {
        var rating = n.val() || 0;
        s.each(function(j){
            var gif =  this.src.replace(/\w*\.gif$/, ((j<i) ? 'sth' : ((j<rating) ? 'st' : 'nst')) + '.gif');
            this.src = gif;
        });
        if (i) {
                $('#rateword', o).text(ratewords[i]);
        } else {
                $('#rateword', o).text(rating ? ratewords[rating] : '');
        }
    }

    s.hover(function(){f(this.id.charAt(4))}, function(){f(0)});

    if(n.attr('name')){
        s.click(function(){
            var rating = this.id.charAt(4);
            n.val(rating);
            f(rating);
        });
    }
    f();
}

Douban.init_tries_to_listen = function(o) {
    var m = $(o).attr('name');
    $(o).click(function(){
        var isFF=!document.all;
        if(m!=''){
            var _ = m.split('-')
            var w = _[0];
            var h = _[1];
        }
        else{
            var w = 384;
            var h = 450;
        }
        var left = (screen.width-w)/2;
        var top = isFF?(screen.height-h)/2:50;
        window.open($(o).attr('href'),'','width='+w+',height='+h+',top='+top+',left='+left+',scrollbars=0,resizable=0,status=1');
        return false;
    });
}

Douban.init_discover = function(o){
    var txt = $('#discover_text')[0]
    $(o).submit(function(form) {
        if(!txt.value || txt.value == txt.title) return false
        var cat = "";
        cat = $(":radio:checked")[0].value;
        if (cat == "event"){
            $("#discover_s").attr("action","/event/search");
        }else if (cat == "group"){
            $("#discover_s").attr("action","/group/search?q="+$("#discover_text").value);
        }else{
            $("#discover_s").attr("action","/subject_search");
        }
    });
    $(o,':radio').click(function(){
        txt.focus();
    })
}

var friend_form_update = function(data, uid) {
    $("#divac").html(data);
    $("#submitac").submit(function(){
        this.action = "/j/people/"+uid+"/friend";
        remote_submit_json(this,function(r) {
            $("#divac").parent().html(r['html']);
            $("#tip_wait").yellow_fade();
            load_event_monitor($(data));
        });
        return false;
    });
    $("#cancelac").click(function(){
        $("#divac").html("");
    });
}

Douban.init_review_full = function(o) {
    var i = $(o).attr('id').split('_');
    var rid = i[1];
    var stype = i[2];
    $('.link', o).click(function(){
        var url = '/j/review/'+rid+'/'+stype;
        $.getJSON(url, function(r) {
            $(o).html(r.html);
            load_event_monitor($(o));
        });
        return false;
   });
}

Douban.init_show_login = function(o){
    var node = $(o);
    node.click(function(){
        var p = node.data('params');
        p = p ? '?' + p : '';
        return pop_win.load('/j/misc/login_form' + p)
    });
}

Douban.init_show_signup_table = function(o){
    $(o).click(function(){
        event_id = window.location.href.split('/')[4];
        return pop_win.load('/j/event/'+event_id+'/signup')
    });
}

// 转移==> core/cookie.js
var set_cookie = function(dict, days, domain, path){
    var date = new Date();
    date.setTime(date.getTime()+((days || 30)*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    for (var i in dict){
        document.cookie = i+"="+dict[i]+expires+"; domain=" + (domain || "douban.com") + "; path=" + (path || "/");
    }
}

// 转移==> core/cookie.js
function get_cookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length,c.length).replace(/\"/g,'');
        }
    }
    return null;
}

Douban.init_hideme = function(o){
    $(o).click(function(){
        $(this).parent().parent().parent().hide();
    });
}

Douban.init_more = function(o){
    $(o).click(function(){
        lastObj = $(this).prev().find("input");
        ids = /(.*_)(\d+)$/.exec(lastObj.attr("id"));
        id = ids[1] + (parseInt(ids[2]) + 1);
        a = lastObj.clone();
        a.attr("value","");
        $(this).before('<br/>').before(a);
        a.attr('id',id).attr('name',id).wrap('<span></span>');
    })
}

Douban.init_more2 = function(o){
    $(o).click(function(){
        lastObj = $(this).prev().find("input");
        ids = /(.*_)(\d+)_(\d+)$/.exec( lastObj.attr("id"));
        last_id = parseInt(ids[3])
        nid = last_id + 1;
        id = ids[1] + parseInt(ids[2]) +"_" + nid;
        a = lastObj.clone();
        a.attr("value","");
        $(this).before('<br/><span class="pl idx">'+(nid+1)+'</span>').before(a);
        a.attr('id',id).attr('name',id).removeClass("m").wrap('<span></span>');
        init_keyup();
        list_data[id]= "无";
    })
}

Douban.init_search_text = function(o){
    if(!o.value || o.value == o.title){
        $(o).addClass("greyinput");
        o.value = o.title;
    }
    $(o).focus(function(){
        $(o).removeClass("greyinput");
        if(o.value == o.title) o.value = "";
    });
    $(o).blur(function(){
        if(!o.value){
            $(o).addClass("greyinput");
            o.value = o.title;
        }
    });
}

Douban.init_checkreg = function(o){
    $(o).find('.butt').click(function(){
        var check = true;
        $(o).find('input').each(function(){
            if(this.type!='submit' && this.type!='button'){
                if(this.value == ''){
                    $(this).next().css('display','inline');
                    check = false;
                }else{
                    $(this).next().css('display','none');
                }
            }
        });
        return check;
    });
}

Douban.init_click_tip = function(o){
    var tip = $(o).parent().find('.blocktip');
    $(o).click(function(){
        tip.show().blur_hide();
        m = tip.width() + tip.pos().x - $.viewport_size()[0] > 0?
            -tip.width() : 0;
        tip.css('margin-left', m);
    })
    $('.hideme',tip).click(function(){ tip.hide(); })
}

function clean_tip(){
    var txt = $('#page_focus')[0];
    return txt && txt.value != txt.title
}

Douban.init_submit_link = function(o){
    $(o).click(function(){
        $(o).parent().submit();
    });
}

var nowmenu = null;
var hidemenu = function(a){
    a.find('.down').css('display','inline');
    a.find('.up').hide();
    a.next().hide();
    nowmenu = null;
    $('body').unbind('mousedown');
}

var openmenu = function(a){
    if(nowmenu != null){
        hidemenu(nowmenu);
    }
    a.find('.up').css('display','inline');
    a.find('.down').hide();
    a.next().show();
    nowmenu = a;
    $('body').mousedown(function(){
        if(a.parent().attr('rel') != 'on'){
            hidemenu(a);
        }
    });
}

$(function(){
    $("a","#dsearch").each(function(){
        $(this).click(function(){
            if(!clean_tip()) return true;
            urls = $(this).attr("href").split("?cat=");
            $("#ssform").attr("action", urls[0]);
            if(urls[1] != undefined){
                $('<input type="hidden" name="cat" value="' + urls[1] + '" />').appendTo($("#ssform"));
            }
            $("#ssform").submit();
            return false;
        });
    });
    $('.arrow').click(function(){
        if($(this).find('.up').is(':hidden')){
            openmenu($(this));
        }else{
            hidemenu($(this));
        }
        this.blur();
    });

    $('.arrow').parent().hover(function(){
        $(this).attr('rel','on');
    },function(){
        $(this).attr('rel','off');
    })
    if($.suggest) $('#page_focus').suggest('/j/subject_suggest',{onSelect : function(){
        $(this).parents('form')
        .append('<span><input name="add" value="1" type="hidden"/></span>')
        .submit();
    }})

    var rcoo = get_cookie('report');
    if (rcoo){
        set_cookie({report:''},0);
        $.get('/stat.html?'+rcoo)
    }
    $(':submit').each(function(){
        if ($(this).val() == '加上去'){
            $(this).click(function(){var self = this; setTimeout(function(){self.disabled = 1;},0)})
        }
    });


    if ($.browser.msie && $.browser.version == '6.0'){
        $('form.miniform > :submit').hover(
            function(){$(this).addClass('hover')},
            function(){$(this).removeClass('hover')}
        )
    }
})

/* BEGIN @import /js/core/old_show_dialog.js */
this.show_dialog = function(div, w) {
    if($('#dialog').length) return;
    $('body').prepend('<div id="overlay"></div><div id="dialog" style="width:' + (w || 550) + 'px;"></div>');
    if(div != null){
        $('#dialog').html(div);
    }else{
        $('#dialog').html("<div class='loadpop'>正在载入，请稍候...</div>");
    }
    set_overlay();
}

this.set_overlay = function(){
    var oheight = ($.browser.msie?-2:16),
        dialog=$('#dialog')[0],
        w=dialog.offsetWidth,
        left=(document.body.offsetWidth-w)/2;

    $('#overlay').css({height:dialog.offsetHeight+oheight,width:w+16,left:left + 5 + 'px'});
    dialog.style.left=left+'px';
}

this.close_dialog = function() {
    $('#overlay').unbind('click');
    $('#dialog,#overlay,.bgi').remove();
    if (typeof document.body.style.maxHeight == "undefined") {//if IE6
        $('body','html').css({height: 'auto', width: 'auto'});
        $('html').css('overflow', '');
    }
    document.onkeydown = '';
    return false;
}
/* END @import /js/core/old_show_dialog.js */

var refine_dialog = function(){
    if (!$('#dialog').length) return;
    var agent = navigator.userAgent.toLowerCase();
    var top = 0.5 * ($.viewport_size()[1] - $('#dialog')[0].offsetHeight) + 140;
    $('#dialog,#overlay').css('top', top);
    set_overlay();
}

Douban.init_show_full = function(o){
    $(o).click(function(){
        $(o).parents('.short').hide();
        $(o).parents('.short').next().show();
    })
}

Douban.init_show_full2 = function(o){
    $(o).click(function(){
        $(o).parents('.short').hide();
        $(o).parents('.short').next().show();
        $(o).parents('.reading-note').nextAll('.col-rec-con').show();
        $(o).parents('.reading-note').next().children('.no-comments').show();
    })
}

Douban.init_show_short = function(o){
    $(o).click(function(){
        $(o).parents('.all').hide();
        $(o).parents('.all').prev().show();
    })
}

Douban.init_show_short2 = function(o){
    $(o).click(function(){
        $(o).parents('.all').hide();
        $(o).parents('.all').prev().show();
        $(o).parents('.reading-note').nextAll('.col-rec-con').hide();
        $(o).parents('.reading-note').next().children('.no-comments').hide();
    })
}

Douban.init_show_more = function(o){
    $(o).click(function(){
        $(o).parent().prevAll('.more').show();
        $(o).parent().remove();
    })
}

Douban.init_collect_btn = function(o) {
    $(o).click(function(e){
        e.preventDefault()
        if($('#hiddendialog').length){
            show_dialog($('#hiddendialog').html());
            load_event_monitor($('#dialog'));
            return
        }
        show_dialog(null);
        var _ = $(this).attr('name').split('-'),
        btn_type = _[0], sid = _[1],
        interest = _[2], rating = _[3],
        url = '/j/subject/'+sid+'/interest?'+
            (interest ? 'interest='+interest : '')+
            (rating ? '&rating='+rating : '')+
            (btn_type == 'cbtn' ? '&cmt=1':'');
        $.getJSON(url, function(r) {
            if (!$('#dialog').length) {
              return
            }
            var html = $('<div></div>')
            html.get(0).innerHTML = r.html;
            var tags = r.tags;
            var content = tags.join(' ');
            $('input[name=tags]', html).val((content.length > 1)? content + ' ' : content)
            var hash = {};
            $.each(tags, function(i,tag){hash[tag.toLowerCase()]=true;});
            populate_tag_btns('我的标签:', $('#mytags', html), r['my_tags'], hash);
            populate_tag_btns("常用标签:", $('#populartags', html), r['popular_tags'], hash);
            if (btn_type == 'pbtn' || btn_type == 'cbtn')
                $('form', html).data('reload', 1);
            $('#dialog').html(html);
            $('#showtags').click(function(){
                if($('#advtags').is(':hidden')){
                    $(this).html('缩起 ▲');
                    $('#advtags').show();
                    $('#foldcollect').val('U');
                }else{
                    $(this).html($(this).attr('rel'));
                    $('#advtags').hide();
                    $('#foldcollect').val('F');
                }
                $(this).blur();
                refine_dialog();
            });
            var oprd=$("input[name=interest]", html),rate=$(".rate_stars"),
            f = function(){
                if (oprd[0].checked) {rate.hide()} else {rate.show()}
                refine_dialog();
            };
            oprd.click(f);
            f();
            if($('#left_n').length){
                var lstr = $('#left_n').text();
                llen = (lstr.match(/\d+/i)==lstr)?lstr:140;
                $('#comment').display_limit(llen, $('#left_n'));
            }
            if(btn_type == 'cbtn'){
                var h2 = $('h2','#dialog');
                h2.text(h2.text().replace('修改','写短评'));
                if (!oprd[0].checked && oprd[1]) oprd[1].checked = true;
                $('form', '#dialog').data('comment',1);
            }
            load_event_monitor(html);

            // 豆瓣电影短评使用不同的短评字符计算方法 Miko
            // 英文和半角字符按半个字来计算
            $.fn.movieDisplayLimit = function(textarea, ele, limit){
                function _setCharactorLeft(objTextarea, objCharactor, numLimit){
                    objCharactor.text(numLimit - Math.ceil(objTextarea.val().replace(/[^\x00-\xff]/g, "**").length/2));
                }
                // 因为半角和英文字符按半个字来计算
                // 但是 maxlength 属性是不区分全、半角的长度限制
                // 所以，需要按照半角、英文字符的长度来适当增加 maxlength
                function _setTextareaMaxLength(objTextarea){
                    var fullWidthCharactor = objTextarea.val().match(/[^\x00-\xff]/ig),
                        fullWidthCharactorLength = !fullWidthCharactor? 0: fullWidthCharactor.length,
                        halfWidthCharactorLength = objTextarea.val().length - fullWidthCharactorLength;

                    textarea.attr('maxlength', 140 + Math.ceil(halfWidthCharactorLength/2));

                }
                // 初始化先把之前按照其他字符计算方法的剩余字符数做调整
                _setCharactorLeft(textarea, ele, limit);

                $(this).keyup(function(){
                    _setCharactorLeft($(this), ele, limit);
                    _setTextareaMaxLength($(this));
                    return false;
                });
            };
            // 以 dialog 下的 form 是否有 .movie-sns 作为区分标记
            if($('div#dialog form.movie-sns').length){
                $('textarea#comment').unbind().movieDisplayLimit($('textarea#comment'), $('span#left_n'), 140);
            }
        });
        return false;
    });
}

Douban.init_nine_collect_btn = function(o) {
    $(o).click(function(){
        var _ = $(this).attr('name').split('-');
        var btn_type = _[0], sid = _[1], interest = _[2];
        var url = '/j/subject/'+sid+'/interest';
        $.getJSON(url, interest && {interest: interest}, function(r) {
            var html = $('<div></div>').html(r.html);
            var tags = r.tags;
            var content = tags.join(' ');
            $('input[name=tags]', html).val((content.length > 1)? content + ' ' : content);
            var hash = {};
            $.each(tags, function(i,tag){hash[tag.toLowerCase()]=true;});
            populate_tag_btns('我的标签(点击添加):', $('#mytags', html), r.my_tags, hash);
            populate_tag_btns("豆瓣成员常用的标签(点击添加):", $('#populartags', html), r.popular_tags, hash);
            if (btn_type == 'pbtn')
                $('form', html).data('reload',1);
            $("#collect_form_"+sid).html("").append('<p class="ul"></p>').append(html);
            load_event_monitor($("#collect_form_"+sid));
        });
        return false;
    });
}

Douban.init_rec_btn= function(o) {
    var _ = $(o).attr('name').split('-'), url = '/j/recommend',
    rdialog = 'rdialog-' + _[1] + '-' + _[2],
    f = function(){
        var uid = ((_[1] == 'I')&&(_[2]==undefined)) ? $('input',$(o).parent())[0].value : _[2],
        rec = (_[3]==undefined) ? '':_[3],
        fcs = function(type){
            if(type == 'I'){
                var s = $('.text','#dialog');
                if(s.length){
                    if(s[0].value.length){s[1].focus();}
                    else{s[0].focus();}
                }
            }else{
                $('#dialog').find(':submit').focus();
            }
            if ($(o).hasClass('novote')){ //it's a new test version of rec btn
                $('form','#dialog').append('<input name="novote" value="1" type="hidden"/>');
            }
        }
        if($('#' + rdialog).length){
            show_dialog($('#' + rdialog).html());
            load_event_monitor('#dialog');
            fcs(_[1]);
        }else{
            $.getJSON(url, {type:_[1], uid:uid, rec:rec}, function(r){
                show_dialog(r.html);
                if(_[1]!='I'){
                    var rechtml = $('<div id="'+rdialog+'"></div>');
                    rechtml.html(r.html).appendTo('body').hide();
                }
                load_event_monitor('#dialog');
                fcs(_[1]);
            });
        }
        return false;
    }
    $(o).click(f);
    if(_[1] == 'I'){
        $(o).parent().parent().submit(f);
    }
}

Douban.init_rec_form = function(form) {
    var frm = $(form);
    frm.submit(function(e){
        $(':submit,:input',this).attr('disabled',true);
        $("#ban_word").remove()
        remote_submit_json(this, function(data){
            trace(data);
            if(data.ban){
                $(':submit,:input',form).attr('disabled',false);
$(".recsubmit").before('<div class="attn" style="text-align:center" id="ban_word">你的推荐中有被禁止的内容</div >')
                return
            }
            $('#dialog').html('<div class="loadpop m">推荐已提交</div>');
            set_overlay();
            $('#rec_url_text').attr('value','http://');
                setTimeout(function(){
                $('#dialog, #overlay').fadeOut(close_dialog);
                if($('input[name=type]',form).val() == "I"){
                    document.location.reload();
                }
            },400);
        });
        return false;
    });
    frm.find('.reccomment label').click(function(e){
      $(this).next().focus();
    });
    frm.find('.reccomment .text').focus(function(e){
      $(this).prev().hide();
    }).blur(function(e){
      var el = $(this);
      if ($.trim(el.val()) === '') {
        $(this).prev().show();
      }
    });
    frm.set_len_limit(140);
}

Douban.init_saying_reply = function(o){
    var _ = o.name.split('-');
    var url = '/j/saying_comment';
    if(!o.rev){
        $(o).attr('rev', 'unfold');
    }
    $(o).click(function(){
        if(o.rev != 'unfold'){
            $(o).parent().parent().next().remove();
            $(o).html($(o).attr('rev'));
            o.rev = 'unfold';
        }else if(o.rel!="polling"){
            o.rel="polling"
            $.getJSON(url, {sid: _[2], type: _[3], n:_[4], ni:_[5]}, function(r){
                $('<div class="recreplylst"></div>').insertAfter($(o).parent().parent()).html(r.html);
                load_event_monitor($(o).parent().parent().next());
                $(o).attr('rev', $(o).html()).text('隐藏回应');
                o.rel=""
            })
        }
        return false;
    })
}



Douban.init_rec_reply = function(o){
    var _ = o.name.split('-');
    var url = '/j/rec_comment';
    if(!o.rev){
        $(o).attr('rev', 'unfold');
    }
    $(o).click(function(){
        if(o.rev != 'unfold'){
            $(o).parent().parent().next().remove();
            $(o).html($(o).attr('rev'));
            o.rev = 'unfold';
        }else if(o.rel!="polling"){
            o.rel="polling"
            $.getJSON(url, {rid: _[2], type: _[3], n:_[4], ni:_[5]}, function(r){
                $('<div class="recreplylst"></div>').insertAfter($(o).parent().parent()).html(r.html);
                load_event_monitor($(o).parent().parent().next());
                $(o).attr('rev', $(o).html()).text('隐藏回应');
                o.rel=""
            })
        }
        return false;
    })
}


Douban.init_reply_form = function(form){
    $(form).attr('action', $(form).attr('rev'));
    var n = $(form).attr('name');
    $(form).submit(function(){
        remote_submit_json(this, function(r){
            var replst = $(form).parent();
            $(replst).html(r.html);
            load_event_monitor(replst);
        if (n=='n'){
        var a = $('<span><a href="javascript:void(0)">添加回应</a></span>');
        }
        else
        {
            var a = $('<span style="margin-left:53px"><a href="javascript:void(0)">添加回应</a></span>');
        }
            $('form', replst).hide().after(a);
            a.click(function(){
                $(this).prev().show();
                $(this).remove();
            })
        });
        $(':submit',form).attr('disabled', 1);
        return false;
    })
    $(form).set_len_limit(140);
}

Douban.init_video_comment = function(form){
    $(form).submit(function(){
        remote_submit_json(this, function(r){
            var insert_point = $('#comments');
            $(insert_point).html(r.html);
            load_event_monitor(insert_point);
            $(':submit', form).attr('disabled', 0);
            $('textarea', form).attr('disabled', 0);
            $('textarea', form).attr('value', '');
        }, true, '/j/video/add_comment');
        return false;
    })
}

Douban.init_video_del_comment = function(o){
    var _ = $(o).attr('name').split('-');
    $(o).click(function(){
        var text = o.title;
        if(confirm("真的要"+text+"?") == true){
                $.postJSON_withck("/j/video/del_comment", {comment_id: _[1], video_id: _[2]}, function(r){
                    var insert_point = $('#c-'+_[1]);
                    $(insert_point).html("");
                });
            }
        return false;
    })
}

Douban.init_noti_form = function(form){
    $(":submit",form).click(function(){
        $(this).addClass('selected');
    });
    $(form).attr('action','/j/request/');
    $(form).submit(function(){
        form.confirm.disabled = true;
        form.ignore.disabled = true;
        remote_submit_json(this, function(r){
            $(form).parent().html(r.html);
        });
        return false;
    });
}

Douban.init_editable = function(o){
    var disp = $('#display',o), form = $('form',o)[0], a = $('a','#edi');
    var show = function(t){
        if(t != undefined){
            disp.text(t);
            if (disp.text() == ''){
                a.text('点击添加描述').addClass('sign-text');
            }else{
                a.text('修改').removeClass('sign-text');
            }
        }
        disp.show();
        $(form).hide();
        $('#edi').show();
    }
    show(disp.text());
    if(form.name) $(form).set_len_limit(form.name);
    $(form).submit(function(){
        remote_submit_json(form, function(r){
            show(r.desc);
        })
        $('textarea',form)[0].value="正在保存...";
        return false;
    })
    $('.cancel',form).click(function(){show()});
    $('#edi',o).click(function(){
        $('#display,#edi').hide();
        $('input,textarea','form').attr('disabled',0);
        $('textarea',o)[0].value = disp.text();
        $(form).show();
        $('textarea',o).focus();
        return false;
    })
}

Douban.init_show_video = function(o){
    $(o).css('position', 'relative').attr('target', '');
    $('.vthumbwrap', o).append('<div class="video_overlay"></div>');

    var f = $('img', o).attr('name');

    $(o).click(function (e) {
        e.preventDefault();
        var bnClose = $('<a href="#">缩进</a>');

        bnClose.click(function (e) {
            e.preventDefault();
            $(o).show();
            $(this).prev().remove();
            $(this).remove();
        })

        $(o).after(bnClose).after('<em>' + f + '</em>');
        $(o).hide();
    })
}

Douban.init_morerec = function(o){
    $(o).click(function(){
        var n = $(o).parent().next();
        if(n.is(':hidden')){ n.show()} else {n.next().show()}
        $(o).remove();
    })
}

Douban.init_search_result = function(o){
    $('#sinput').suggest('/j/subject_suggest',{resultsClass : 'rc_results', onSelect:function(){
        $(o).parent().submit();
    }});
    $(o).parent().submit(function(){
        var txt = $('#sinput')[0];
        return txt && txt.value != txt.title
    })
    Douban.init_search_text(o);
}

Douban.init_prompt_link = function(o){
    $(o).click(function(){
        var val = prompt(o.title || '请输入');
        if(val){
            location.href = o.href
            + (o.href.indexOf('?') == -1? '?':'&')
            + o.name + '=' + encodeURIComponent(val);
        }
        return false;
    })
}

Douban.init_discard_notify = function(o){
    $(o).click(function () {
        var url = '/j/notification/discard';
        var n_id = o.name;
        if (confirm("不再提醒该内容的新回复?")) {
            $.post_withck(url, {'id': n_id}, function(ret){
                var r = eval("("+ret+")");
                if(r.r === 'Y') {
                    $('#n-' + n_id).remove();
                }
            });
        }
        return false;
    });
}

$.viewport_size = function(){
    var size = [0, 0];
    if (typeof window.innerWidth != 'undefined'){
        size = [window.innerWidth, window.innerHeight];
    }else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0){
        size = [document.documentElement.clientWidth, document.documentElement.clientHeight];
    }else{
        size = [document.body.clientWidth, document.body.clientHeight];
    }
    return size;
}

//转移==> core/post_withck.js
$.ajax_withck = function(options){
    if(options.type=="POST")
        options.data=$.extend(options.data||{},{ck:get_cookie('ck')});
    return $.ajax(options)
}


//转移==> core/post_withck.js
$.postJSON_withck = function(url, data, callback){
    $.post_withck(url, data, callback, "json");
}

//转移==> core/post_withck.js
$.post_withck = function( url, data, callback, type, traditional) {
    if ($.isFunction(data)) {
        type = callback;
        callback = data;
        data = {};
    }
    return $.ajax({
        type: "POST",
        traditional: typeof traditional == 'undefined' ? true : traditional,
        url: url,
        data: $.extend(data,{ck:get_cookie('ck')}),
        success: callback,
        dataType: type || 'text'
    });
};

//转移==> core/tmpl.js
(function(){
    var cache = {};
    $.tmpl = function(str, data){
        var fn = cache[str] = cache[str] ||
        new Function("obj", "var p=[];with(obj){p.push('" +
         str.replace(/[\r\t\n]/g, " ")
         .replace(/'(?=[^%]*%})/g,"\t")
         .split("'").join("\\'")
         .split("\t").join("'")
         .replace(/{%=(.+?)%}/g, "',$1,'")
         .split("{%").join("');")
         .split("%}").join("p.push('")
         + "');}return p.join('');");
        return fn(data);
    }
})();

String.prototype.escapeHTML = function () {
    return this.replace(/&/g,'&amp;')
               .replace(/>/g,'&gt;')
               .replace(/</g,'&lt;')
               .replace(/'/g,'&#39;')
               .replace(/"/g,'&quot;');
}

jQuery.fn.extend({
    pos:function() {
        var o = this[0];
        if(o.offsetParent) {
            for(var posX=0, posY=0; o.offsetParent; o=o.offsetParent){
                posX += o.offsetLeft;
                posY += o.offsetTop;
            }
            return {x:posX, y:posY};
        } else return {x:o.x, y:o.y};
    },

    chop: function(callback, inv ) {
        var ret = [], nret = [];
        for ( var i = 0, length = this.length; i < length; i++ )
            if ( !inv != !callback( this[i], i )){
                ret.push( this[i] );
            } else {
                nret.push( this[i] );
            }
        return [ret, nret];
    },
    sum: function(name, sp){
        var len = this.length, s = zero = sp ? '' : 0;
        while(len) s += this[--len][name] + (len && sp || zero);
        return s
    },
    set_len_limit : function(limit){
        var s = this.find(':submit:first');
        var oldv = s.attr('value');
        var check = function(){
            if(this.value && this.value.length > limit){
                s.attr('disabled',1).attr('value','字数不能超过'+limit+'字');
            } else {
                s.attr('disabled',0).attr('value', oldv);
            }
        }
        $('textarea', this).focus(check).blur(check).keydown(check).keyup(check);
    },

    display_limit : function(limit, n){
        var self = this, oldv,
        f = function(e){
            var v = self.val();
            if (v == oldv) return;
            if (v.length>=limit){
                self.val(v.substring(0, limit));
            }
            n.text(limit - self.val().length);
            oldv = self.val();
        };
        this.keyup(f);
        f();
    },

    set_caret: function(){
        if(!$.browser.msie) return;
        var initSetCaret = function(){this.p = document.selection.createRange().duplicate()};
        this.click(initSetCaret).select(initSetCaret).keyup(initSetCaret);
    },

    insert_caret:function(t){
        var o = this[0];
        if(document.all && o.createTextRange && o.p){
            var p=o.p;
            p.text = p.text.charAt(p.text.length-1) == '' ? t+'' : t;
        } else if(o.setSelectionRange){
            var s=o.selectionStart;
            var e=o.selectionEnd;
            var t1=o.value.substring(0,s);
            var t2=o.value.substring(e);
            o.value=t1+t+t2;
            o.focus();
            var len=t.length;
            o.setSelectionRange(s+len,s+len);
            o.blur();
        } else {
            o.value+=t;
        }
    },

    get_sel:function(){
        var o = this[0];
        return document.all && o.createTextRange && o.p ?
            o.p.text : o.setSelectionRange ?
            o.value.substring(o.selectionStart,o.selectionEnd) : '';
    },
    blur_hide:function(){
        var s=this,h=function(){return false};
        s.mousedown(h)
        $(document.body).mousedown(function(){
            s.hide().unbind('mousedown',h)
            $(document.body).unbind('mousedown',arguments.callee);
        })
        return this;
    },
    yellow_fade:function() {
        var m = 0,setp=1,self=this;
        function _yellow_fade(){
            self.css({backgroundColor:"rgb(100%,100%,"+m+"%)"})
            m += setp;setp+=.5;
            if(m <= 100){
                setTimeout(_yellow_fade,35)
            }else{
                self.css({backgroundColor:""})
            }
        };
        _yellow_fade();
        return this;
    },
    hover_fold:function(type){
        var i = {folder:[1,3], unfolder:[0,2]}, s = function(o,n){
            return function(){$('img',o).attr("src","/pics/arrow1_"+n+".png");}
        }
        return this.hover(s(this,i[type][0]),s(this,i[type][1]));
    },
    multiselect:function(opt){
        var nfunc = function(){return true},
        onselect = opt.onselect || nfunc,
        onremove = opt.onremove || nfunc,
        onchange = opt.onchange || nfunc,
        sel = opt.selclass || 'sel',
        values = opt.values || [];
        return this.click(function(){
            var id = /id(\d*)/.exec(this.className)[1],
            i = $.inArray(id, values);
            if(i != -1){
                if (!onremove(this)) return;
                values.splice(i,1);
                $(this).removeClass(sel);
            }else{
                if (!onselect(this)) return;
                values.push(id);
                $(this).addClass(sel);
            }
            onchange(values);
            return false;
        })
    },
    initDataInput: function () {
        var self = $(this);
        if (!self.val() || self.val() === self.attr('title')) {
            self.addClass('color-lightgray');
            self.val(self.attr('title'));
        }
        self.focus(function () {
            self.removeClass('color-lightgray');
            if (self.val() === self.attr('title')) {
                self.val('');
            }
        }).blur(function () {
            if (!self.val()) {
                self.addClass('color-lightgray');
                self.val(self.attr('title'));
            }
        });
    },
    setItemList: function (options) {
        var o = {},
            targetInfo = '',
            TEMPL_LOADER = '<img class="gray-loader" src="/pics/spinner.gif" />',
            IMG_SPINNER = '/pics/spinner.gif',
            CSS_INPUT_CREATE = '.input-create',
            customObjMap = {
                keyup: function (e) {
                    var newItemName = e.target.value.replace(/ /g,'');
                    // enter key
                    if (e.keyCode === 13) {
                        options.create.callback(o, targetInfo, newItemName, options.limit);
                    }
                }
            },
            _body = document.body,
            _preLoader = new Image(),
            _defaults = {
                create: {
                    title: '新分组',
                    tips: '创建新分组'
                }
            },
            options = $.extend(_defaults, options),
            TEMPL_LINK_CREATE = '<span class="create-new">' + options.create.title+ '</span>',
            TEMPL_INPUT_CREATE = '<input class="input-create" type="text" value="" title="' + options.create.tips + '" maxlength="' + options.create.maxLen + '" />';

        _preLoader.src = IMG_SPINNER;

        // bind show group list event
        $(this).click(function (e) {
            e.stopPropagation();
            o = this;
            sglist.hide();
            targetInfo = $.isFunction(options.target) ? options.target(o) : options.target;
            sgarrow.removeClass(CSS_ARROW_SELECT);
            $(o).addClass(CSS_ARROW_SELECT);
            $(CSS_SET_GROUP_LIST, this).show();
            $(CSS_INPUT_CREATE).focus();
            if ($.browser.msie && $.browser.version !== '8.0') {
                sgarrow.css('z-index', '');
                $(this).css('z-index', 10);
            }
        });

        // bind change group event
        $(CSS_SET_GROUP_LIST).delegate("li:not('.last')", 'click', function (e) {
            e.preventDefault();
            var target = e.target,
                self = this,
                isCb = target.type === 'checkbox' ? true : false,
                cb = $(this).children('input'),
                tagId = $(this).children('input').val(),
                postPara = (isCb && cb.attr('checked') || !isCb && !cb.attr('checked')) ? 'addtotag' : 'removefromtag';

            if (!$(CSS_LOADER, this).length) {
                cb.hide().after(TEMPL_LOADER);
            }
            options.callback(self, postPara, isCb, targetInfo, tagId);
        });

        $(_body).click(function (e) {
            $(CSS_SET_GROUP_LIST, this).hide();
            $(o).removeClass(CSS_ARROW_SELECT);
            if (newGroupNum && newGroupNum < options.limit) {
                $(CSS_INPUT_CREATE).replaceWith(TEMPL_LINK_CREATE);
            }
        });

        // for contacts group form
        $(CSS_SET_GROUP_LIST).delegate('.create-new', 'click', function () {
            $(this).replaceWith(TEMPL_INPUT_CREATE);
            $(CSS_INPUT_CREATE).focus();
        });

        // multiple events delegte support
        $(CSS_SET_GROUP_LIST).delegate(CSS_INPUT_CREATE, 'keyup', function (e) {
            if ($.isFunction(customObjMap[e.type])) {
                customObjMap[e.type].call(this, e);
            }
        });
    }
});

var check_form = function(form){
    var _re = true;
    $(':input',form).each(function(){
        if((/notnull/.test(this.className) && this.value == '')
            || (/most/.test(this.className) && this.value && this.value.length>/most(\d*)/.exec(this.className)[1]))
        {
            $(this).next().show();
            _re = false;
        }else{
            if(/attn/.test($(this).next().attr('className'))) $(this).next().hide();
        }
    })
    return _re;
}

var paras = function(s){
    var o = {};
    if(s.indexOf('?') == -1) return {};
    var vs = s.split('?')[1].split('&');
    for(var i=0;i<vs.length;i++){
        if(vs[i].indexOf('=') != -1){
            var k = vs[i].split('=');
            o[k[0]+''] = k[1] + '';
        }
    }
    return o;
}

function delete_reply_notify(id){
    if(!delete_reply_notify.id){
        delete_reply_notify.id=id;
        show_dialog($("#confirm_delete").html(), 280);
        $('#overlay').css('z-index',100); //workaround for ff2 bug
        $('#dialog .submit').eq(0).focus(); //auto focus on button[0]
    }
    return false;
};

function close_delete(is_delete){
    if(is_delete){
        var id=delete_reply_notify.id;
        $.get("/j/accounts/remove_notify?id="+id)
        $("#reply_notify_"+id).fadeOut();
    }
    delete_reply_notify.id=null;
    close_dialog()
}

function moreurl(self, dict){
    var more = ['ref='+encodeURIComponent(location.pathname)];
    for (var i in dict) more.push(i + '=' + dict[i]);
    set_cookie({report:more.join('&')}, 0.0001)
}

function tip_win(e){
    $(e).next(".blocktip").show().blur_hide();
}

tip_win.hide=function(e){
    $(e).parents(".blocktip").hide()
}

function js_parser(htm){
    var tag="script>",begin="<"+tag,end="</"+tag,pos=pos_pre=0,result=script="";
    while(
        (pos=htm.indexOf(begin,pos))+1
    ){
        result+=htm.substring(pos_pre,pos);
        pos+=8;
        pos_pre=htm.indexOf(end,pos);
        if(pos_pre<0){
            break;
        }
        script+=htm.substring(pos,pos_pre)+";";
        pos_pre+=9;
    }
    result+=htm.substring(pos_pre,htm.length);

    return {
        htm:result,
        js:function(){eval(script)}
    };
}


function center(elem){
    return {
        left:(document.documentElement.offsetWidth-elem.offsetWidth)/2+'px',
        top:(document.documentElement.clientHeight-elem.offsetHeight)*.45+'px'
    }
}

function pop_win (htm, hide_close) {
    if (!window.__pop_win) {
        var pop_win_bg = document.createElement('div');
        pop_win_bg.className = 'pop_win_bg';
        document.body.appendChild(pop_win_bg);

        var pop_win_body = document.createElement('div');
        pop_win_body.className = 'pop_win';
        document.body.appendChild(pop_win_body);

        __pop_win = {
            bg: pop_win_bg,
            body: pop_win_body,
            body_j: $(pop_win_body),
            bg_j: $(pop_win_bg)
        };
    }
    var b = __pop_win.body,
        body_j = __pop_win.body_j,
        dom = js_parser(htm);

    if (hide_close !== true) {
        dom.htm = '<a onclick="pop_win.close()" href="javascript:;" class="pop_win_close">X</a>' + dom.htm;
    }
    b.innerHTML = dom.htm;
    var cr = {
        left:(document.documentElement.offsetWidth-b.offsetWidth)/2+'px',
        top:(document.documentElement.clientHeight-b.offsetHeight)*.45+'px'
    };
    if(document.documentElement.clientHeight<b.offsetHeight){
        cr.top = '0';
        cr.height = document.documentElement.clientHeight - 40 + 'px';
        cr.overflow = 'auto';
    }
    body_j.css({ display: 'block' }).css(cr).css({ visibility: 'visible', zIndex: 9999});
    dom.js();
    pop_win.fit();
    if(!window.XMLHttpRequest){
        __pop_win.bg.style.top = '';
    }
}

pop_win.fit = function () {
    if (window.__pop_win) {
        var b=__pop_win.body;
        __pop_win.bg_j.css({
            height: b.offsetHeight + 16 + 'px',
            width: b.offsetWidth + 16 + 'px',
            left: b.offsetLeft - 8 + 'px',
            top: b.offsetTop - 8 + 'px',
            zIndex: 8888
        }).show();
    }
}

pop_win.close=function(){
    $(__pop_win.bg).remove()
    $(__pop_win.body).remove();
    window.__pop_win = null;
}

pop_win.load=function(url,cache){
    pop_win("<div style=\"padding:20px 60px;\">加载中, 请稍等...</div>")
    $.ajax({url: url, success: pop_win, cache: cache||false, dataType: 'html'});
    return false
}

function event_init_tab() {
    $('#tongcheng_tab').click(function() {
        if($('#tongcheng_tab_block').is(':hidden')) {
            show_tongcheng_tab();
            $(document.body).click(function() {
                hide_tongcheng_tab();
                $(document.body).unbind("click",arguments.callee);
            });
        } else {
            hide_tongcheng_tab();
        }
        return false
    })
}

function show_tongcheng_tab() {
    $('#tongcheng_tab_block').show();
    $('#tongcheng_tab span').addClass('up')
}

function hide_tongcheng_tab() {
    $('#tongcheng_tab_block').hide();
    $('#tongcheng_tab span').removeClass('up')
}

__load_bk=$.fn.load;
$.fn.load_withck = function( url, data, callback ) {
    if ($.isFunction(data)) {
        callback = data;
        data = {};
    }
    return __load_bk.call(this,url,$.extend(data,{ck:get_cookie('ck')}),callback);
}
function exp_dialog(e){
var d=document.documentElement;
return 0 - parseInt(e.offsetHeight / 2) + (TBWindowMargin = d && d.scrollTop || document.body.scrollTop) + 'px';
}
function exp_overlay(e){
return 0 - parseInt(e.offsetHeight / 2) + (TBWindowMargin = document.documentElement && document.documentElement.scrollTop || document.body.scrollTop) + 'px'
}
function exp_sort_h2_over(){this.style.backgroundColor="#eeffee"}
function exp_sort_h2_out(){this.style.backgroundColor=""}

function getslider(nbtn,pbtn,mover,url,pp_id,cat_id){
    var now = 5, max_num = 100, fetch_num = 5, off_set=0,
    slide = function(n){
        if (now+n>max_num){
            now = max_num;
            nbtn[0].className = 'dis';
        }else if (now+n<5){
            now = 5;
            pbtn[0].className = 'dis';
        }else{
            now += n;
        }
        pbtn[0].className = now == 5 ?'dis':'';
        nbtn[0].className = now == max_num ?'dis':'';
        off_set = (5-now) * 105;
        mover.animate({ "marginLeft":off_set+"px" }, {duration: 60*Math.abs(n)});
    }
    return function(n){
        if(now + n > fetch_num && fetch_num < max_num){
            $.postJSON_withck(url, {"start":fetch_num,"pp":pp_id,"cat_id":cat_id}, function(ret){
                if(ret.err){
                    max_num = ret.total;
                    fetch_num += ret.num;
                    n = ret.num;
                    mover.html(mover.html()+ret.more_html);
                    slide(n);
                }
            });
        }else{
            slide(n);
        }
    }
}


Douban.init_song_interest = function(o) {
    var el = $(o),
        sid = el.attr("id").split("-")[1],
        UNLIKE = 'n',
        LIKE = 'y';
    el.click(function() {
        var url = "/j/song/" + sid + "/interest",
            alreadyInterested = el.hasClass('interest');
        $.post_withck(url, {'action':(alreadyInterested? UNLIKE : LIKE)},function(ret) {
            el.toggleClass('interest');
            if(alreadyInterested) {
                el.children().attr({src:"/pics/gray-heart.gif",title:"我喜欢", alt:"我喜欢"});
            } else {
                el.children().attr({src: "/pics/red-heart.gif",title:"取消'我喜欢'", alt:"取消'我喜欢'"});
            }
        });
        return false;
    });
}

Douban.init_vote_comment = function(o){
    if (window.location.hostname === 'movie.douban.com' || /^movie\..*\.douban\.com/.test(window.location.hostname)) {
        var v = $(o).prev().prev(),id = $(o).prev().val();
        $(o).click(function() {
            $.postJSON_withck('/j/comment/vote',{id:id},function(r){
                if(r.count){v.text(r.count)}else{
                    alert('这条短评你已经投过票了');
                }
            })
        })
    }

}

Douban.init_rev_text = function(o){
    if (window.location.hostname === 'movie.douban.com' || /^movie\..*\.douban\.com/.test(window.location.hostname)) {
        var form = $(o).parents('form'),
        btn = $('input[name=rev_submit]');
        btn.click(function(){
            if ($(o).val().length<50){
                var sid = /subject\/(\d*)/.exec(location.href)[1];
                $.getJSON('/j/comment/check',{sid:sid},function(r){
                    if (r.has) {
                        if(confirm('少于50字的评论将被自动转为简短评论。并替换之前发表的简短评论内容。是否继续？')) {
                            form.submit();
                        }
                    } else {
                        form.submit();
                    }
                })
                return false;
            }
            return true;
        });
    }

}

Douban.init_popup = function(o){
    $(o).click(function(){
        var size = / (\d+)x(\d+)$/.exec(o.className);
        if(!window.open(o.href,'popup','height='+size[2]+',width='+size[1]+
        ',toolbar=no,menubar=no,scrollbars=no,location=no,status=no')){
            location.href=o.href;
        }
        return false;
    })
}

Douban.init_show_request_join_form = function(o){
    $(o).click(function(){
        group_id = $(o).data('group_id');
        return pop_win.load('/j/group/'+group_id+'/request_join_form');
    });
}

Douban.init_show_comment_form = function(o){
    $(o).click(function(){
        $(o).hide();
        $('#comment_form').show();
    });
}

Douban.init_add2cart = function(o){
    $(o).click(function(){
        $.post_withck("/cart", {add: o.name}, function(){
            $(o).next('.pl').hide();
            $(o).hide().nextAll('.hidden').show().yellow_fade();
        })
    })
}

Douban.init_switch_tab = function(o){
    $(o).click(function(){
        $('.a_switch_tab').removeClass('current')
        $(o).addClass('current');
        $("#tag-loader").attr("class", "loading").text("")
        $.getJSON('/j/recommended/switch', {'tag': o.name}, function(ret){
            $(".tag-fav-cloud").replaceWith(ret.tags);
            load_event_monitor('.tag-fav-cloud');
            $(".rec-list").replaceWith(ret.subjects);
            load_event_monitor('.rec-list');
        });
        return false;
    });
}


Douban.init_switch_tab_movie = function(o){
    $(o).click(function(){
        $('.a_switch_tab').removeClass('current');
        url = $('#hide_full_path').attr("name") + "/switch"
        $('#tag_all').removeClass("current");
        $('.tag-fav-cloud a').removeClass('current')
        $(o).addClass('current');
        $("#tag-loader").attr("class", "loading").text("")
        $.getJSON(url, {'tag': o.name}, function(ret){
            //$(".tag-fav-cloud").replaceWith(ret.tags);
            //load_event_monitor('.tag-fav-cloud');
            $(".rec-list").replaceWith(ret.subjects);
            load_event_monitor('.rec-list');
            $("#tag-loader").attr("class", "not-loading")
        });
        return false;
    });
}


Douban.init_get_more = function(o){
    $(o).click(function(){
        page = parseInt($(o).attr("attr")) + 10;
        url = $('#hide_full_path').attr("name") + "/switch";
        start = parseInt($(o).attr("start")) + 10
        $('.a_switch_tab').removeClass('current')
        $(o).addClass('current');
        tag = o.name.replace('[','','g').replace(']','','g').replace('\'','','g')
        $("#tag-loader").attr("class", "loading").text("")
        $.getJSON(url, {'tag': tag, 'perpage': page, 'start': start}, function(ret){
            //$(".tag-fav-cloud").replaceWith(ret.tags);
            $(o).attr("attr", page);
            //load_event_monitor('.tag-fav-cloud');
            $(".rec-list").replaceWith(ret.subjects);
            load_event_monitor('.rec-list');
            $("#tag-loader").attr("class", "not-loading")
        });
        return false;
    });}


Douban.init_nointerest_subject = function(o){
    $(o).click(function(){
        tag = $(".tag-fav-cloud > .current").attr("name");
        $.post_withck('/j/recommended/nointerest_subject', {'sid': o.name}, function(ret){
            if (ret == 'Y'){
                $("#tag-loader").attr("class", "loading").text()
                $.getJSON('/j/recommended/switch', {'tag': tag}, function(ret){
                    $(".tag-fav-cloud").replaceWith(ret.tags);
                    load_event_monitor('.tag-fav-cloud');
                    $(".rec-list").replaceWith(ret.subjects);
                    load_event_monitor('.rec-list');
                });
            }
        });
        return false;
    });
}


Douban.init_nointerest_entry = function(o){
    $(o).click(function(){
        var id = o.href.match(/nointerest=(\d+)/)[1];
        $.post_withck('/j/recommended/nointerest_subject', {'sid': id}, function(ret){
            if (ret == 'Y'){
                window.location.reload();
            }
        });
        return false;
    });
}


Douban.init_nointerest_subject_tab = function(o){
    $(o).click(function(){
        tag = $(".tag-fav-cloud > .current").attr("name");
        $.post_withck('/j/recommended/nointerest_subject', {'sid': o.name, 'tag': $(o).attr("tag")}, function(ret){
            if (ret == 'Y'){
                $("#tag-loader").attr("class", "loading").text()
                $.getJSON('/j/recommended/switch', {'tag': $(o).attr("tag")}, function(ret){
                    $(".tag-fav-cloud").replaceWith(ret.tags);
                    load_event_monitor('.tag-fav-cloud');
                    $(".rec-list").replaceWith(ret.subjects);
                    load_event_monitor('.rec-list');
                });
            }
        });

        return false;
    })
}


Douban.init_nointerest_subject_movie = function(o){
    $(o).click(function(){
        url = $('#hide_full_path').attr("name") + "/nointerest_subject";
        self_item = $(this).parents('.item');
        var is_blacklist = true;
        //abtest = parseInt($(o).attr("abid"))%2;
        //if (abtest==1){
        //    is_blacklist = true;
        //}else{
        //    is_blacklist = confirm("你确定不再关注这部电影?");
        //}
        _self = this;
        if (is_blacklist){
            tag = $(".tag-fav-cloud > .current").attr("name");
            total = $('.a_get_more').attr('attr');
            $.post_withck(url , {'sid': o.name}, function (ret) {
                if (ret == 'Y') {
                    self_item.fadeOut(function () {
                    $.getJSON($('#hide_full_path').attr("name") + "/switch", {'tag': tag, 'perpage': total}, function (ret) {
                       $(".rec-list").replaceWith(ret.subjects);
                       load_event_monitor('.rec-list');
                       $("#tag-loader").attr("class", "not-loading")
                    });
                    });
                }
            });
        }

        return false;
    });
}


Douban.init_nointerest_subject_top = function(o){
    $(o).click(function () {
        url = $('#hide_full_path').attr("name") + "/nointerest_subject_top";
        var is_blacklist = true;
        //abtest = parseInt($(o).attr("abid"))%2;
        //if (abtest==1){
        //    is_blacklist = true;
        //}else{
        //    is_blacklist = confirm("你确定不再关注这部电影?");
        //}
        _self = this;
        if (is_blacklist) {
            $(_self).parents('li').fadeOut('slow', function () {
                $(this).remove();
            });
            last_num -= 1; cover_num -= 1;
            if (cover_num === 0) { $('#movie-rec').remove(); }
            if (last_num === 5) { $('.btn-next > a').addClass('dis'); }
            $('.detail-tip').remove();
            $.post_withck(url, {'sid': o.name}, function(ret){
                if (ret === 'Y') { /* delete success */ }
            });
        }
        return false;
    });
}

Douban.init_nointerest_doulist = function(o){
    $(o).click(function(){
        $("#doulist-loader").attr("class", "loading")
        $.post_withck('/j/recommended/nointerest_doulist', {'dl_del': o.name}, function(ret){
            $(".simple-dashed-list").replaceWith(ret);
            load_event_monitor('.simple-dashed-list');
            $("#doulist-loader").attr("class", "not-loading")
        });
        return false;
    });
}

Douban.init_nointerest_doulist_movie = function(o){
    $(o).click(function(){
        url = $('#hide_full_path').attr("name") + "/nointerest_doulist";
        $("#doulist-loader").attr("class", "loading")
        $.post_withck(url, {'dl_del': o.name}, function(ret){
            $(".simple-dashed-list").replaceWith(ret);
            load_event_monitor('.simple-dashed-list');
            $("#doulist-loader").attr("class", "not-loading")
        });
        return false;

    });
}

Douban.init_post_link = function(o) {
    $(o).click(function(e){
        var el = $(this),
        href = el.attr("href"),
        text = el.attr("title") || el.text() + "?",
        attr_rel = el.attr("rel"),
        is_confirm = attr_rel == "confirm_direct" || attr_rel == "",
        is_direct = attr_rel == "direct" || attr_rel == "confirm_direct",
        target = el.attr("target"),
        post_url = href.split("?")[0],
        post_args = {},
        args = href.split("?")[1] || [];

        if (typeof args === 'string') {
            args = args.split("&");
        }

        e.preventDefault();

        // prevent continuous click
        if (el.hasClass('processing')) {
            return;
        };

        if (is_confirm && !confirm(text)) {
            return;
        }

        if (is_direct) {
            var args_html = [];
            args.push("ck=" + get_cookie('ck'));
            for (i=0, pair; i<args.length; i++) {
                pair = args[i].split("=");
                args_html.push('<input type="hidden" name="' + pair[0] + '" value="' + unescape(pair[1]).escapeHTML() + '">');
            }
            $('<form action="' + post_url + '" method="POST" target="' + (target || "_self") + '" sytle="display:none">' + args_html.join("") + '</form>').appendTo("body").submit();
        } else {
            // parse query string
            for (i=0; i<args.length; i++) {
                var pair = args[i].split("=");
                post_args[pair[0]] = pair[1];
            }

            el.addClass('processing');
            $.post_withck(post_url, post_args,
            function(e){
                el.removeClass('processing');
                location.reload(true);
            });
        }
    });
};

try { document.execCommand("BackgroundImageCache", false, true); } catch(err) {}
Douban.init_donate = function(){
  var templ_container  = '<div class="blocktip dou-tip">{BODY}</div>',
    templ_form = '<form action="" method="post"><div class="frm-item">你将向作者赠送<b>1</b>颗小豆</div><div class="frm-item"><label for="dou-inp-msg">顺带捎个话...</label><input id="dou-inp-msg" type="text" name="note"></div><div class="frm-submit"><span class="bn-flat"><input type="submit" value="送出"></span><a href="#" class="tip-bn-cancel">取消</a></div></form>',
    templ_tip = '<p>“感谢”将向作者赠送<b>1</b>颗小豆，你还没有小豆。<br><a href="http://www.douban.com/help/account#t4-q1">怎样获取小豆?</a></p><span class="bn-flat"><input type="button" class="tip-bn-cancel"  value="知道了"></span>',
    templ_error = '<span class="donated-fail">{MSG}</span>',
    templ_success = '<span class="donated-success">{MSG}</span>',
    templ_processing = '<p>处理中，请稍候...</p>',

    css_closetip = '.tip-bn-cancel',
    css_process = 'processing',

    displayError = function(node, msg) {
      node.replaceWith(templ_error.replace('{MSG}', msg));
      hideOverlay();
    },

    showOverlay = function(cont, node) {
      hideOverlay();
      var overlay = $(templ_container.replace('{BODY}', cont)).appendTo('body'),
      pos = node.offset(),
      overlay_pos = [],
      win = $(window),
      winH = win.scrollTop() + win.height();

      if ((winH - pos.top) < (overlay.height() + 20)) {
        overlay_pos = [pos.left, pos.top - overlay.height() - node.height()];
      } else {
        overlay_pos = [pos.left, pos.top + node.height()];
      }

      overlay.css({
         position: 'absolute',
         left: overlay_pos[0] + 'px',
         top: overlay_pos[1] + 'px'
      });

      return overlay.show();
    },

    hideOverlay = function() {
      $('.dou-tip').remove();
    },

    updateOverlay = function(overlay, node) {
      var pos = node.offset(),
      overlay_pos = [],
      win = $(window),
      winH = win.scrollTop() + win.height();

      if ((winH - pos.top) < (overlay.height() + 20)) {
        overlay_pos = [pos.left, pos.top - overlay.height() - node.height()];
      } else {
        overlay_pos = [pos.left, pos.top + node.height()];
      }

      overlay.css({
         left: overlay_pos[0] + 'px',
         top: overlay_pos[1] + 'px'
      });
    },

    handleDonateSubmit = function(e) {
      var handler = function(ret) {
        if (ret.error) {
          this.elm.replaceWith(templ_error.replace('{MSG}', ret.error));
        } else {
          this.elm.replaceWith(templ_success.replace('{MSG}', ret.msg));
        }
        hideOverlay();
      };
      e.preventDefault();
      this.args.is_first = 0;
      this.args.note = $.trim(e.target.elements['note'].value);
      this.relateTip.html(templ_processing);
      updateOverlay(this.relateTip, this.elm);
      $.dataPoster(this.url, this.args, $.proxy(handler, this), 'post', 'json');
    },

    handleCloseTip = function(e) {
      e.preventDefault();
      hideOverlay();
      if (this.elm) {
        this.elm.removeClass(css_process);
      }
    },

    handler = function(ret){
       var elm = this.elm, pos, bn, tip;

       if (ret.error) {
         displayError(elm, ret.error);
         return;
       }

       if (ret.balance) {
         tip = showOverlay(templ_form, elm);
         this.relateTip = tip;
         tip.find('form').bind('submit', $.proxy(handleDonateSubmit, this));
         tip.find(css_closetip).bind('click', $.proxy(handleCloseTip, this));
         tip.find('input[type=text]').bind({
           'focusin': function(e){
             $(this).prev().hide();
           },
           'focusout': function(e){
             if (this.value === '') {
               $(this).prev().show();
             }
           }
        });
       } else {
         // 余额不足
         tip = showOverlay(templ_tip, elm);
     tip.css('width', 260 + 'px');
         this.relateTip = tip;
         tip.find(css_closetip).bind('click', $.proxy(handleCloseTip, this));
       }

       $(window).bind('resize', function() {
           updateOverlay(tip, elm);
       });
    };

    $('body').delegate('.btn-donate', 'click', function(e){
      var elm = $(e.currentTarget),
          url = elm.attr('href').split('?'),
          param,
          p, i, len,
          o = {
           elm: elm
          },
          args = {is_first: 1};

          e.preventDefault();
          if (elm.hasClass(css_process)) {
              return;
          }
          elm.addClass(css_process);
          if (url[1]) {
             param = url[1].split('&');
             for (i = 0, len = param.length; i<len; i++) {
                p = param[i].split('=');
                args[p[0]] = p[1] || '';
             }
          }

        o.args = args;
        o.url = url[0];
        $.dataPoster(url[0], args, $.proxy(handler, o), 'post', 'json');
    });
};

$(function() {
    load_event_monitor(document);
    // request_log_ad_displays();
});
