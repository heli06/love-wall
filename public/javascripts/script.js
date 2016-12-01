
//cookie相关函数
function setCookie(c_name,value,expiredays)
{
    var exdate=new Date();
    exdate.setDate(exdate.getDate()+expiredays);
    document.cookie=c_name+ "=" +escape(value)+
        ((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}

function getCookie(c_name)
{
    if (document.cookie.length>0)
    {
        var c_start = document.cookie.indexOf(c_name + "=");
        if (c_start!=-1)
        {
            c_start=c_start + c_name.length+1;
            var c_end=document.cookie.indexOf(";",c_start);
            if (c_end==-1) c_end=document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end))
        }
    }
    return ""
}

//轮播图轮播速度
$(function () {
    $('.carousel').carousel({
        interval: 4000
    })
});

//设置cookie保存网页皮肤
$(function () {
    var style = getCookie('style');
    if (style == null) {
        setCookie('style', 0, 30);
    }
    if( style == 0){
        $("#style").attr("href","/stylesheets/style.css");
        $("#login").attr("href","/stylesheets/login.css");
        $("#nav").attr("href","/stylesheets/nav.css");
    }else{
        $("#style").attr("href","/stylesheets/style1.css");
        $("#login").attr("href","/stylesheets/login1.css");
        $("#nav").attr("href","/stylesheets/nav1.css");
    }

    $('#style-change').click(function () {
        if(style == 1)
            style = 0;
        else
            style = 1;
        setCookie('style', style, 30);
        window.location.reload();
    })
});

//飘花瓣的函数
$(function () {
    if($("#style").attr("href") == "/stylesheets/style.css"){
        $(document).snowfall('clear');
        $(document).snowfall({
            image: "/images/huaban.png",
            flakeCount:30,
            minSize: 5,
            maxSize: 22
        });
    }
});

//表白贴格式
$(function () {
    var posttext = document.getElementsByClassName('posttext');
    var newtext = [];
    var i;

    for(i = 0; i < posttext.length; i++){
        //将<,>转义，防止XSS攻击
        posttext[i].textContent = posttext[i].textContent.replace(/\</g, "&lt");
        posttext[i].textContent = posttext[i].textContent.replace(/\>/g, "&gt");
        newtext = posttext[i].textContent.split('#');
        if( newtext[4].indexOf("匿名") > -1 ) {
            posttext[i].innerHTML = "<h3>" + "TO:"  + newtext[1]
                + "</h3><p>"
                + newtext[2] + "</p><h3 style='text-align: right'>" +
                "FROM:" + newtext[4] + "</h3>";
        }else{
            posttext[i].innerHTML = "<h3>" + "TO:" + newtext[1]
                + "</h3><p>"
                + newtext[2] + "</p><h3 style='text-align: right'>" +
                "FROM:"  + newtext[4]  + "</h3>";
        }
    }
});

//根据cookie保存的皮肤类型，设置信纸和轮播图片类型
$(function () {
    var style = getCookie('style');
    if(style == 0){
        var letterbg = new Array(5);
        letterbg[0] = "../images/letter/1.jpg";
        letterbg[1] = "../images/letter/2.jpg";
        letterbg[2] = "../images/letter/3.jpg";
        letterbg[3] = "../images/letter/4.jpg";
        letterbg[4] = "../images/letter/5.jpg";
        var post = document.getElementsByClassName("post");
        for(i = 0; i < post.length; i++){
            post[i].style.backgroundImage = "url(" + letterbg[Math.floor(Math.random()*5)] + ")";
        }
    }else{
        var imgs = new Array(3);
        imgs[0] = "../images/carousel/11.jpg";
        imgs[1] = "../images/carousel/12.jpg";
        imgs[2] = "../images/carousel/13.jpg";

        var carousel_imgs = document.getElementsByClassName("carousel-img");
        for(var i = 0; i < carousel_imgs.length; i++){
            carousel_imgs[i].src = imgs[i];
        }
    }
});

//分页功能，未能完成
// $(function () {
//     var pageArray = [];
//
//     var liCount = $('.post').length;//获取获取记录条数
//     var PageSize  = 9;//设置每页，你准备显示几条
//     var PageCount  = Math.ceil(liCount/PageSize);//计算出总共页数
//     var currentPage = 1;//设置当前页
//
//     $('<li><a href="#">Prev</a></li>').appendTo('.pagination ul');
//
//     var i=0;
//     for(i=1; i<=PageCount; i++){
//         $('<li><a href="#" pageNum="'+i+'" >'+i+'</a></li>').appendTo('.pagination ul');//显示分页按钮
//     }
//
//     $('<li><a href="#">Next</a></li></ul>').appendTo('.pagination ul');
//
//     var $post =  $('.post');
//     $post.each(function(){
//         pageArray.push(this);
//     });
//
//     for(i=0;i<10;i++){
//         $('#postPage').append(pageArray[i]);
//     }
//
//     function showPage(whichPage){
//         $('#postPage').innerHTML('');
//         for(i = (whichPage-1)*10; i < 10*whichPage ; i++){
//             $('#postPage').append(pageArray[i]);
//         }
//     }
//     var a;
//     $('a').click(function(){
//         a = $(this).attr('pagenum');
//         showPage(a);
//     });
// });

//发言框的显示、隐藏
$(function () {
    var $post_modal = $(".post-modal");

    $(".post-button").click(function () {
        if($post_modal.hasClass("post-hidden")){
            $post_modal.removeClass("post-hidden");
            $post_modal.addClass("post-show");
        }else{
            $post_modal.removeClass("post-show");
            $post_modal.addClass("post-hidden");
        }
    });
});

