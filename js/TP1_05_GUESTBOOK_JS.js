$(document).ready(function() {
  /* 이벤트 바인드 */
  hostSubmitEventBind();
});

/* 호스트로 글을 작성 */
function hostSubmitEventBind(){
  /* 등록하기 버튼 클릭 시 이벤트 */
  $("#hostSubmit").click(function() {
    var $writerEdit   = $("#writerEdit");
    var $contentEdit  = $("#contentEdit");
    /* 입력된 값을 받아옴 */
    var writerString  = $writerEdit.val();
    var contentString = $contentEdit.val();
    /* 입력텍스트 초기화 */
    $writerEdit.val("");
    $contentEdit.val("");
    /* 입력된 정보를 이용하여 방명록에 글을 추가, 답글 등록하기 버튼 생성 */
    $("#hostEditRow").before("\
      <tr>\
        <td class = 'leftColumn'>"+"작성자:"+writerString+"</td>\
        <td class = 'replyTd'>"+contentString+"</td>\
      </tr>\
      <tr>\
        <td class = 'buttonTd' colspan = '2'><input class = 'replySubmit' type = 'button' value = '답글 등록하기'></td></td>\
      </tr>");
    replySubmitEventBind(); // 새로운 답글 등록하기 버튼의 event를 bind함
  });
}

/* 답글 등록하기, 방명록에 새로운 글(새로운 답글달기 버튼)이 추가되었을 때 호출 */
function replySubmitEventBind(){
  $(".replySubmit").unbind('click'); //이전 bind와의 중복을 막기위해 unbind함
  /* 답글 등록하기 버튼 클릭 시 이벤트 */
  $(".replySubmit").click(function(){
    var urlArray        = new Array();
    var urlArrayIndex   = 0;
    var replyString     = prompt("답글 내용을 입력하세요"); // User로 부터 값(내용)을 받아옴
    if (replyString == null)  return false; // 취소할 경우 메소드 중지

    var tokenArray      = replyString.split(' '); // 스트링을 토큰별로 분리
    /* 답글태그의 시작되는 스트링과 끝나는 스트링을 미리 저장 */
    var startTagsString = "<td class = 'replyTd' colspan = '2'>" + "답변&nbsp:&nbsp" + replyString;
    var endTagsString   = "</td>";

    /* 분리된 토큰들이 url인지 확인 */
    for(var i=0; i<tokenArray.length; i++){
      if(isUrlString(tokenArray[i])) { //토큰이 url인지 체크, url이라면 아래를 실행
        if(tokenArray[i].substring(0,7) != "http://" && tokenArray[i].substring(0,8) != "https://") {  // http://, https://가 아니면 앞에 붙여줌
          tokenArray[i] = "http://" + tokenArray[i];
        }
        urlArray[urlArrayIndex++] = tokenArray[i];
      }
    }

    /* 답글의 내용을 확인하고 등록 */
    if(urlArray.length != 0) { //url인 토큰이 있을 경우, openGraphProtocol
      getMetadataAndInsertInformation(urlArray, this, startTagsString, endTagsString);
    }
    else { //url인 토큰이 없을 경우, 버튼을 감추고 단순히 출력함.
      $(this).closest("tr").append(startTagsString + endTagsString);
      $(this).closest("td").remove(); //답글 등록하기 버튼이 있는 td태그를 제거
    }
  });
}

/* 정규표현식을 이용하여 url인지 확인 */
function isUrlString(token){
  var urlRegularExpression = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w_\.-]*)*\/?$/;
  if(urlRegularExpression.test(token)) {
    return true;
  }
  return false;
}

/* meataData를 전달받고 정보를 가지는 태그들을 html에 삽입 */
function getMetadataAndInsertInformation(urlArray, that, startTagsString, endTagsString){
  var openGraphProtocolTagsString = ""; // 스레드에서 생성되는 오픈그래프프로토콜의 태그스트링
  var completeCount               = 0;
  var thread                      = new Array();

  for(var i=0; i<urlArray.length; i++) {
    var url = urlArray[i];

    /* CORS 해결 */
    $.ajaxPrefilter(function (options) {
      if (options.crossDomain && jQuery.support.cors) {
        var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
        options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
      }
    });

    /* 각 오픈그래프프로토콜을 스레드를 생성하여 태그를 가진 스트링을 만듬.
       마지막으로 완료되는 스레드가 만들어진 태그를 html에 삽입 */
    thread[i] = $.get(
      url,
      function (response) {
        var metaData = getMetaDataThroughResponse(response); // response를 이용하여 metaData를 추출
        if(metaData != false) { // metadata가 부정확하면 추가하지 않음.
          openGraphProtocolTagsString += makeOpenGraphProtocolTableTagsWithString(metaData);
        }
        completeCount++; // 완료되는 스레드를 카운트 함.
      }).fail(function() {
        completeCount++;
        if (urlArray.length == 1) { // URL주소가 하나 들어왔는데 404 ERROR인 경우
          $(that).closest("tr").append(startTagsString + endTagsString);
          $(that).closest("td").remove(); //답글 등록하기 버튼이 있는 td태그를 제거
        } else if (completeCount == urlArray.length) { // 마지막에 끝나는 thread가 화면에 태그를 삽입
          insertHtmlCodeWithStringAndRemoveTd(that, startTagsString + openGraphProtocolTagsString + endTagsString);
          openGraphProtocolImgEventBind();
        }
      }).done(function() {
        if (completeCount == urlArray.length) { // 마지막에 끝나는 thread가 화면에 태그를 삽입
          insertHtmlCodeWithStringAndRemoveTd(that, startTagsString + openGraphProtocolTagsString + endTagsString);
          openGraphProtocolImgEventBind();
        }
      });
  }
}

/* reponse로 부터 metadata에 대한 정보를 얻어옴. object로 반환 */
function getMetaDataThroughResponse(response){
    var metadata = { // 일반적인 형식의 og Tag를 가지고 있을경우 meta 다음과 같이 필터링함
      title: $(response).filter('meta[property="og:title"]').attr("content"),
      url: $(response).filter('meta[property="og:url"]').attr("content"),
      image: $(response).filter('meta[property="og:image"]').attr("content"),
      description: $(response).filter('meta[property="og:description"]').attr("content")
    };

    /* google metadata 가져오기, google의 og Tag는 기본적인 property로 정의되어있지 않음 */
    if ($(response).filter('title').html() == "Google"){
      metadata["title"] = $(response).filter('title').html();
      metadata["image"] = "http://www.google.com" + $(response).filter('meta[itemprop="image"]').attr("content");
      metadata["description"] = "Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking for.";
      metadata["url"] = "http://www.google.com";
      return metadata;
    }

    /* facebook metadata 가져오기, facebook의 og Tag는 형식이 다르게 저장되어 있음 */
    if(metadata["url"] == "https://www.facebook.com/" || metadata["url"] == "http://www.facebook.com/") {
      metadata["title"] = $(response).filter('meta[property="og:site_name"]').attr("content");
      metadata["description"] = $(response).filter('meta[name="description"]').attr("content");
      return metadata;
    }

    /* 이외 페이지에서 og Tag가 불명확하다면 신뢰성이 없으므로 오픈그래프프로토콜로 출력하지 않음. */
    for(var key in metadata) {
      if (metadata[key] == undefined)
        return false;
    }

    return metadata; // 신뢰성있는 metadata의 오픈그래프프로토콜만 출력
}

/* 오픈그래프프로토콜 테이블 태그를 스트링으로 만들어서 반환 */
function makeOpenGraphProtocolTableTagsWithString(metaData){
    return ("\
          <table class='openGraphProtocol'>\
            <tr>\
              <td class = 'imageDataCell'><img src="+metaData["image"]+"></td>\
              <td class = 'stringDataCell'>\
                <span class = 'ogTitle'>"+metaData["title"]+"</span><br></br>\
                <span class = 'ogDescription'>"+metaData["description"]+"</span><br></br>\
                <a class = 'ogUrl' target = '_blank' href='"+metaData["url"]+"'>"+metaData["url"]+"</a>\
              </td>\
            </tr>\
          </table>");
}

/* 오픈그래프프로토콜 이미지 이벤트 바인드 */
function openGraphProtocolImgEventBind(){
  var $openGraphProtocolImg = $(".openGraphProtocol img");
  $openGraphProtocolImg.unbind('click'); // 이미지 이벤트 바인드의 중복을 막기위해 이전의 것을 unbind
  $openGraphProtocolImg.click(function(){
    var index = $openGraphProtocolImg.index(this);
    var aTag = $openGraphProtocolImg.parent().next().find("a");
    window.open(aTag.eq(index).text(), "_blank");
  });
}

/* 생성한 태그의 스트링을 html에 삽입, 답글버튼이 있던 행을 제거하는 메소드 */
function insertHtmlCodeWithStringAndRemoveTd(that, insertString){
  $(that).closest("tr").append(insertString);
  $(that).closest("td").remove();
}
