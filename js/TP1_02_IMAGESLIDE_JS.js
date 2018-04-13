/* 전역변수 */
var slideReady        = "ready"; // 슬라이드버튼 연속클릭 방지를 위한 변수
var slideSpeed        = 2000;
var currentSlideIndex = 1;
var imageWidth;
var imageSize;
var timer;
var $unOrderedList;

$(document).ready(function() {
  /* 전역변수 초기화 */
  $unOrderedList = $('ul.album');
  imageWidth = $(window).width(); // 이미지의 크기는 브라우저의 width로 함
  imageSize =  $unOrderedList.children().length;
  /* 이미지 li태그의 ul과 이미지의 크기설정 */
  $unOrderedList.css('width', imageWidth * 5);
  /* 타이머 설정 */
  timer = setInterval(autoSlide, slideSpeed);
  /* 이벤트 바인드 */
  imageEventBind();
  rollButtonEventBind();
  nextPrevButtonEventBind();
});

/* 이미지슬라이드 반응형 웹페이지 설정 */
$(window).resize(function(){
  imageWidth = $(window).width();
  $unOrderedList.css('width', imageWidth * 5);   // ul의 width를 재설정
  $unOrderedList.css('left', -((currentSlideIndex - 1) * imageWidth)+'px'); // 이미지 슬라이드의 위치 재설정
});

/* 이미지슬라이드's 이미지 이벤트 바인트 */
function imageEventBind(){
  $unOrderedList.children().bind({
    'mouseenter': function(){ //마우스 올렸을 때
      clearInterval(timer);
    },
    'mouseleave': function(){ //마우스 내렸을 때
      clearInterval(timer);
      timer = setInterval(autoSlide, slideSpeed);
    }
  });
}

/* 롤 버튼 이벤트 바인드 */
function rollButtonEventBind(){
  $('.btn-roll').children().bind({
    'click': function(){
      currentSlideIndex = $('.btn-roll').children().index(this); // 인덱스를 재설정
      clearInterval(timer); // 슬라이드를 넘기는 동안 잠깐 타이머를 멈춤
      autoSlide(); // 슬라이드를 넘김
      timer = setInterval(autoSlide, slideSpeed); // 멈추었던 타이머를 재설정
      return false;
    },
    'mouseenter': function(){ // 마우스오버 시 타이머 제거
      clearInterval(timer);
    },
    'mouseleave': function(){ // 마우스가 떠날 시 타이머 재설정
      clearInterval(timer);
      timer = setInterval(autoSlide, slideSpeed);
    }
  });
}

/* 슬라이드 애니메이션, 롤버튼 설정 */
function autoSlide(){
  if(currentSlideIndex > imageSize - 1) //index가 이미지의 개수를 넘으면 첫번째 이미지의 인덱스로 초기화
    currentSlideIndex = 0;
  if(currentSlideIndex < 0) //index가 0미만이면 마지막 이미지의 인덱스로 초기화
    currentSlideIndex = imageSize - 1;
  slideSetNotReady();
  $unOrderedList.animate({'left': -(currentSlideIndex * imageWidth)+'px' },'normal', slideSetReady);

  var source2 = $('.btn-roll').children().find('img').attr('src').replace('_.png','.png');
  $('.btn-roll').children().find('img').attr('src',source2);

  var source = $('.btn-roll').children().find('img').attr('src').replace('.png','_.png');
  $('.btn-roll').children().eq(currentSlideIndex).find('img').attr('src',source);

  currentSlideIndex++;
}

/* 이미지 슬라이드 좌우 버튼 이벤트 */
function nextPrevButtonEventBind(){
  var $prev = $('#prev_button');
  var $next = $('#next_button');

  $next.bind('click', function(){ //next버튼 클릭시
    if(slideReady == "ready"){
      clearInterval(timer); //타이머 초기화
      autoSlide();
      timer = setInterval(autoSlide, slideSpeed);
    }
  });

  $prev.bind('click', function(){ //prev버튼 클릭시
    if(slideReady == "ready"){
      currentSlideIndex -= 2;
      clearInterval(timer); //타이머 초기화
      autoSlide();
      timer = setInterval(autoSlide, slideSpeed);
    }
  });
}

/* 연속클릭 방지를 위한 변수의 setter */
function slideSetReady(){
  slideReady = "ready";
}
function slideSetNotReady(){
  slideReady = "notReady";
}

/* 이미지 슬라이드 종료 */
