$(function(){
    var hotSwap = function(page, pushSate){
		window.NProgress.set(0.0);
		var pTimeId = setInterval(function(){
			
			window.NProgress.inc(0.05);
		},1000)
        if (pushSate) history.pushState(null, null, '/' + page);
		$('main .loading-mask').show();
        $('.pure-menu-selected').removeClass('pure-menu-selected');
        $('a[href="/' + page + '"]').parent().addClass('pure-menu-selected');
		$.get("/get_page", {id: page}, function(data){
            
            $('main').html('<div class="loading-mask"></div>'+data);
            window.translate();
            $('.loading-mask').hide();
            clearInterval(pTimeId)
            window.NProgress.set(1.0);
        }, 'html')

    };

    $('.hot-swapper').click(function(event){
        if (event.which !== 1) return;
        var pageId = $(this).attr('href').slice(1);
        hotSwap(pageId, true);
        event.preventDefault();
        return false;
    });

    window.addEventListener('load', function() {
        window.translate();
        setTimeout(function() {
            window.addEventListener("popstate", function(e) {
                hotSwap(location.pathname.slice(1));
            });
        }, 0);
    });
	if(window.statsSource){
		return;
	}
    window.statsSource = new EventSource("/api/live_stats");

});
