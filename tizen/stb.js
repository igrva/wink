var vmxDomain='46.61.196.66',vmxOwner='Rostelecom',drmVMX=0;
var drmParam = {CompanyName: vmxOwner,IPTV: "",Web: vmxDomain};
var properties = JSON.stringify(drmParam);
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
        },
        oncurrentplaytime: function(currentTime) {
            if(_started) return;
            _started = true;
            execCHarr('aSubs', _setSubtitleTrack);
            execCHarr('aAudios', _setAudioTrack);
            var si = webapis.avplay.getCurrentStreamInfo(), ind = 0;
            for(var i in si){ if(si[i].type == 'VIDEO'){ ind = si[i].index; set_video_res(si[i]); } }
            try{
                si = webapis.avplay.getTotalTrackInfo();
                for(var i in si){ if ((si[i].type == 'VIDEO')&&(si[i].index == ind)){ set_video_res(si[i]); return; } }
            } catch(e){}
        },
        onsubtitlechange: function(duration, text, data3, data4) {
            if(!_subsOn) return;
            clearSubs();
            $('#divsubtitles').html('<span style="background-color:rgba(0,0,0,0.8);">'+text+'</span>');
            _subsTim = setTimeout(clearSubs, duration);
        },
       ondrmevent: function(drmEvent, drmData) {showShift("DRM callback: " + drmEvent + ", data: " + drmData); console.log("DRM callback: " + drmEvent + ", data: " + drmData);},
    };
    function doPlay(att){
        stbStop();
        _subsOn = false;
        clearSubs();
        execCHarr('aAspects', _setAspect);
        $('#video_res').html('<br/>Connect...');
        webapis.avplay.open(url); 
        try{ webapis.avplay.setTimeoutForBuffering(sBufSize*1000); }catch(e){}
        try{ webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_PLAY","PLAYER_BUFFER_SIZE_IN_SECOND", sBufSize); }catch(e){}
        try{ webapis.avplay.setBufferingParam("PLAYER_BUFFER_FOR_RESUME","PLAYER_BUFFER_SIZE_IN_SECOND", sBufSize*3); }catch(e){}
        webapis.avplay.setListener(listener); 
                if(!sNoSmall && list.style.display != 'none') stbSetWindow();
        else stbToFullScreen();

        curTrack = 0;
        // var bitRateString = 'BITRATES=5000~20000|STARTBITRATE=HIGHEST|SKIPBITRATE=LOWEST';
         var bitRateString = 'STARTBITRATE=HIGHEST';
         try{ webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', bitRateString); }catch(e){}
        try {if (drmVMX==1){webapis.avplay.setDrm("VERIMATRIX", "SetProperties", properties)};}catch(e){}
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
