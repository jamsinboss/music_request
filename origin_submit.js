let form = document.getElementById("form");
let url = "https://script.google.com/macros/s/AKfycbz0xDE1DSaDKKl6AvzP6qLoEUFolnYlgo_tEpBb-LVVwYqoHXy2pDe-weEF7dSYeJb4/exec";
let token;

let values = [];
let formName = getParameterByName('form');

function recaptchaCallback() {
    console.log('recaptcha succeed!');
    isWaiting = false;
    setTimeout(function() {
        document.getElementById('recaptcha').style.visibility= 'hidden';
    },1000);
    showForm();
}

$.ajax({

    url: encodeURI(url + "?type=getform&form=" + formName),
    method: "GET",
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
    token = data.token;

    const title = data.title;
    const description = data.description;
    appendForm('<h1>' + title + "</h1>");
    if(description != undefined && description != "")
    {
        appendForm('<ul>');
        const des = description.split('\n');
        for(let i=0;i<des.length;i++) {
            appendForm('<li>' + des[i] + "</li>");
        }
        appendForm('</ul><br/><br/>');
    }

    document.title = title;

    const list = data.items;
    for(let i=0;i<list.length;i++) {
        const item = list[i];
        putItem(item);
    }
    appendForm('<input id="submit" type="submit" value="제출하기" />\n<label id="submitting" style="display:none;">신청곡 제출 중... (최대 10초 소요)</label>');
    showForm();
    console.log(values);
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
    const helpText = item.helpText;
    const id = item.id;
    const type = item.type;
    const extra = item.extra;

    switch(type) {
        case "MULTIPLE_CHOICE": {
            const choices = extra.choices;
            const required = extra.required;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            for(let i=0;i<choices.length;i++)
            {
                const choice = choices[i];
                const value = choice.value;
                appendForm(String.format('<input type="radio" id="{0}_{1}" name="{0}" value="{2}" {3}/>', id, i, value, required ? 'required' : ''));
                appendForm(String.format('<label for="{0}_{1}">{2}</label>', id, i, value.md()));

                //@TODO: extra.hasOtherOption
            }

            values.push({id : id, type : type});
            break;
        }
        case "LIST": {
            const choices = extra.choices;
            const required = extra.required;
            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            
            appendForm(String.format('<select id="{0}" {1}>', id, required ? 'required' : ''));
            appendForm(String.format('<option value="" required selected disabled>선택</option>'));
            for(let i=0;i<choices.length;i++)
            {
                const choice = choices[i];
                const value = choice.value;
                appendForm(String.format('<option value="{0}">{1}</option>', value, value.md()));
            }
            appendForm(String.format('</select>'));
            
            values.push({id : id, type : type});
            break;
        }
        case "CHECKBOX": {
            const choices = extra.choices;
            const required = extra.required;
            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            for(let i=0;i<choices.length;i++)
            {
                const choice = choices[i];
                const value = choice.value;
                appendForm(String.format('<input type="checkbox" id="{0}_{1}" name="{0}" value="{2}" {3}/>', id, i, value, required ? 'required' : ''));
                appendForm(String.format('<label for="{0}_{1}">{2}</label>', id, i, value.md()));
            }
            
            values.push({id : id, type : type});
            break;
        }
        case "TEXT": {
            const required = extra.required;
            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            appendForm(String.format('<input type="text" id="{0}" {1}/>', id, required ? 'required' : ''));
            
            values.push({id : id, type : type});
            break;
        }
        case "PARAGRAPH_TEXT": {
            const required = extra.required;
            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            appendForm(String.format('<textarea id="{0}" {1}></textarea>', id, required ? 'required' : ''));
            
            values.push({id : id, type : type});
            break;
        }
        case "SECTION_HEADER": {
            appendForm(String.format('<label style="font-size: 140%">{0}</label>', title.md()));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            
            values.push({id : id, type : type});
            break;
        }
        case "SCALE": {
            const required = extra.required;
            const lowerBound = extra.lowerBound;
            const upperBound = extra.upperBound;
            const leftLabel = extra.leftLabel;
            const rightLabel = extra.rightLabel;

            const width = 50;
            
            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));
            appendForm(String.format('<input type="range" id="{0}" min="{1}" max="{2}" value="-1" step="1" list="mark_{0}" style="appearance: auto; width: {3}%" {4}/>',
                id, lowerBound, upperBound, width, required ? 'required' : ''))
            
            appendForm(String.format('<datalist id="mark_{0}" style="display: flex; width: {1}%; justify-content: space-between;"">', id, width));
            for(var i=lowerBound;i<=upperBound;i++) {
                appendForm(String.format('<option value="{0}" {1}></option>', i,
                    i == lowerBound || i == upperBound ? "label=\"" + 
                        (i == lowerBound ? leftLabel.md() : rightLabel.md()) + "\""
                    : ""));
            }
            appendForm(String.format('</datalist>'));
            
            values.push({id : id, type : type});
            break;
        }
        case "GRID": {
            const required = extra.required;
            const rows = extra.rows;
            const columns = extra.columns;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<table><th>'));
            for(var i=0;i<columns.length;i++) {
                appendForm(String.format('<td><label>{0}</label></td>', columns[i].md()));
            }
            appendForm(String.format('</th>'));

            for(var i=0;i<rows.length;i++) {
                appendForm(String.format('<tr><td><label>{0}</label></td>', rows[i].md()));
                for(var j=0;j<columns.length;j++) {
                    appendForm(String.format('<td><input type="radio" id="{0}_{1}_{2}" name="{0}_{1}" value="{3}" {4}/><label for="{0}_{1}_{2}"></td>', id, i, j, columns[j],
                        required ? 'required' : ''));
                }
                appendForm(String.format('</tr>'));
            }
            appendForm(String.format('</table>'));
            
            values.push({id : id, type : type, rowLength : rows.length});
            break;
        }
        case "CHECKBOX_GRID": {
            const required = extra.required;
            const rows = extra.rows;
            const columns = extra.columns;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<table><th>'));
            for(var i=0;i<columns.length;i++) {
                appendForm(String.format('<td><label>{0}</label></td>', columns[i].md()));
            }
            appendForm(String.format('</th>'));

            for(var i=0;i<rows.length;i++) {
                appendForm(String.format('<tr><td><label>{0}</label></td>', rows[i].md()));
                for(var j=0;j<columns.length;j++) {
                    appendForm(String.format('<td><input type="checkbox" id="{0}_{1}_{2}" name="{0}_{1}" value="{3}" {4}/><label for="{0}_{1}_{2}"></td>', id, i, j, columns[j],
                        required ? 'required' : ''));
                }
                appendForm(String.format('</tr>'));
            }
            appendForm(String.format('</table>'));
            
            values.push({id : id, type : type, rows : rows});
            break;
        }
        case "DATE": {
            const required = extra.required;
            const includesYear = extra.includesYear;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<input type="date" id="{0}" name="{0}" {1} {2}/>', id,
                includesYear ? 'min="2021-01-01" max="2021-12-31"' : '',
                required ? 'required' : ''));
            
            appendForm(String.format('<br/>'));

            values.push({id : id, type : type});
            break;
        }
        case "DATETIME": {
            const required = extra.required;
            const includesYear = extra.includesYear;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<input type="datetime-local" id="{0}" name="{0}" {1} {2}/>', id,
                includesYear ? 'min="2021-01-01" max="2021-12-31"' : '',
                required ? 'required' : ''));
            appendForm(String.format('<br/>'));

            values.push({id : id, type : type});
            break;
        }
        case "TIME": {
            const required = extra.required;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<input type="time" id="{0}" name="{0}" step="1" {1}/>', id, required ? 'required' : ''));
            appendForm(String.format('<br/>'));

            values.push({id : id, type : type});
            break;
        }
        case "DURATION": {
            const required = extra.required;

            appendForm(String.format('<label style="font-size: 120%">{0}{1}</label>', title.md(), !required ? ' (선택)' : ''));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<input type="time" id="{0}" name="{0}" {1}/>', id, required ? 'required' : ''));
            appendForm(String.format('<br/>'));

            values.push({id : id, type : type});
            break;
        }
        case "IMAGE": {
            const image = extra.image;
            const imageType = extra.imageType;
            const alignment = extra.alignment;
            
            appendForm(String.format('<label style="font-size: 120%">{0}</label>', title.md()));
            if(helpText != undefined) appendForm(String.format('<label>{0}</label>', helpText));

            appendForm(String.format('<div style="display: flex; justify-content: {0}">', alignment));
            appendForm(String.format('<img src="{0}" loading="lazy" style="width: 70%;"/>', 
                String.format('data:{0};base64,{1}', imageType, image)));
            appendForm(String.format('</div><br/>'));

            values.push({id : id, type : type});
            break;
        }
        default: {
            console.log(item);
            throw new Error('no type: ' + type);
        }
    }
    appendForm('<br/><hr/>');
}

const parser = new DOMParser();
let waiting = "";
let isWaiting = true;
function appendForm(str) {
    waiting = waiting.concat(str)
}
function showForm() {
    if(!isWaiting) form.insertAdjacentHTML('beforeend', waiting);
}

function markdown(str) {
    str = str.replace(/[\*]{2}([^\*\*]+)[\*]{2}/g, "<b>$1</b>");
    str = str.replace(/[\_]{2}([^\*\*]+)[\_]{2}/g, "<u>$1</u>");
    str = str.replace(/[\~]{2}([^\*\*]+)[\~]{2}/g, "<del>$1</del>");
    str = str.replace(/[\_]{1}([^\*\*]+)[\_]{1}/g, "<i>$1</i>");
    str = str.replace(/[\*]{1}([^\*\*]+)[\*]{1}/g, "<i>$1</i>");

    return str;
}

function genSubmitUrl(){
    let link = url;
    link += "?type=submit&form=" + formName + "&token=" + token;
    for(let i=0;i<values.length;i++)
    {
        let value = values[i];
        console.log(i);

        let id = value.id;
        let type = value.type;

        console.log(id);
        console.log(type);

        switch(type)
        {
            case "MULTIPLE_CHOICE":
            case "CHECKBOX":{
                let elements = document.querySelectorAll(String.format('input[name="{0}"]:checked', id));
                for(let j=0;j<elements.length;j++) {
                    link += String.format('&{0}={1}', id, elements[j].value);
                }
                break;
            }
            case "DATE":
            case "DATETIME":
            case "TIME":
            case "DURATION":
            case "LIST":
            case "TEXT": 
            case "PARAGRAPH_TEXT":
            case "SCALE": {
                let element = document.getElementById(id);
                link += String.format('&{0}={1}', id, element.value);
                break;
            }
            case "GRID": {
                for(let j=0;j<value.rowLength;j++) {
                    let elements = document.querySelectorAll(String.format('input[name="{0}_{1}"]:checked', id, j));
                    for(let k=0;k<elements.length;k++) {
                        link += String.format('&{0}={1}', id, elements[k].value);
                    }
                }
                break;
            }
            case "CHECKBOX_GRID": {
                let rows = value.rows;
                let result = [];
                for(let j=0;j<rows.length;j++) {
                    let arr = [];
                    let elements = document.querySelectorAll(String.format('input[name="{0}_{1}"]:checked', id, j));
                    for(let k=0;k<elements.length;k++) {
                        arr.push(elements[k].value); 
                    }
                    result.push(arr);
                }
                link += String.format('&{0}={1}', id, JSON.stringify(result));
                break;
            }
            case "SECTION_HEADER": 
            case "IMAGE":
                break;
            default: {
                throw new Error("no support for " + type + i);
            }
        }

        /*let element = document.getElementById(value.id);
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
            let arr = document.querySelectorAll('input[id=\"' + values[i] + '\"]:checked');
            if(arr.length == 0) emptyAnswer();
            for(let j=0;j<arr.length;j++) {
                link += "&" + values[i] + "=" + arr[j].value;
            }
        }*/
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
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}
String.prototype.md = function () {
    return markdown(this);
}

function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}