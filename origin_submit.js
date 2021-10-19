let form = document.getElementById("form");
let url = "https://script.google.com/macros/s/AKfycbypwTB8D625tAwUUNW36c194ZxQk2xzBoD1co1tfZcrJ9Em_nhbRyLMTj9s0xHqfg/exec";

let values = [];
let grade = getParameterByName('grade');

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

$.ajax({

    url: encodeURI(url + "?type=getitem&grade=" + grade),
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

    
    $.ajax({

        url: encodeURI(link),
        type: 'GET',
        crossDomain: true,
        success: function(data) {
            console.log(data);
            if(data.error != undefined)
                alert("오류가 발생했습니다. 현상이 지속된다면 jamsinboss@gmail.com으로 알려주세요.\n\n" + data.error);
            else
                alert("신청곡이 제출되었습니다. 감사합니다!");
            location.href = "/index.html";
        },
        error: function(err) {
            console.log(err);
            alert("오류가 발생했습니다. 현상이 지속된다면 jamsinboss@gmail.com으로 알려주세요.\n\n" + err); 
        }
    });

    /*fetch(encodeURI(link),{
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
    }); //promise based*/
})

function handleData(data) {
    const title = data.title;
    const description = data.description;
    appendForm('<h1>' + title + "</h1>");
    appendForm('<ul>');
    const des = description.split('\n');
    for(let i=0;i<des.length;i++) {
        appendForm('<li>' + des[i] + "</li>");
    }
    appendForm('</ul><br/><br/>');

    document.title = title;

    const list = data.items;
    for(let i=0;i<list.length;i++) {
        const item = list[i];
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
    else form.insertAdjacentHTML('beforeend', markdown(str));
}

function markdown(str = String) {
    str = str.replaceAll(/[\*]{2}([^\*\*]+)[\*]{2}/g, "<b>$1</b>");
    str = str.replaceAll(/[\_]{2}([^\*\*]+)[\_]{2}/g, "<u>$1</u>");
    str = str.replaceAll(/[\~]{2}([^\*\*]+)[\~]{2}/g, "<del>$1</del>");
    str = str.replaceAll(/[\_]{1}([^\*\*]+)[\_]{1}/g, "<i>$1</i>");
    str = str.replaceAll(/[\*]{1}([^\*\*]+)[\*]{1}/g, "<i>$1</i>");

    return str;
    /*let bold = false;
    let italic = false;
    let underlined = false;
    for(var i=0;i<str.length;i++) {
        console.log(str.substring(i,i+2));
        if(str.substring(i,i+2) == "**")
        {
            if(bold === false)
            {
                str.replaceAt(i,"<strong>");
                bold = true;
                i+=6;
            }
            else
            {
                str.replaceAt(i,"</strong>");
                bold = false;
                i+=7;
            }
        }
        else if(str.substring(i,i+2) == "__")
        {
            if(underlined === false)
            {
                str.replaceAt(i,"<u>");
                underlined = true;
                i+=2;
            }
            else
            {
                str.replaceAt(i,"</u>");
                underlined = false;
                i+=3;
            }
        }
        else if(str.substring(i,i+1) == "*" || str.substring(i,i+1) == "_")
        {
            if(italic === false)
            {
                str.replaceAt(i,"<i>");
                italic = true;
                i+=2;
            }
            else
            {
                str.replaceAt(i,"</i>");
                italic = false;
                i+=3;
            }
        }
    }
    return str;*/
}

function genSubmitUrl(){
    let link = url;
    link += "?type=submit&grade=" + getParameterByName('grade');
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
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}