
(function () {
     function i18n_home () {
                // index.html
                $('.hot-swapper:eq(0)').text(Home);
                $('.hot-swapper:eq(1)').text(Blocks);
                $('.hot-swapper:eq(3)').text(Statistics);
                $('.hot-swapper:eq(2)').text(Workers);
                $('.hot-swapper:eq(4)').text(FAQ);
                // home.html
                $('.homeT1').text(NowHashrate);
                $('.homeT2').text(AvgHashrate);
                $('.homeT3').text(ActiveMiners);
                $('.homeT4').text(ActiveWorkers);
                $('.homeT5').text(LuckDays);
                $('.homeT6').text(Difficulty);     
                // blocks.html
                $('.blocksT1').text(tdBlock);
                $('.blocksT2').text(tdHash);
                $('.blocksT3').text(tdMinedon);
                $('.blocksT4').text(tdLuckDays);
                $('.blocksT5').text(tdMiner);
                $('.blocksT6').text(LastMinedBlock);
                // statistics.html
                $('.statisticsT1').text(h2Hashrate);
                // workers.html
                $('.searchBox').attr('placeholder',MinerLookup);
                $('.workersT2').text(TopMiners);
                $('.workersT3').text(thAddress);
                $('.workersT4').text(thShares);
                $('.workersT5').text(thEfficiency);
                $('.workersT6').text(thHashrate);
                $('.workersT8').text(wk1);
                $('.workersT9').text(wk2);
                $('.workersT10').text(wk3);
                $('.workersT11').text(thActiveWorkers);
                // miner_stats.html
                $('.minerT1').text(statsMiner);
                $('.minerT2').text(thBlocks);
                $('.minerT3 small').text(thTime);
                $('.minerT4 small').text(thMiners);
                $('.minerT5').text(thShares);
                $('.minerT6 small').text(thAmount);
                $('.minerT7').text(details);
                $('.minerT8').text(stName);
                $('.minerT9').text(stNow);
                $('.minerT10').text(stAvg);
                $('.minerT11').text(stDiff);
                $('.minerT12').text(stShares);
                $('.minerT13').text(stLucky);
                $('.minerT14').text(stPaid);
                $('.minerT16').text(stTime);
                $('#board').val(Dashboard);
                $('#payouts').val(Payouts);
                $('#rounds').val(Rounds);
                $('.minerT15').val(offline);
                //faq.html
                $('.faqQ1').text(question1);
                $('.faqA1').text(answer1);
                $('.faqQ2').text(question2);
                $('.faqA2').text(answer2);
                $('.faqQ3').text(question3);
                $('.faqA3').text(answer3);
                $('.faqQ4').text(question4);
                $('.faqA4').text(answer4);
                $('.faqQ5').text(question5);
                $('.faqA5').text(answer5);
                $('.faqQ6').text(question6);
                $('.faqA6').text(answer6);
                $('.faqQ7').text(question7);
                $('.faqA7').text(answer7);
                $('.faqQ8').text(question8);
                $('.faqA8').text(answer8);
                $('.faqQ9').text(question9);
                $('.faqA9').text(answer9);
                $('.faqQ10').text(question10);
                $('.faqA10').text(answer10);
                $('.faqQ11').text(question11);
                $('.faqA11').text(answer11);
                $('.faqQ12').text(question12);
                $('.faqA12').text(answer12);
                $('.faqQ13').text(question13);
                $('.faqA13').text(answer13);
                $('.faqQ14').text(question14);
                $('.faqA14').text(answer14);
                $('.faqEnd').text(QAEnd);
     }
    var language
    if(window.localStorage.getItem('userLanguage')){
        language=window.localStorage.getItem('userLanguage');
    }else {
        language=(navigator.language || navigator.browserLanguage).toLowerCase();
    }
    var languages=['zh','en'];
    var currentRule=(function (){
                return i18n_home;
    })()
    languages.forEach(function (value) {

        if(language.indexOf(value)!=-1){
            window.currentLanguage= value;
            jQuery.i18n.properties({
                name: 'strings',
                path: '/static/',
                mode:'both',
                checkAvailableLanguages: true,
                language:value,
                async: true,
                callback: currentRule
            });
            $('.transition.lang>a img').attr('src','/static/country/'+value+'.png');
        }else {
            $('.country-list').append('<a href="javascript:;" class="country"><img src="/static/country/'+value+'.png" alt="" class="flag"></a>');
        }
    });
    window.translate = translate;
    function translate(){
        jQuery.i18n.properties({
            name: 'strings',
            path: '/static/',
            mode:'both',
            checkAvailableLanguages: true,
            language:currentLanguage,
            async: true,
            callback: currentRule
        });
    }
    $(document).on('click','img[src^="/static/country/"]',function () {
        var languageSelected = $(this).attr('src').slice(16,-4);
        window.currentLanguage= languageSelected;
        $('.country-list').html('');
        languages.forEach(function (value) {
            if(languageSelected.indexOf(value)!=-1){
                $('.transition.lang>a img').attr('src','/static/country/'+value+'.png');
            }else {
                $('.country-list').append('<a href="javascript:;" class="country"><img src="/static/country/'+value+'.png" alt="" class="flag"></a>');
            }
        });
        window.localStorage.setItem("userLanguage",languageSelected);
        jQuery.i18n.properties({
            name: 'strings',
            path: '/static/',
            mode:'both',
            checkAvailableLanguages: true,
            language:languageSelected,
            async: true,
            callback: currentRule
        });
    })
})()
