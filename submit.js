let form = document.getElementById("form");
let url = "https://script.google.com/macros/s/AKfycbypwTB8D625tAwUUNW36c194ZxQk2xzBoD1co1tfZcrJ9Em_nhbRyLMTj9s0xHqfg/exec";

let values = ["136314928","1148749992"];

form.addEventListener("submit", function(e) {
    e.preventDefault();

    let link = generateUrl();
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

document.getElementById('submitting').style.display = 'none';

function generateUrl(){
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
                link += "&";
                link += values[i] + "=" + arr[j].value;
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


/*form.addEventListener("submit", (e)=>{
    e.preventDefault();//prevent default behaviour
    //e.stopImmediatePropagation();
    fetch(url,{
        method: "POST",
        mode: "no-cors",
        header:{
            'Content-Type': 'application/json'
            },
        body: getInputData()
    })
    .then(data=>{
        console.log(data);
        alert("Form Submitted");
    })
    .catch(err=>console.error(err)); //promise based
});

//populating input data
function getInputData(){
    let dataToPost = new FormData(); //formdata API

    //fill name attributes to corresponding values
    dataToPost.append("emtr", document.getElementById("select_test").value);
    dataToPost.append("emtr", document.getElementById("select_test2").value);
    //dataToPost.append("entry.294341084", document.getElementById("inp1").value);

    return dataToPost;
}
*/