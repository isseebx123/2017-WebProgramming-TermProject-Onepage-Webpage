/* 전역변수 */
var hamburgerReady = "ready"; /* 햄버거버튼 연속클릭 방지를 위한 변수 */
var bodyMarginTop;

$(document).ready(function() {
  /* 전역변수 초기화 */
  bodyMarginTop = $("body").css('margin-top').replace(/[^-\d\.]/g,'');
  /* 이벤트 바인드 */
  hamburgerEventBind();
  MenuButtonEventBind();
  dropdownListClickEventBind();
});

/* 메뉴버튼 클릭 시 이벤트 바인드 */
function MenuButtonEventBind(){
  $(".Menu").click(function(){
    var target = $(this).attr('value');
    if (target == "HOME") target = $(body);
    else target = $("." + target);
    moveWindowWithElement(target);
  });
}

/* 드랍다운리스트 클릭 시 이벤트 바인드 */
function dropdownListClickEventBind(){
  var $dropdownList = $("#dropdown_bar ul li");
  var menuArray = ['Home', 'ImageSlide', 'Introduce', 'Gallery', 'Guestbook'];
  $dropdownList.click(function(){
    var index = $dropdownList.index(this);
    var target = menuArray[index];
    if (target == "HOME") target = $(body);
    else target = $("."+target);
    moveWindowWithElement(target);
  });
}

/* 해당 target의 top위치로 윈도우 이동 */
function moveWindowWithElement(target){
    var topPosition = target.offset().top; //set target's top position
    $('html, body').animate({scrollTop : topPosition - bodyMarginTop}, 400); //move to
}

/* 햄버거버튼 이벤트 바인드 */
function hamburgerEventBind(){
  $('.menu-trigger').each(function(){
  	var $this = $(this);
  	$this.on('click', function(e){
      if(hamburgerReady == "ready"){
        /* 햄버거버튼의 모양을 "X"로 변경 */
        e.preventDefault();
        $(this).toggleClass('active');
        //햄버거버튼 연속클릭 방지
        hamburgerSetNotReady();
        /* 클릭 시 드랍다운바를 올리거나 내림, 연속클릭을 방지 */
        var dropdown_bar = $("#dropdown_bar");
        if(dropdown_bar.css("height") != '0px')
          dropdown_bar.animate({height: 0}, 500, hamburgerSetReady);
        else
          dropdown_bar.animate({height: 140}, 1000, hamburgerSetReady);
  	  }
  })
  });
}

/* 연속클릭 방지를 위한 setter */
function hamburgerSetReady(){
  hamburgerReady = "ready";
}
/* 연속클릭 방지를 위한 setter */
function hamburgerSetNotReady(){
  hamburgerReady = "notReady";
}
