//식재료 추가

//냉장실 & 냉동실 식재료 추가
var date = new Date();
let yyyy = date.getFullYear() + "";
let mm = date.getMonth() + 1;
mm = mm < 10 ? "0" + mm : mm;
let dd = date.getDate();
dd = dd < 10 ? "0" + dd : dd;
const today = `${yyyy}-${mm}-${dd}`;

// 냉장실에 식재료 추가
// 냉장실에 추가 btn 클릭시,
// 중복 여부 검사
async function checkFresh() {
  let splitFreshName;
  const { value: freshName } = await Swal.fire({
    title: "어떤 식재료를 보관하실건가요?",
    input: "text",
    inputLabel: "이름을 정확하게 입력해주세요",
    confirmButtonColor: "#7E998F",
    showCancelButton: true,
    inputValidator: (value) => {
      return new Promise((resolve) => {
        splitFreshName = value.split(" ").join("");
        // console.log("splitFreshName", splitFreshName);
        axios({
          method: "post",
          url: "/api/v1/fridge/checkFresh",
          data: { name: splitFreshName },
        }).then((response) => {
          // console.log("checkFresh res.data", response.data);
          if (response.data) {
            resolve();
          } else {
            resolve("이미 보관 중인 식재료입니다");
          }
        });
      });
    },
  });
  if (freshName) {
    //입력한 식재료 명 바르게 썼는지 확인
    Swal.fire({
      icon: "info",
      title: splitFreshName,
      text: "입력하신 이름이 맞나요?",
      confirmButtonText: "확인",
      confirmButtonColor: "#7E998F",
      showCancelButton: true,
      preConfirm: () => {
        freshModal(splitFreshName);
      }, //확인 클릭 - 나머지 정보 입력창으로
    });
  }
}
//식재료 정보 입력 받기
async function freshModal(splitFreshName) {
  Swal.fire({
    title: "냉장실에 보관할 재료를 알려주세요",
    html: `
            <span>식재료 이름 : </span>
            <input type="text" class="swal2-input" id="freshName_inp" value="${splitFreshName}" disabled><br>
            <select id="freshCategory_inp" class="swal2-select" style="width:16rem; height:3rem;">
                <option value="NOT" selected>카테고리를 선택해주세요</option>
                <option value="과일">과일</option>
                <option value="채소">채소</option>
                <option value="수산물">수산물</option>
                <option value="육류">육류</option>
                <option value="유제품">유제품</option>
                <option value="기타">기타(완제품 등)</option>
            </select>
            <div id="tfIngdRange" style="margin:1em;">아직 사용하거나 먹지 않았어요</div>
            <input type="range" style="width:70%; margin-top:0; cursor: pointer;" 
                class="swal2-range" id="freshRange_inp" value=100 step=50
                oninput="window.changeRange(this.value);"><br>
            <span>유통기한 : </span>
            <input type="date" style="width:60%;" class="swal2-input" id="freshExpire_inp" min=${today}>`,
    confirmButtonText: "확인",
    confirmButtonColor: "#7E998F",
    showCancelButton: true,
    focusConfirm: false,

    preConfirm: () => {
      const freshRange = Swal.getPopup().querySelector("#freshRange_inp").value;
      const freshExpire =
        Swal.getPopup().querySelector("#freshExpire_inp").value;
      const freshCategory =
        Swal.getPopup().querySelector("#freshCategory_inp").value;

      // console.log("fresh_ct :", freshCategory);

      // input 미입력 시 알림
      if (
        !splitFreshName ||
        freshRange == 0 ||
        !freshExpire ||
        freshCategory == "NOT"
      ) {
        Swal.showValidationMessage(`바르게 입력해주세요`);
      }
      return {
        name: splitFreshName, // 이미 중복check한 식재료명 그대로
        range: freshRange,
        expire: freshExpire,
        category: freshCategory,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //확인 클릭 - DB에 추가
      addToFresh(result);
    } else if (result.isDismissed) {
      //취소 클릭 - 냉장고 page로
      location.href = "/myfridge";
    }
  });
}
// 입력한 정보 fresh DB로 전송&추가
function addToFresh(result) {
  axios({
    method: "post",
    url: "/api/v1/fridge/addToFresh",
    data: {
      name: result.value.name,
      range: result.value.range,
      expire: result.value.expire,
      category: result.value.category,
    },
  }).then((response) => {
    // console.log("post addToFresh res.data : ", response.data);

    Swal.fire({
      icon: "success",
      text: `
        ${result.value.name}(이/가) ${result.value.expire}까지 냉장실에 보관됩니다
        `.trim(),
      confirmButtonText: "확인",
      confirmButtonColor: "#7E998F",
      preConfirm: () => {
        location.href = "/myfridge";
      }, // 입력 확인 btn 클릭 - 냉장고 page로
    });
  });
}

// 냉동실에 식재료 추가
// 냉동실에 추가 btn 클릭시,
// 중복 여부 검사
async function checkFrozen() {
  let splitFrozenName;
  const { value: frozenName } = await Swal.fire({
    title: "어떤 식재료를 보관하실건가요?",
    input: "text",
    inputLabel: "이름을 정확하게 입력해주세요",
    confirmButtonColor: "#7E998F",
    showCancelButton: true,
    inputValidator: (value) => {
      splitFrozenName = value.split(" ").join("");
      return new Promise((resolve) => {
        // console.log("splitFrozenName", splitFrozenName);
        axios({
          method: "post",
          url: "/api/v1/fridge/checkFrozen",
          data: { name: splitFrozenName },
        }).then((response) => {
          // console.log("checkFrozen res.data", response.data);
          if (response.data) {
            resolve();
          } else {
            resolve("이미 보관 중인 식재료입니다");
          }
        });
      });
    },
  });
  if (frozenName) {
    //입력한 식재료 명 바르게 썼는지 확인
    Swal.fire({
      icon: "info",
      title: splitFrozenName,
      text: "입력하신 이름이 맞나요?",
      confirmButtonText: "확인",
      confirmButtonColor: "#7E998F",
      showCancelButton: true,
      preConfirm: () => {
        frozenModal(splitFrozenName);
      }, //확인 클릭 - 나머지 정보 입력창으로
    });
  }
}
function frozenModal(splitFrozenName) {
  Swal.fire({
    title: "냉동실에 보관할 재료를 알려주세요",
    html: `
            <span>식재료 이름 : </span>
            <input type="text" style="margin-bottom:1em;" class="swal2-input" id="frozenName_inp" value="${splitFrozenName}" disabled><br>
            <div id="tfIngdRange" style="margin:1em;">아직 사용하거나 먹지 않았어요</div>
            <input type="range" style="width:70%; margin-top:0; cursor: pointer;" 
                class="swal2-range" id="frozenRange_inp" value=100 step=50
                oninput="window.changeRange(this.value);"><br>
            <span>구매일자 : </span>
            <input type="date" style="width:60%;" class="swal2-input" id="frozenDate_inp" max=${today}>`,
    confirmButtonText: "확인",
    confirmButtonColor: "#7E998F",
    showCancelButton: true,
    focusConfirm: false,
    preConfirm: () => {
      const frozenRange =
        Swal.getPopup().querySelector("#frozenRange_inp").value;
      const frozenDate = Swal.getPopup().querySelector("#frozenDate_inp").value;

      // input 미입력 시 알림
      if (!splitFrozenName || frozenRange == 0 || !frozenDate) {
        Swal.showValidationMessage(`바르게 입력했는지 확인해주세요`);
      }
      return {
        name: splitFrozenName, // 이미 중복check한 식재료명 그대로
        range: frozenRange,
        date: frozenDate,
      };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      //확인 클릭 - DB에 추가
      addToFrozen(result);
    } else if (result.isDismissed) {
      //취소 클릭 - 냉장고 page로
      location.href = "/myfridge";
    }
  });
}
// 입력한 정보 frozen DB로 전송&추가
function addToFrozen(result) {
  axios({
    method: "post",
    url: "/api/v1/fridge/addToFrozen",
    data: {
      name: result.value.name,
      range: result.value.range,
      date: result.value.date,
    },
  }).then((response) => {
    // console.log("post addToFrozen res.data : ", response.data);

    Swal.fire({
      icon: "success",
      text: `
        ${result.value.date}에 구매한 ${result.value.name}(이/가) 냉동실에 보관됩니다`.trim(),
      confirmButtonText: "확인",
      confirmButtonColor: "#7E998F",
      preConfirm: () => {
        location.href = "/myfridge";
      }, // 입력 확인 btn 클릭 - 냉장고 page로
    });
  });
}

// 입력창에서 range 조작에 따라 range bar 상단에 text 노출
window.changeRange = function (value) {
  $("#frozenRange_inp").removeClass("animate__animated animate__shakeX");
  var tfIngdRange = document.getElementById("tfIngdRange");
  if (value == "100") {
    tfIngdRange.innerHTML = "아직 사용하거나 먹지 않았어요";
  } else if (value == "50") {
    tfIngdRange.innerHTML = "사용하거나 먹고 남았어요";
  } else {
    $("#frozenRange_inp").addClass("animate__animated animate__shakeX");
    tfIngdRange.innerHTML =
      "<span style='color:#ED6C67;'>보관할 것이 없어요</span>";
  }
};
