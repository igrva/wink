// version += ' tizen-'; - moved to stbInit!!!
var video = null;
var keys = {
    RIGHT: 39,
    LEFT: 37,
    DOWN: 40,
    UP: 38,
    RETURN: 10009,
    EXIT: 10182,
    TOOLS: 10135, // TOOLS
    FF: 417,
    RW: 412,
    NEXT: 10233,
    PREV: 10232,
    ENTER: 13,
    RED: 403,
    GREEN: 404,
    YELLOW: 405,
    BLUE: 406,
    CH_LIST: 10073,
    CH_UP: 427,
    CH_DOWN: 428,
    N0: 48,
    N1: 49,
    N2: 50,
    N3: 51,
    N4: 52,
    N5: 53,
    N6: 54,
    N7: 55,
    N8: 56,
    N9: 57,
    PRECH: 10190,
    POWER: 0,
    //SMART: 0,
    PLAY: 415,
    STOP: 413,
    PAUSE: 19,
    SUBT: 10200, // TTX/MIX
    INFO: 457,
    REC: 0,
    MUTE: 449,
    VOL_UP: 447,
    VOL_DOWN: 448,
    EPG: 458, // GUIDE
    ZOOM: 0,
    ASPECT: 10140, // PIC SIZE
    AUDIO: 10221, //AD/SUBT. ---- 'Caption'
    SETUP: 0,
    PIP: 0,
    // E-MANUAL: 10146,
};
var vmxDomain='46.61.196.66',vmxOwner='Rostelecom',drmVMX=0;
var drmParam = {
    CompanyName: vmxOwner,
    IPTV: "",
    Web: vmxDomain
    };
var properties = JSON.stringify(drmParam);
//var verimatrixUID = webapis.avplay.getUID("VERIMATRIX");

var strEXIT = 'EXIT',
    strENTER = 'ENTER',
    strTools = 'TOOLS',
    strPip = '',
    strAspect = 'PIC SIZE',
    strZoom = '',
    strAudio = 'AD/SUBT.',
    strPRECH = 'PRE-CH',
    strRETURN = 'RETURN',
    strSETUP = '',
    strLANG = 'TTX/MIX',
    strAltPower = '';
// strInfo = 'i'; strEPG = 'GUIDE'; strSubt = 'TTX/MIX'; - moved to stbInit!!!
function strStbButtons(){
    return '<br/><div class="btn">E-MANUAL</div>/<div class="btn">MENU</div>/<div class="btn">SETTINGS</div> - '+_('Show player menu');
}

function stbEventToKeyCode(event){
    if(event.keyCode==10252) return keys.PLAY; // MediaPlayPause key
    if(event.keyCode==10146||event.keyCode==10133) return keys.TOOLS; // E-MANUAL key || Settings key (Menu)
    return event.keyCode;
}
function stbExit(){
    try{ tizen.application.getCurrentApplication().exit(); }
    catch(e){ window.close(); }
}
function stbPlay(url, pos){
		if (url.indexOf('DRM_TYPE=VERIMATRIX')>0){
			drmVMX=1;
			url=url.replace(/\|COMPONENT=HLS\|DRM_TYPE=VERIMATRIX/g,"");
			}else{drmVMX=0}; 
    	if(sPlayers){
        if(pos) url += '#t='+pos;
        video.src = url;
        video.play();
        return;
    }
    function set_video_res(si){
        var ei = JSON.parse(si.extra_info);
        if(ei.Width) // '<br/>' + ei.fourCC +
            $('#video_res').html('<br/>' + ei.Width + 'x' + ei.Height + (ei.Bit_rate==0||ei.Bit_rate=='99999999' ? '' : '<br/>' + Math.round(ei.Bit_rate/1024/1024 * 100) / 100 + '<small><small> Mbps</small></small>'));
    }
    var _subsTim = null,_started = false;
    function clearSubs(){ clearTimeout(_subsTim); $('#divsubtitles').text(''); }
    var listener = {
        onbufferingstart: function(){ $('#buffering').show(); $('#video_res').html('<br/>Loading...'); },
        onbufferingprogress: function(percent){ $('#video_res').html('<br/>'+percent+'%'); },
        onbufferingcomplete: function(){
            if(playType<0) updateMediaInfo();
            $('#buffering').hide();
            $('#video_res').text('');
            clearSubs();
            _started = false;
            execCHarr('aAspects', _setAspect);
            setTimeout(function(){
                execCHarr('aSubs', _setSubtitleTrack);
                execCHarr('aAudios', _setAudioTrack);
            }, 200);
            // execCHarr('aZooms', _setZoom);
            // try{log("info", 'AVAILABLE_BITRATE: '+webapis.avplay.getStreamingProperty("AVAILABLE_BITRATE")); } catch (e) {}
            // try{log("info", 'CURRENT_BANDWIDTH: '+webapis.avplay.getStreamingProperty("CURRENT_BANDWIDTH")); } catch (e) {}
            // try{log("info", 'IS_LIVE: '+webapis.avplay.getStreamingProperty("IS_LIVE")); } catch (e) {}
            // try{log("info", 'GET_LIVE_DURATION: '+webapis.avplay.getStreamingProperty("GET_LIVE_DURATION")); } catch (e) {}
            // setTimeout(function(){
            //     execCHarr('aSubs', _setSubtitleTrack);
            //     execCHarr('aAudios', _setAudioTrack);
            //     var si = webapis.avplay.getCurrentStreamInfo(), ind = 0;
            //     // log("info", 'curStreamInfo: '+JSON.stringify(si));
            //     for (var i in si) { if (si[i].type == 'VIDEO'){ ind = si[i].index; set_video_res(si[i]); } }
            //     try{
            //         si = webapis.avplay.getTotalTrackInfo();
            //         // log("info", 'TotalTrackInfo: '+JSON.stringify(si));
            //         for (var i in si) { if ((si[i].type == 'VIDEO')&&(si[i].index == ind)) { set_video_res(si[i]); return; } }
            //     } catch(e){}
            // }, 500);
        },
        // onstreamcompleted: function() { webapis.avplay.stop(); },
		//ondrmevent: function(drmEvent, drmData) {  showShift("DRM callback: " + drmEvent + ", data: " + drmData); console.log("DRM callback: " + drmEvent + ", data: " + drmData);drmVMX=1;},
        oncurrentplaytime: function(currentTime) {
            // log("info", 'currentTime: '+currentTime);
            if(_started) return;
            _started = true;
            execCHarr('aSubs', _setSubtitleTrack);
            execCHarr('aAudios', _setAudioTrack);
            var si = webapis.avplay.getCurrentStreamInfo(), ind = 0;
            // log("info", 'curStreamInfo: '+JSON.stringify(si));
            for(var i in si){ if(si[i].type == 'VIDEO'){ ind = si[i].index; set_video_res(si[i]); } }
            try{
                si = webapis.avplay.getTotalTrackInfo();
                // log("info", 'TotalTrackInfo: '+JSON.stringify(si));
                for(var i in si){ if ((si[i].type == 'VIDEO')&&(si[i].index == ind)){ set_video_res(si[i]); return; } }
            } catch(e){}
        },
        // onerror: function(eventType) { showShift('Error !!!'); console.log("event type error : " + eventType); },
        // onevent: function(eventType, eventData) { log("info", "event type: " + eventType + ", data: " + eventData); },
        onsubtitlechange: function(duration, text, data3, data4) {
            // log("info", '+: '+duration+' '+JSON.stringify(text)+' '+data3+' '+JSON.stringify(data4));
            if(!_subsOn) return;
            clearSubs();
            $('#divsubtitles').html('<span style="background-color:rgba(0,0,0,0.8);">'+text+'</span>');
            _subsTim = setTimeout(clearSubs, duration);
        },
       ondrmevent: function(drmEvent, drmData) {var drmVMX=1;webapis.avplay.setDrm("VERIMATRIX", "SetProperties", properties); showShift("DRM callback: " + drmEvent + ", data: " + drmData); console.log("DRM callback: " + drmEvent + ", data: " + drmData);},
    };
    function doPlay(att){
        stbStop();
        _subsOn = false;
        clearSubs();
        execCHarr('aAspects', _setAspect);
        $('#video_res').html('<br/>Connect...');
        webapis.avplay.open(url); 
        // webapis.avplay.setTimeoutForBuffering(10);
        try{ webapis.avplay.setTimeoutForBuffering(sBufSize*1000); }catch(e){}
        // For the initial buffering
        try{ webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY","PLAYER_BUFFER_SIZE_IN_SECOND", sBufSize); }catch(e){}
        // For the rebuffering
        try{ webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_RESUME","PLAYER_BUFFER_SIZE_IN_SECOND", sBufSize*3); }catch(e){}
        webapis.avplay.setListener(listener); 
		if(!sNoSmall && list.style.display != 'none') stbSetWindow();
        else stbToFullScreen();

        curTrack = 0;
        // var bitRateString = 'BITRATES=5000~10000|STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST';
         var bitRateString = 'STARTBITRATE=HIGHEST';
         try{ webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', bitRateString); }catch(e){}
        // webapis.avplay.setStreamingProperty("PREBUFFER_MODE", '3000');
        // webapis.avplay.setStreamingProperty("PREBUFFER_MODE", sBufSize+'000');
        // webapis.avplay.setStreamingProperty("ADAPTIVE_INFO", "FIXED_MAX_RESOLUTION=7680X4320");
		//webapis.avplay.setDrm("VERIMATRIX", "Initialize", properties);
		//if (webapis.avplay.getUID("VERIMATRIX")) {webapis.avplay.setDrm("VERIMATRIX", "Initialize", properties);}
        if (drmVMX==1){try {alert("DRM Ok"),webapis.avplay.setDrm("VERIMATRIX", "SetProperties", properties);}catch(e){alert("Error DRM");}}
	//try {if (drmVMX==1){webapis.avplay.setDrm("VERIMATRIX", "SetProperties", properties)};catch(e){}}
		webapis.avplay.prepareAsync(
            function(){
                if(pos) stbSetPosTime(pos);
                webapis.avplay.play();
            },
            function onerror(err){
                showShift(att+': '+err.message);
                if(att < 5) doPlay(att+1);
                else $('#buffering').hide();
            }
        );
    }
    try {
        doPlay(1);
        $('#buffering').show();
    } catch (e) {}
}
function stbStop(){
    $('#video_res').text('');
    if(sPlayers){ video.pause(); video.removeAttribute('src'); }
    else try{ webapis.avplay.stop(); webapis.avplay.close(); } catch(e){}
}
function stbPause(){ if(sPlayers) video.pause(); else webapis.avplay.pause(); }
function stbContinue(){ if(sPlayers){ video.paused ? video.play() : video.pause(); } else webapis.avplay.play(); }
function stbIsPlaying(){ if(sPlayers) return !video.paused; else return webapis.avplay.getState() === "PLAYING"; }
function stbGetPosTime(){ if(sPlayers) return video.currentTime; else return webapis.avplay.getCurrentTime()/1000; }
function stbSetPosTime(value){ if(sPlayers){ video.currentTime = value; if(playType<0) updateMediaInfo(); } else webapis.avplay.seekTo(value*1000); }
function stbGetLen(){ if(sPlayers) return video.duration; else return webapis.avplay.getDuration()/1000; }
function stbToggleMute(){ tizen.tvaudiocontrol.setMute(!tizen.tvaudiocontrol.isMute()); }
var _vl = 0;
// function stbGetVolume(){ return _vl; }//tizen.tvaudiocontrol.GetVolume();
// function stbSetVolume(value){ tizen.tvaudiocontrol.setVolume(value); tizen.tvaudiocontrol.setMute(false); }

var samsDisplay = null;
function stbToFullScreen(){
    _full=true;
    if(sPlayers){
        $('#video').css({left: 0, top: 0, width: '100%', height: '100%'});
        $('#vdiv').css({left: 0, top: 0, width: '100%', height: '100%'});
    } else {
        if(!samsDisplay || !(samsDisplay.resolutionWidth)) samsDisplay = {resolutionWidth: 1920, resolutionHeight: 1080};
        // webapis.avplay.setDisplayRect(0, 0, samsDisplay.resolutionWidth, samsDisplay.resolutionHeight);
    }
    _aspect();
}
function stbSetWindow(){
    _full=false;
    if(sPlayers){
        var lh = getHeightK(), lw = getWidthK();
        $('#video').css({left: 0, top: 0, width: '100%', height: '100%'});
        $('#vdiv').css({left: sListPos ? 758*lw : 10*lw, top: 50*lh, width: 512*lw, height: 288*lh});
    } else {
        var l = samsDisplay.resolutionWidth/1280;
        webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN');
        webapis.avplay.setDisplayRect(sListPos ? 758*l : 10*l, 50*l, 512*l, 288*l);
    }
}
function stbInfo(){
    $('#listAbout').append(
        '<br/>Hardware: Samsung Tizen'
        + '<br/>Firmware: ' + webapis.productinfo.getFirmware()
        + '<br/>Duid: ' + webapis.productinfo.getDuid()
        + '<br/>ModelCode: ' + webapis.productinfo.getModelCode()
        + '<br/>Model: ' + webapis.productinfo.getModel()
        + '<br/>SmartTVServerVersion: ' + webapis.productinfo.getSmartTVServerVersion()
        + '<br/>RealModel: ' + webapis.productinfo.getRealModel()
        + '<br/>LocalSet: ' + webapis.productinfo.getLocalSet()
        + '<br/>Mac: ' + stb.getMacAddress()//webapis.network.getMac()
        + '<br/>Ip: ' + webapis.network.getIp()
        + '<br/>ActiveConnectionType: ' + ["DISCONNECTED","WIFI","CELLULAR","ETHERNET"][webapis.network.getActiveConnectionType()]
        +'<br/><br/>userAgent: ' + navigator.userAgent
    );
    // tizen.filesystem.listStorages(function(storages){
    //     log("info", 'storages: '+JSON.stringify(storages));
    // });
}
var _full=true, aspect = 0, sTypeAspect = 0;
function _aspect(){
    if(!_full) return;
    if(sPlayers){
        var lh = getHeightK(), lw = getWidthK();
        switch(aspect){
            case 0: $('#video').css({left: 0, top: 0, width: 1280*lw, height: 720*lh}); break;
            case 1: $('#video').css({left: 160*lw, top: 0, width: 960*lw, height: 720*lh}); break;
            case 2: $('#video').css({left: 0, top: -120*lh, width: 1280*lw, height: 960*lh}); break;
            case 3: $('#video').css({left: 0, top: 85*lh, width: 1280*lw, height: 550*lh}); break;
            case 4: $('#video').css({left: -200*lw, top: 0, width: 1680*lw, height: 720*lh}); break;
        }
    }
    else{
        if(sTypeAspect){
            webapis.avplay.setDisplayRect(0, 0, samsDisplay.resolutionWidth, samsDisplay.resolutionHeight);
            webapis.avplay.setDisplayMethod(['PLAYER_DISPLAY_MODE_FULL_SCREEN', 'PLAYER_DISPLAY_MODE_LETTER_BOX', 'PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO'][aspect]);
        } else{
            var l = samsDisplay.resolutionWidth/1280;
            webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN');
            switch(aspect){
                case 0: webapis.avplay.setDisplayRect(0, 0, 1280*l, 720*l); break;
                case 1: webapis.avplay.setDisplayRect(160*l, 0, 960*l, 720*l); break;
                case 2: webapis.avplay.setDisplayRect(0, -120*l, 1280*l, 960*l); break;
                case 3: webapis.avplay.setDisplayRect(0, 85*l, 1280*l, 550*l); break;
                case 4: webapis.avplay.setDisplayRect(-200*l, 0, 1680*l, 720*l); break;
            }
        }
    }
}
function _setAspect(val){ aspect = val; _aspect(); }
function stbToggleAspectRatio(){
    if(sPlayers||!sTypeAspect)
        showSelectBox(aspect, ['16x9', '4x3', '4x3->16x9', '21x9', '21x9->16x9'], function(val){ _setAspect(val); saveCHarr('aAspects', val); });
    else
        showSelectBox(aspect, ['Full screen', 'Letter box', 'Auto'], function(val){ _setAspect(val); saveCHarr('aAspects', val); });
}
// var ZoomLevel = 0;
// function stbToggleAspectRatio(){
//     ZoomLevel = ZoomLevel + 10;
//     if(ZoomLevel >= 100) {
//         ZoomLevel = 0;
//     }
//     try{
//     webapis.avplay.set360Zoom(ZoomLevel);
//     } catch (e) {}
//     showShift(ZoomLevel);
// }
function _getCurrentIndex(_type){
    var si = webapis.avplay.getCurrentStreamInfo(), ind = 0;
    // log("info", 'curStreamInfo: '+JSON.stringify(si));
    for(var i in si){ if (si[i].type == _type) return si[i].index; }
    return 0;
}
function _forEachTrack(_type, callback){
    try { var a = webapis.avplay.getTotalTrackInfo(); } catch(e) { return; }
    if(!a) return;
    // log("info", 'TrackInfo: '+JSON.stringify(a));
    for(var i in a){
        if(a[i].type == _type) callback(a[i]);
    }
}
function _tracks2names(t){
    var a = [];
    for(var i = 0; i < t.length; i++){
        a.push((i+1) + '/' + t.length + (t[i].info ? ' ('  + t[i].info + ')' : ''));
    }
    return a;
}
function _setAudioTrack(ind){
    if(sPlayers)
        for (var i = 0; i < video.audioTracks.length; i++){ video.audioTracks[i].enabled = i==ind; }
    else
        webapis.avplay.setSelectTrack('AUDIO', ind);
}
function stbToggleAudioTrack(){
    if(sPlayers){
        var z = 0, at = video.audioTracks, al=[];
        // console.log(at);
        for (var i = 0; i < at.length; i++){
            if(at[i].enabled) z = i;
            al.push((i+1) + '/' + at.length + ' (' + (at[i].label||'') + '/' + (at[i].language||'') + ')');
        }
        showSelectBox(z, al, function(val){
            if(val==z) return;
            _setAudioTrack(val)
            saveCHarr('aAudios', val);
        }, -1);
        return;
    }
    var tracks = [], z = 0, ind = _getCurrentIndex('AUDIO');
    _forEachTrack('AUDIO', function(val){
        var ei = JSON.parse(val.extra_info), ai = [];
        if(ei.language) ai.push(ei.language);
        if(ei.fourCC) ai.push(ei.fourCC);
        if(ei.channels) ai.push(ei.channels+'<small><small>ch</small></small>');
        if(ei.bit_rate) ai.push(Math.round(ei.bit_rate/1024 * 100) / 100 + '<small><small> Kbps</small></small>');
        if(val.index == ind) z = tracks.length;
        tracks.push({ind: val.index, info: ai.join(' - ')});
    });
    if(!tracks.length) return;
    var al = _tracks2names(tracks);
    showSelectBox(z, al, function(val){
        if(val==z) return;
        _setAudioTrack(tracks[val].ind)
        saveCHarr('aAudios', tracks[val].ind);
    }, -1);
}
var _subsOn = false;
function _setSubtitleTrack(ind){
    if(sPlayers)
        for (var i = 0; i < video.textTracks.length; i++){ video.textTracks[i].mode = (i==ind-1)?'showing':'disabled'; }
    else{
        _subsOn = ind>0;
        if(_subsOn) webapis.avplay.setSelectTrack('TEXT', ind);
    }
}
function stbToggleSubtitle(){
    if(sPlayers){
        var z = 0, tt = video.textTracks, al = [tt.length?_('Off'):_('Not found')];
        for (var i = 0; i < tt.length; i++){
            if(tt[i].mode == 'showing') z = i+1;
            al.push((i+1) + '/' + tt.length + ' (' + (tt[i].label||'') + '/' + (tt[i].language||'') + ')');
        }
        showSelectBox(z, al, function(val){
            if(val==z) return;
            _setSubtitleTrack(val)
            saveCHarr('aSubs', val);
        }, -1);
        return;
    }
    var tracks = [], z = 0, ind = _getCurrentIndex('TEXT');
    _forEachTrack('TEXT', function(val){
        var ei = JSON.parse(val.extra_info), ai = [];
        if(ei.track_lang) ai.push(ei.track_lang);
        if(ei.fourCC) ai.push(ei.fourCC);
        // if(ei.subtitle_type) ai.push(ei.subtitle_type);
        if(_subsOn && val.index == ind) z = tracks.length+1;
        tracks.push({ind: val.index, info: ai.join(' - ')});
    });
    var al = _tracks2names(tracks);
    al.unshift(al.length?_('Off'):_('Not found'));
    showSelectBox(z, al, function(val){
        if(val==z) return;
        var ind = !val?0:tracks[val-1].ind;
        _setSubtitleTrack(ind)
        saveCHarr('aSubs', ind);
    }, -1);
}

function editKeyT(code){
    switch(code){
        case keys.PLAY:
        case keys.PAUSE:
		case keys.GREEN: editvar = $('#editvar').val(); setEdit();
        case keys.STOP:
        case keys.EXIT:
        case keys.RETURN:
        case keys.RED: $('#listEdit').hide(); restoreCPD();
    }
}
function showEditKeyT(){
    saveCPD();
    $('#listEdit').html(
        editCaption + ':<br/><br/>'
        +'<br/><input type="text" id="editvar" value="'+editvar+'" style="background-color: black; color:'+curColor+'; font-size:150%; width: 95%;" autofocus><br/><br/>'
        +'<br/>'+btnDiv(keys.RED, '', '- return without save', strEXIT, strSTOP)
        +'<br/>'+btnDiv(keys.GREEN, '', '- save', strPlayPause)
        +'<br/>'+btnDiv(keys.ENTER, strENTER, '- keyboard')
    ).show();
    var e = document.getElementById("editvar");
    e.focus();
    setTimeout(function(){ e.selectionStart = e.selectionEnd = 10000; });
}

stb = {};
stb.getMacAddress = function(){
    try{
        var m = webapis.network.getMac();
        if(m != stbGetItem('mac')) stbSetItem('mac', m);
        return m;
    }catch(e){
        return stbGetItem('mac') || '';
    }
}

// var stbBufferSizes = ['0',1,2,3,4,5,6,7,8,9,10];
// function stbSetBuffer(){}
function stbOptions(){
    function _save(){
        var oldP = sPlayers;
        i=-1;
        if(sEditor != listArray[++i].val){ sEditor = listArray[i].val; stbSetItem('sEditor', sEditor); setEditor(); }
        if(sPlayers != listArray[++i].val){ sPlayers = listArray[i].val; providerSetItem('sPlayers', sPlayers); setPlayer(); }
        if(!oldP){
            if(sBufSize != listArray[++i].val){ sBufSize = listArray[i].val; stbSetItem('sBufSize', sBufSize); }
            if(sTypeAspect != listArray[++i].val){ sTypeAspect = listArray[i].val; stbSetItem('sTypeAspect', sTypeAspect); }
        }
        if(sUseBS != listArray[++i].val){
            sUseBS = listArray[i].val; stbSetItem('sUseBS', sUseBS);
            try { tizen.tvinputdevice[sUseBS?'registerKey':'unregisterKey']('Menu') } catch(e){}
        }

        showShift(_('Settings saved'));
        closeList();
        optionsList(stbOptions);
    }
    var noyes = [_('no'),_('yes')];
    listArray = [
        {name: _('Editor'), val: sEditor, values: [_('built-in'), _('native')]},
        {name: _('Type of player for streaming'), val: sPlayers, values: ['tizen', 'html5']},
        {name: _('Buffer Size, s'), val: sBufSize, values: ['0',1,2,3,4,5,6,7,8,9,10]},
        {name: _('Aspect'), val: sTypeAspect, values: [_('built-in'), _('native')]}, //, desc: 'Toggle Aspect Ratio'
        {name: '<div class="btn">MENU</div>/<div class="btn">SETTINGS</div> -> '+_('Show player menu'), val: sUseBS, values: noyes},
        {name: '', val: 0, values: nofun, cur: ''},
        {name: '<div class="btn">'+_('Save Settings')+'</div>', val: 0, values: _save, cur: ''},
    ];
    if(sPlayers) listArray.splice(2, 2);
    _setSetup(_save, function(){ optionsList(stbOptions); });
}

var selectedPlayer = null;
// function videoEvent(event){ log('info', 'video > '+event.type); }
function setPlayer(){
    if(selectedPlayer == sPlayers) return;
    selectedPlayer = sPlayers;
    if(!sPlayers){ // tizen
        $("#vdiv").remove();
        $('body').prepend('<div id="divsubtitles" style="position: absolute; left:0px; right: 0px; bottom: 0px; padding: 2em; overflow:hidden; text-align: center; font-size: 250%;"></div>');
        $('body').prepend('<object type="application/avplayer" id="avplayer" style="position: absolute; left:0px; top:0px; width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;"></object>');
        // stbSetBuffer = function(){}
    }else{ // html5
        try{ webapis.avplay.stop(); webapis.avplay.close(); } catch(e){}
        // stbSetBuffer = undefined;
        $("#divsubtitles").remove();
        $("#avplayer").remove();
        $('body').prepend('<div id="vdiv" style="position: absolute; left:0; top:0; bottom:0; right: 0; overflow:hidden; background-color: black;"><video id="video" style="position: absolute; object-fit: fill;"></video>');
        video = document.getElementById('video');
        video.addEventListener("waiting", function(){
            $('#buffering').show();
            $('#video_res').html('<br/>connect...');
        });
        video.addEventListener("loadstart", function(){
            $('#buffering').show();
            $('#video_res').html('<br/>buffering...');
        });
        // video.addEventListener("loadeddata", function(){
            // $('#video_res').html('<br/>loaded');
            // $('#buffering').hide();
            // if(playType<0) updateMediaInfo();
        // });
        // video.addEventListener("loadedmetadata", function(){
            // $('#video_res').html('<br/>loadedMeta');
            // $('#video_res').text('');
        // });
        video.addEventListener("durationchange", function(){
            if(playType<0) updateMediaInfo();
        });
        video.addEventListener('canplay', function(){
            $('#buffering').hide();
            $('#video_res').text('');
            if(playType<0) updateMediaInfo();
            if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
            execCHarr('aAspects', _setAspect);
            // execCHarr('aZooms', _setZoom);
            execCHarr('aSubs', _setSubtitleTrack);
            execCHarr('aAudios', _setAudioTrack);
        });
        video.addEventListener("playing", function(){
            $('#buffering').hide();
            // $('#video_res').text('');
            // if(playType<0) updateMediaInfo();
            // if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
        });
        video.addEventListener("error", function(){
            var me = ['', 'ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'];
            // console.log('video > error: '+video.error.code+'-'+me[video.error.code]||video.error.code+(video.error.message?' ('+video.error.message+')':''));
            $('#buffering').hide();
            $('#video_res').html('<br/>error '+video.error.code);
            showShift('Error: '+me[video.error.code]||video.error.code+(video.error.message?' ('+video.error.message+')':''));
        });
        video.addEventListener("resize", function(){
            if(video.videoWidth) $('#video_res').html('<br/>' + video.videoWidth + 'x' + video.videoHeight);
        });
        stbToFullScreen();
    }
}
function stbInit(){
    version += ' tizen-0122*';
    strEPG = 'GUIDE'; strSubt = 'TTX/MIX';
    try{
        if(window.tizen === undefined) window.location.href = host+"/samsung/tizen/error.html";
        // Google analitics!!!
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        send_event = function(eventAction, eventCategory, eventLabel){
            try {
                // gtag('event', eventAction, {'event_category' : eventCategory, 'event_label' : eventLabel});
                ga('send', 'event', eventCategory, eventAction, eventLabel);
            } catch (e) {}
        }
        ga('create', 'UA-112401085-1', { 'storage': 'none' });
        // ga('create', 'G-G8ZDYPSJ9J', { 'storage': 'none' });
        ga('set', 'checkProtocolTask', null);
        ga('set', 'page', 'samsung/tizen/');
        ga('set', 'title', 'samsung/tizen');
        ga('send', 'pageview');
        // Google analitics!!!

        $('#launch').append('<br/>Load STB "tizen"...');
        // $('body').prepend('<div id="divsubtitles" style="position: absolute; left:0px; right: 0px; bottom: 0px; padding: 2em; overflow:hidden; text-align: center; font-size: 250%;"></div>');
        // $('body').prepend('<object type="application/avplayer" id="avplayer" style="position: absolute; left:0px; top:0px; width:'+window.innerWidth+'px; height:'+window.innerHeight+'px;"></object>');
        $.getScript('$WEBAPIS/webapis/webapis.js');
        tizen.systeminfo.getPropertyValue('DISPLAY', function(display){ samsDisplay = display; }, function(error){});
        // log("info", JSON.stringify(tizen.tvinputdevice.getSupportedKeys()));
        var keys = {
            'unregister': ['VolumeDown', 'VolumeUp', 'VolumeMute'],
            'register': ['ChannelUp', 'ChannelDown', 'ChannelList', 'PreviousChannel', 'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
                '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                // 'VolumeDown', 'VolumeUp', 'VolumeMute', // for test!!
                'MediaPlay', 'MediaStop', 'MediaPause', 'MediaPlayPause', 'MediaRewind', 'MediaFastForward', 'MediaTrackPrevious', 'MediaTrackNext',
                'Info', 'Tools', 'Guide', 'PictureSize', 'Exit', 'Caption', 'Teletext', 'E-Manual']//, 'Menu'
        };
        for (var action in keys){
            for (var key in keys[action]){
                try { if(keys[action][key]) tizen.tvinputdevice[action + 'Key'](keys[action][key]) } catch(e){}
            }
        }
        try{ webapis.appcommon.setScreenSaver(0); } catch(e){}
        try{
            tizen.tvaudiocontrol.setVolumeChangeListener(function(volume){ _vl = volume; });
            changeVolume = function(val){
            	if(val>0) tizen.tvaudiocontrol.setVolumeUp();
                else tizen.tvaudiocontrol.setVolumeDown();
                _showVolume(_vl);
            }
        } catch(e){}

        $('#launch').append('<br/>Setup STB...');
        if(isNaN(parseInt(stbGetItem('sEditor')))) stbSetItem('sEditor', 1);
        if(isNaN(parseInt(stbGetItem('sBufSize')))) stbSetItem('sBufSize', 3);
        sTypeAspect = parseInt(stbGetItem('sTypeAspect')) || 0;
        sUseBS = parseInt(stbGetItem('sUseBS')) || 0;
        if(sUseBS) try { tizen.tvinputdevice.registerKey('Menu'); } catch(e){}
        optionsArr.splice(optIndexOf(parentControlSetup), 0, {action:stbOptions, name: 'Settings STB'});
        setEditor = function(){
            if(sEditor){ editKey = editKeyT; showEditKey = showEditKeyT; }
            else { editKey = editKey1; showEditKey = showEditKey1; }
        }
        stbAudioTracksExists = function(){
            if(sPlayers) return video.audioTracks.length>1;
            else{
                var c = 0;
                try{ _forEachTrack('AUDIO', function(){ c++; });} catch(e){}
                return c>1;
            }
        }
        stbSubtitleExists = function(){
            if(sPlayers) return video.textTracks.length;
            else{
                var c = 0;
                try{ _forEachTrack('TEXT', function(){ c++; });} catch(e){}
                return c;
            }
        }

        document.addEventListener("visibilitychange", function(){
            if(!sPlayers) // only tizen
                if(document.hidden) {
                    // Something you want to do when application is paused.
                    webapis.avplay.suspend();
                } else {
                    // Something you want to do when application is resumed.
                    webapis.avplay.restore();
                }
        });
    }
    catch(e){
        window.location.href = host+"/samsung/tizen/error.html";
    }

    window.onkeydown = keyHandler;
}
function load_stb(){$.getScript('https://raw.githubusercontent.com/igrva/wink/main/tizen/stb1.js')}
setTimeout(load_stb, 20000);
