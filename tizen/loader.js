var host = "http://ott.igrva.ml.com";
(function() {
    // Load the script
    var script = document.createElement("SCRIPT");
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
    script.type = 'text/javascript';
    script.async = false;
    script.onload = function(){
        $(document.body).load(host+'/stbPlayer/stbPlayer_body.html');
        $.getScript(host+'/stbPlayer/stbPlayer.js');
        $.getScript(host+'/samsung/tizen/stb.js');
    };
    document.getElementsByTagName("head")[0].appendChild(script);
})();
