let form = document.getElementById("form");
let url = "https://script.google.com/macros/s/AKfycbypwTB8D625tAwUUNW36c194ZxQk2xzBoD1co1tfZcrJ9Em_nhbRyLMTj9s0xHqfg/exec";

let values = [];

$.ajax({

    url: encodeURI(url + "?type=getitem&grade=" + form.name),
    type: 'GET',
    crossDomain: true,
    success: function(data) {
        console.log(data);
        handleData(data);
    },
    error: function(err) {
        console.log(err);
        alert(err); 
    }
});

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let link = genSubmitUrl();
    console.log(link);
    console.log(encodeURI(link));

    document.getElementById('submit').style.display = 'none';
    document.getElementById('submitting').style.display = '';

    fetch(encodeURI(link),{
        method: "GET",
        mode: "no-cors"
    })
    .then(function(data) {
        console.log(data);
        alert("신청곡이 제출되었습니다. 감사합니다!");
        location.reload();
    })
    .catch(function(err) {
        console.error(err)
        alert(err);
    }); //promise based
})

function handleData(data) {
    for(let i=0;i<data.length;i++) {
        const item = data[i];
        putItem(item);
        values.push(item.id);
    }
    appendForm('<input id="submit" type="submit" value="제출하기" />\n<label id="submitting" style="display:none;">신청곡 제출 중... (최대 10초 소요)</label>');
}

/*
    <label>객관식 질문</label>
    <input type="radio" id="1612639005_0" name="1612639005" value="옵션 1"/>
    <label for="1612639005_0">옵션 1</label>
    <input type="radio" id="1612639005_1" name="1612639005" value="옵션 2"/>
    <label for="1612639005_1">옵션 2</label>
    <input type="radio" id="1612639005_2" name="1612639005" value="옵션 3"/>
    <label for="1612639005_2">옵션 3</label>
    <br/>

    <label>체크박스 (선택)</label>
    <input type="checkbox" id="952767580_0" name="952767580" value="옵션 1"/>
    <label for="952767580_0">옵션 1</label>
    <input type="checkbox" id="952767580_1" name="952767580" value="옵션 2"/>
    <label for="952767580_1">옵션 2</label>
    <input type="checkbox" id="952767580_2" name="952767580" value="옵션 3"/>
    <label for="952767580_2">옵션 3</label>
    <br/>

    <label>드롭다운</label>
    <select id=233597431>
        <option value="옵션 1">옵션 1</option>
        <option value="옵션 2">옵션 2</option>
        <option value="옵션 3">옵션 3</option>
        <option value="드롭다운은 기타가 없어요!">드롭다운은 기타가 없어요!</option>
    </select>
    <br/>

    <label>단답형</label>
    <input type="text" id="513039129" />
    <br/>

    <label>장문형 (5글자 이상)</label>
    <textarea id="450978290"></textarea>
    <br/>
*/

function putItem(item) {
    const title = item.title;
    const id = item.id;
    const type = item.type;
    const extra = item.extra;

    switch(type) {
        case "TEXT":
            var required = extra.required;
            appendForm(String.format('<label>{0}{1}</label>', title, !required ? ' (선택)' : ''));
            appendForm(String.format('<input type="text" id="{0}" {1}/>', id, !required ? 'name="optional" ' : ''));
            break;
        case "PARAGRAPH_TEXT":
            var required = extra.required;
            appendForm(String.format('<label>{0}{1}</label>', title, !required ? ' (선택)' : ''));
            appendForm(String.format('<textarea id="{0}" {1}/>', id, !required ? 'name="optional" ' : ''));
            break;
        default:
            console.log(item);
            throw new Error('no type: ' + type);
    }
    appendForm('<br/>');
    values.push(id);
}

const parser = new DOMParser();
let waiting = [];
let isWaiting = true;
function appendForm(str) {
    if(isWaiting) waiting.push(str);
    else form.insertAdjacentHTML('beforeend', str);
}

function recaptchaCallback() {
    console.log('recaptcha succeed!');
    isWaiting = false;
    setTimeout(function() {
        document.getElementById('recaptcha').style.visibility= 'hidden';
    },1000);
    while(waiting.length > 0)
    {
        appendForm(waiting[0]);
        waiting.shift();
    }
}

function genSubmitUrl(){
    let link = url;
    link += "?grade=" + form.name;
    for(let i=0;i<values.length;i++)
    {
        console.log(i);

        let element = document.getElementById(values[i]);
        if(element != undefined)
        {
            var value;
            if(element.value.length == 0)
            {
                if(element.name == "optional") value = "";
                else emptyAnswer();
            }
            else value = element.value;
            link += "&" + values[i] + "=" + value;
        }
        else
        {
            let arr = document.querySelectorAll('input[name=\"' + values[i] + '\"]:checked');
            if(arr.length == 0) emptyAnswer();
            for(let j=0;j<arr.length;j++) {
                link += "&" + values[i] + "=" + arr[j].value;
            }
        }
    }
    try {
        return link.replaceAll(" ","%20").replaceAll("\n","%0D%0A");
    } catch (err) { // internet explorer
        return link.replace(/" "/gi,"%20").replace(/"\n"/gi,"%0D%0A");
    }
}

function emptyAnswer() {
    alert("모든 값을 입력해주세요");
    throw new Error("no value");
}

String.format = function() {
    let args = arguments;
    return args[0].replace(/{(\d+)}/g, function(match, num) {
        num = Number(num) + 1;
        return typeof(args[num]) != undefined ? args[num] : match;
    });
}

function getParam(sname) {
    var params = location.search.substr(location.search.indexOf("?") + 1);
    var sval = "";
    params = params.split("&");
    for (var i = 0; i < params.length; i++) {
        temp = params[i].split("=");
        if ([temp[0]] == sname) { sval = temp[1]; }
    }
    return sval;
}