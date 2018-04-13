var $modal;
var $modal_image;
var modalImageIndex;
var totalImageSize;

$(document).ready(function() {
  /* 전역변수 초기화 */
  $modal         = $("div.modal");
  $modal_image   = $("#modal-img");
  totalImageSize = $(".Gallery").children().length;
  /* 이벤트 바인드 */
  mouseOverEventBind();
  modalEventBind();
  modalButtonEventBind();
  x_buttonClickEventBind();
  /* Local Storage를 이용하여 삭제 된 이미지 정보 관리 */
  for(var i = 0; i < totalImageSize; i++){
    if(localStorage.getItem('image' + i) != "removed")
      $(".Gallery").children().eq(i).css("display", "inline-block");
  }
  // localStorage.clear(); // local storage 저장값을 모두 삭제
});

/* 마우스 오버했을 때, 떠날 때 이벤트 바인드 */
function mouseOverEventBind(){
  var eventBoxWrap = $(".eventBox-wrap");
  eventBoxWrap.bind({
    'mouseenter': function(){ //마우스 올렸을 때
      /* 현재 이벤트가 발생한 div를 fadeIn함, image투명도 변경 */
      var $thisEventBox = $(this).closest("div").find(".eventBox");
      $thisEventBox.fadeIn('normal').css("display", "table");
      $(this).find('img').animate({opacity : '0.4'}, 1000);
    },
    'mouseleave': function(){ //마우스 내렸을 때
      /* 현재 이벤트가 발생한 div를 fadeOut함, image투명도 변경 */
      var $thisEventBox = $(this).closest("div").find(".eventBox");
      $thisEventBox.fadeOut('normal');
      $(this).find('img').animate({opacity : '1'}, 1000);
    }
  });
}

/* 이미지를 클릭했을 때 이벤트 바인드, 모달창을 팝업 */
function modalEventBind(){
  var $imgList = $(".gallery-imgs");
  $imgList.bind({
    'click': function(){
      modalImageIndex = $imgList.index(this); //이미지리스트에서 클릭한 이미지의 인덱스를 구함
      changeModalImage();
      $modal.css("display", "block") //모달창 팝업
      modalClickEventBind(); //모달창 생성시 모달클릭이벤트 바인드
    },
  });
}

/* 모달창 팝업 시 클릭 이벤트 바인드 */
function modalClickEventBind(){
  $("body").click(function(e){
    if($modal.css("display") == "block"){
      /* modal-content이외에 클릭 시 모달창 종료 */
      if(e.target.className == "modal" || e.target.className == "modal-wrap"){
        $modal.css("display", "none"); //모달창 종료
        $('body').unbind('click'); //클릭이벤트 바인드 제거
      }
    }
  });
}

/* 모달창 버튼 이벤트 바인드 */
function modalButtonEventBind(){
  $("#m_prev_button").click(function(){
    do { // x_button으로 제거된 이미지가 아닌경우 반복문 탈출
      modalImageIndex--; // 화면에 표시할 이미지의 인덱스
      if(modalImageIndex < 0) // 0보다 작으면 최대인덱스(마지막이미지)로 설정
        modalImageIndex = totalImageSize - 1;
    } /* 모두 삭제된 경우에는 버튼 클릭불가능하므로 무한루프 생각안해도 됨. */
    while(localStorage.getItem('image' + modalImageIndex) == "removed");
    changeModalImage();
  });
  $("#m_next_button").click(function(){
    do { // x_button으로 제거된 이미지가 아닌경우 반복문 탈출
      modalImageIndex++;
      if(modalImageIndex > totalImageSize - 1)
        modalImageIndex = 0;
    } /* 모두 삭제된 경우에는 버튼 클릭불가능하므로 무한루프 생각안해도 됨. */
    while(localStorage.getItem('image' + modalImageIndex) == "removed");
    changeModalImage();
  });
}

/* 이미지 삭제 구현 & 로컬 스토리지에 정보 저장 */
function x_buttonClickEventBind(){
  var $x_buttonList = $(".x_button");
  $x_buttonList.bind({
    'click':function(){
      var removedDiv = $(this).closest("div");
      removedDiv.fadeOut('normal');
      // Local storage에 삭제된 이미지에 대한 정보저장
      localStorage.setItem('image' + removedDiv.index(),'removed');
    }
  });
}

/* modal창의 이미지를 modalImageIndex 인덱스의 이미지로 교체 */
function changeModalImage(){
  $modal_image.css("display", "none");
  $modal_image.attr("src", $(".gallery-imgs:eq(" + modalImageIndex + ")").attr("src")); //클릭한 이미지의 src를 모달창의 img src로 설정
  $modal_image.fadeIn('normal');
}
