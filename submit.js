let form = document.getElementById("form");
let url = "https://script.google.com/macros/s/AKfycbxN6JXVz9syaOinbyyMPBBbfPI4xGeOEO45kLyTBqEl3xwrPyw3NO1R7-ne41EXfHu0WA/exec";

let values = ["1254892316","9967857","885727560","879878790","19351438"]
//{"1254892316":["옵션 1"],"9967857":["옵션 2"],"885727560":["옵션 3"],"879878790":["test4"],"19351438":["test5\\ntest6"]}


form.addEventListener("submit", (e) => {
    let link = generateUrl();
    //alert(link);
    console.log(link);
    e.preventDefault();
    fetch(link,{
        method: "GET",
        mode: "no-cors"
    })
    .then(data=>{
        console.log(data);
        alert("Form Submitted");
    })
    .catch(err=>console.error(err)); //promise based
})

function generateUrl(){
    let link = url;
    for(let i=0;i<values.length;i++) {
        if(i==0) link += "?";
        else link += "&";
        link += values[i] + "=" + document.getElementById(values[i]).value;
    }
    return link.replaceAll(" ","%20");
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